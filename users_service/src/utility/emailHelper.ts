import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  token: string
) {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      port: 465,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const source = fs.readFileSync(
      path.join(__dirname, "../templates/requestResetPassword.handlebars"),
      "utf-8"
    );

    const compiledTemplate = Handlebars.compile(source);

    const passwordResetLink = `${process.env.NODE_ENV}/passwordReset?token=${token}&username=${username}`;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Peerprep - Reset Password",
      html: compiledTemplate({ username: username, link: passwordResetLink }),
    });

    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.log(error);
    throw new Error("Unable to send password reset email");
  }
}

export async function sendResetSuccessEmail(email: string, username: string) {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      port: 465,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const source = fs.readFileSync(
      path.join(__dirname, "../templates/resetPasswordSuccess.handlebars"),
      "utf-8"
    );
    const compiledTemplate = Handlebars.compile(source);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Peerprep - Successfully Reset Password",
      html: compiledTemplate({ username: username }),
    });

    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    throw new Error("Unable to send reset success email");
  }
}
