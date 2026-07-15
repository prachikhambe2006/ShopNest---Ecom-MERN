const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("SMTP Connected");

    await transporter.sendMail({
      from: `"ShopNest Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html: message,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error(error);
  }
};

module.exports = sendEmail;