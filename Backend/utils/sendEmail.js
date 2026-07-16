const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendEmail = async ({ email, subject, message }) => {
  try {
    await transporter.sendMail({
      from: `"ShopNest Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html: message,
    });

    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Email Error:", error.message);
  }
};

module.exports = sendEmail;