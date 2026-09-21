import catchAsync from "../../../common/Utils/catchAsync.js";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";
import * as careersService from "./careers.service.js";
import { processUpload, deleteFile } from "../../../common/Utils/upload.util.js";
import fs from "fs";
import path from "path";
import sendEmail from "../../../common/Utils/sendEmail.js";

// --- Admin Careers CRUD Handlers ---

export const addCareer = catchAsync(async (req, res, next) => {
  const { title, department, location, jobType, experience, education, description, requirements, benefits } = req.body;

  if (!title || !department || !location || !jobType || !experience || !description) {
    return next(new AppErrorClass("Required fields: title, department, location, jobType, experience, description", 400));
  }

  let requirementsParsed = [];
  try {
    if (requirements) requirementsParsed = typeof requirements === "string" ? JSON.parse(requirements) : requirements;
  } catch (err) {}

  let benefitsParsed = [];
  try {
    if (benefits) benefitsParsed = typeof benefits === "string" ? JSON.parse(benefits) : benefits;
  } catch (err) {}

  const career = await careersService.createCareerService({
    title,
    department,
    location,
    jobType,
    experience,
    education,
    description,
    requirements: requirementsParsed,
    benefits: benefitsParsed,
  });

  res.status(201).json({
    status: "success",
    message: "Job opening created successfully",
    data: career,
  });
});

export const getCareers = catchAsync(async (req, res, next) => {
  const careers = await careersService.getCareersService();

  res.status(200).json({
    status: "success",
    message: "Careers fetched successfully",
    count: careers.length,
    data: careers,
  });
});

export const getCareerById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const career = await careersService.getCareerByIdService(id);

  if (!career) {
    return next(new AppErrorClass("Job opening not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Job opening fetched successfully",
    data: career,
  });
});

export const updateCareer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, department, location, jobType, experience, education, description, requirements, benefits } = req.body;

  const existingCareer = await careersService.getCareerByIdService(id);
  if (!existingCareer) {
    return next(new AppErrorClass("Job opening not found", 404));
  }

  let requirementsParsed = existingCareer.requirements;
  try {
    if (requirements) requirementsParsed = typeof requirements === "string" ? JSON.parse(requirements) : requirements;
  } catch (err) {}

  let benefitsParsed = existingCareer.benefits;
  try {
    if (benefits) benefitsParsed = typeof benefits === "string" ? JSON.parse(benefits) : benefits;
  } catch (err) {}

  const career = await careersService.updateCareerService(id, {
    title,
    department,
    location,
    jobType,
    experience,
    education,
    description,
    requirements: requirementsParsed,
    benefits: benefitsParsed,
  });

  res.status(200).json({
    status: "success",
    message: "Job opening updated successfully",
    data: career,
  });
});

export const toggleCareerStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return next(new AppErrorClass("isActive must be true or false", 400));
  }

  const career = await careersService.toggleCareerStatusService(id, isActive);

  if (!career) {
    return next(new AppErrorClass("Job opening not found", 404));
  }

  if (career.alreadySame) {
    return res.status(200).json({
      status: "success",
      message: `Job opening is already ${isActive ? "active" : "inactive"}`,
    });
  }

  res.status(200).json({
    status: "success",
    message: `Job opening ${isActive ? "activated" : "deactivated"} successfully`,
    data: career,
  });
});

export const deleteCareer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const career = await careersService.getCareerByIdService(id);

  if (!career) {
    return next(new AppErrorClass("Job opening not found", 404));
  }

  await careersService.deleteCareerService(id);

  res.status(200).json({
    status: "success",
    message: "Job opening deleted successfully",
  });
});


// --- Public Careers Handlers ---

export const getCareersPublic = catchAsync(async (req, res, next) => {
  const careers = await careersService.getActiveCareersService();

  res.status(200).json({
    status: "success",
    message: "Active job openings fetched successfully",
    count: careers.length,
    data: careers,
  });
});

export const getCareerByIdPublic = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const career = await careersService.getCareerByIdService(id);

  if (!career || !career.isActive) {
    return next(new AppErrorClass("Active job opening not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Job opening fetched successfully",
    data: career,
  });
});


// --- Candidate Applications Handlers ---

