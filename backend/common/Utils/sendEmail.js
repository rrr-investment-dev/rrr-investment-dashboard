import nodemailer from "nodemailer";
import AppErrorClass from "./AppErrorClass.js";

const sendEmail = async (options) => {
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
