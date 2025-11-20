import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE === "true",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const sendEmail = async ({ email, subject, html }) => {
  const mailOptions = {
    from: SMTP_FROM || "Your App <no-reply@yourapp.com>",
    to: email,
    subject,
    html, // ← HTML template
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