export const submitApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params; // careerId
  const { name, email, phone, coverLetter } = req.body;

  if (!name || !email || !phone) {
    return next(new AppErrorClass("Name, email, and phone number are required", 400));
  }

  if (!req.file) {
    return next(new AppErrorClass("Resume file upload is required", 400));
  }

  const career = await careersService.getCareerByIdService(id);
  if (!career || !career.isActive) {
    return next(new AppErrorClass("Job opening is no longer active or does not exist", 404));
  }

  const resumePath = await processUpload(req.file, "resumes", false);

  const application = await careersService.createApplicationService({
    careerId: id,
    name,
    email,
    phone,
    resume: resumePath,
    coverLetter: coverLetter || "",
  });

  // Send notification email to HR in the background
  try {
    const backendUrl = `${req.protocol}://${req.get("host")}`;
    const resumeDownloadUrl = resumePath.startsWith("http")
      ? resumePath
      : `${backendUrl}${resumePath.startsWith("/") ? "" : "/"}${resumePath}`;

    const attachments = [];
    if (req.file) {
      if (resumePath.startsWith("http")) {
        attachments.push({
          filename: req.file.originalname || "resume.pdf",
          path: resumePath,
        });
      } else {
        const absoluteLocalPath = path.resolve(process.cwd(), resumePath);
        if (fs.existsSync(absoluteLocalPath)) {
          attachments.push({
            filename: req.file.originalname || "resume.pdf",
            path: absoluteLocalPath,
          });
        }
      }
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
        <div style="text-align: center; border-bottom: 2px solid #00338D; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="color: #00338D; margin: 0; font-size: 20px;">New Job Application Received</h2>
          <p style="color: #4a5568; margin: 4px 0 0 0; font-size: 14px;">RRR Investments Careers Portal</p>
        </div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="color: #2d3748; margin-top: 0; border-bottom: 1px solid #edf2f7; padding-bottom: 8px; font-size: 16px;">Candidate Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 120px; color: #4a5568;">Name:</td>
              <td style="padding: 6px 0; color: #1a202c;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Email:</td>
              <td style="padding: 6px 0; color: #1a202c;"><a href="mailto:${email}" style="color: #00338D; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Phone:</td>
              <td style="padding: 6px 0; color: #1a202c;"><a href="tel:${phone}" style="color: #00338D; text-decoration: none;">${phone}</a></td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="color: #2d3748; margin-top: 0; border-bottom: 1px solid #edf2f7; padding-bottom: 8px; font-size: 16px;">Position Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 120px; color: #4a5568;">Role:</td>
              <td style="padding: 6px 0; color: #1a202c; font-weight: bold;">${career.title}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Department:</td>
              <td style="padding: 6px 0; color: #1a202c;">${career.department}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Location:</td>
              <td style="padding: 6px 0; color: #1a202c;">${career.location}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Job Type:</td>
              <td style="padding: 6px 0; color: #1a202c;">${career.jobType}</td>
            </tr>
            ${career.education ? `
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Education:</td>
              <td style="padding: 6px 0; color: #1a202c;">${career.education}</td>
            </tr>
            ` : ""}
          </table>
        </div>

        ${coverLetter ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #2d3748; margin-top: 0; border-bottom: 1px solid #edf2f7; padding-bottom: 8px; font-size: 16px;">Cover Letter / Candidate Notes</h3>
          <p style="color: #4a5568; line-height: 1.6; background-color: #f7fafc; padding: 12px; border-radius: 6px; margin: 0; white-space: pre-wrap; font-size: 14px;">${coverLetter}</p>
        </div>
        ` : ""}

        <div style="text-align: center; margin-top: 32px; border-top: 1px solid #edf2f7; padding-top: 24px;">
          <a href="${resumeDownloadUrl}" style="background-color: #00338D; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">Download Candidate Resume</a>
        </div>
      </div>
    `;

    await sendEmail({
      email: "hr@rrrinvestments.in",
      subject: `New Application: ${name} - ${career.title}`,
      message: `New application received for ${career.title}.\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nResume: ${resumeDownloadUrl}`,
      html: emailHtml,
      attachments,
    });
  } catch (emailErr) {
    console.error("Failed to send HR notification email:", emailErr);
  }

  res.status(201).json({
    status: "success",
    message: "Application submitted successfully",
    data: application,
  });
});

export const getApplications = catchAsync(async (req, res, next) => {
  const { careerId, status } = req.query;

  const filter = {};
  if (careerId) filter.careerId = careerId;
  if (status) filter.status = status;

  const applications = await careersService.getApplicationsService(filter);

  res.status(200).json({
    status: "success",
    message: "Applications fetched successfully",
    count: applications.length,
    data: applications,
  });
});

export const getApplicationsForJob = catchAsync(async (req, res, next) => {
  const { id } = req.params; // careerId
  const applications = await careersService.getApplicationsForCareerService(id);

  res.status(200).json({
    status: "success",
    message: "Applications fetched successfully",
    count: applications.length,
    data: applications,
  });
});

export const getApplicationById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const application = await careersService.getApplicationByIdService(id);

  if (!application) {
    return next(new AppErrorClass("Application not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Application fetched successfully",
    data: application,
  });
});

export const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "reviewed", "shortlisted", "rejected"];
  if (!validStatuses.includes(status)) {
    return next(new AppErrorClass(`Status must be one of: ${validStatuses.join(", ")}`, 400));
  }

  const application = await careersService.updateApplicationStatusService(id, status);

  if (!application) {
    return next(new AppErrorClass("Application not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: `Application status updated to ${status}`,
    data: application,
  });
});

export const deleteApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const application = await careersService.getApplicationByIdService(id);

  if (!application) {
    return next(new AppErrorClass("Application not found", 404));
  }

  if (application.resume) {
    await deleteFile(application.resume);
  }

  await careersService.deleteApplicationService(id);

  res.status(200).json({
    status: "success",
    message: "Application deleted successfully",
  });
});
