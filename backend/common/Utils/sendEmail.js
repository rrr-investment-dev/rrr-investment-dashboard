// import { Resend } from "resend";
import nodemailer from "nodemailer";
import AppErrorClass from "./AppErrorClass.js";

const sendEmail = async (options) => {
  /*
  // ------------------------------------------------------------------
  // OPTION 1: RESEND HTTP API (Works on Render Free Tier)
  // ------------------------------------------------------------------
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY in .env");
    console.log(process.env.RESEND_API_KEY);

    throw new AppErrorClass("Email server configuration error", 500);
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      // Resend requires you to send FROM a verified domain you own.
      // For testing, you can use their default sandbox email: onboarding@resend.dev
      // Note: onboarding@resend.dev can ONLY send emails to the email address you signed up to Resend with!
      from: `"${process.env.EMAIL_FROM_NAME || "RRR Investments"}" <${process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev"}>`,
      to: [options.email],
      subject: options.subject,
      text: options.message,
      html: options.html,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new AppErrorClass("Failed to send email via Resend", 500);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw new AppErrorClass("There was an error sending the email. Try again later!", 500);
  }
  */
  
  // ------------------------------------------------------------------
  // OPTION 2: NODEMAILER SMTP (Requires Paid Render Plan)
  // ------------------------------------------------------------------
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.error("Missing EMAIL_USERNAME or EMAIL_PASSWORD in .env");
    throw new AppErrorClass("Email server configuration error", 500);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD.replace(/\s+/g, ""),
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "RRR Investments"}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new AppErrorClass("There was an error sending the email. Try again later!", 500);
  }
};

export default sendEmail;
