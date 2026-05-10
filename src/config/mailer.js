const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendOtpEmail = async ({ to, subject, otp }) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to,
    subject,
    text: `Your OTP code is: ${otp}. This code expires in ${process.env.OTP_EXPIRES_MINUTES || 10} minutes.`
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
