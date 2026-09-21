import Career from "./careers.model.js";
import JobApplication from "./jobApplication.model.js";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";

// --- Job Openings Services ---

export const createCareerService = async (data) => {
  let nextOrder = 1;
  const lastCareer = await Career.findOne()
    .sort({ order: -1 })
    .select("order")
    .lean();

  if (lastCareer?.order != null) {
    nextOrder = lastCareer.order + 1;
  }

  const career = await Career.create({
    ...data,
    order: data.order != null ? data.order : nextOrder,
  });

  if (!career) {
    throw new AppErrorClass("Job opening not created", 500);
  }

  return career;
};

export const getCareersService = async () => {
  const careers = await Career.find().sort({ order: 1 });
  return careers;
};

export const getCareerByIdService = async (id) => {
  const career = await Career.findById(id);
  return career;
};

export const toggleCareerStatusService = async (id, isActive) => {
  const career = await Career.findById(id);

  if (!career) return null;

  if (career.isActive === isActive) {
    return {
      alreadySame: true,
    };
  }

  career.isActive = isActive;
  await career.save();

  return career;
};

export const deleteCareerService = async (id) => {
  const career = await Career.findByIdAndDelete(id);
  return career;
};

export const updateCareerService = async (id, data) => {
  const career = await Career.findByIdAndUpdate(id, data, { new: true });
  return career;
};

export const getActiveCareersService = async () => {
  const careers = await Career.find({ isActive: true }).sort({ order: 1 });
  return careers;
};


// --- Candidate Applications Services ---

export const createApplicationService = async (data) => {
  const application = await JobApplication.create(data);
  if (!application) {
    throw new AppErrorClass("Application submission failed", 500);
  }
  return application;
};

export const getApplicationsForCareerService = async (careerId) => {
  const applications = await JobApplication.find({ careerId }).sort({ createdAt: -1 });
  return applications;
};

export const getApplicationsService = async (filter = {}) => {
  const applications = await JobApplication.find(filter)
    .populate("careerId", "title department location")
    .sort({ createdAt: -1 });
  return applications;
};

export const getApplicationByIdService = async (id) => {
  const application = await JobApplication.findById(id).populate("careerId", "title department location");
  return application;
};

export const updateApplicationStatusService = async (id, status) => {
  const application = await JobApplication.findByIdAndUpdate(id, { status }, { new: true });
  return application;
};

export const deleteApplicationService = async (id) => {
  const application = await JobApplication.findByIdAndDelete(id);
  return application;
};
