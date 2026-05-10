const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { sendOtpEmail } = require("../config/mailer");
const { User, Otp } = require("../models");

const OTP_LENGTH = 6;

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const getOtpExpiry = () => {
  const minutes = Number(process.env.OTP_EXPIRES_MINUTES || 10);
  return new Date(Date.now() + minutes * 60 * 1000);
};

const register = (payload) =>
  new Promise(async (resolve, reject) => {
    try {
      const { email, password } = payload;
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return reject(createError(409, "Email already registered"));
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        passwordHash,
        isVerified: false,
        role: "user"
      });

      const otp = generateOtp();
      await Otp.destroy({ where: { userId: user.id, type: "register" } });
      await Otp.create({
        userId: user.id,
        codeHash: hashOtp(otp),
        type: "register",
        expiresAt: getOtpExpiry()
      });

      await sendOtpEmail({
        to: email,
        subject: "Verify your account",
        otp
      });

      return resolve({ message: "Registration successful. Please verify OTP." });
    } catch (error) {
      return reject(error);
    }
  });

const verifyOtp = (payload) =>
  new Promise(async (resolve, reject) => {
    try {
      const { email, otp } = payload;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return reject(createError(404, "User not found"));
      }

      const otpRecord = await Otp.findOne({
        where: { userId: user.id, type: "register" },
        order: [["createdAt", "DESC"]]
      });

      if (!otpRecord) {
        return reject(createError(400, "OTP not found"));
      }

      const isExpired = otpRecord.expiresAt < new Date();
      const isMatch = otpRecord.codeHash === hashOtp(otp);

      if (!isMatch || isExpired) {
        return reject(createError(400, "Invalid or expired OTP"));
      }

      user.isVerified = true;
      await user.save();
      await Otp.destroy({ where: { id: otpRecord.id } });

      return resolve({ message: "Account verified" });
    } catch (error) {
      return reject(error);
    }
  });

const login = (payload) =>
  new Promise(async (resolve, reject) => {
    try {
      const { email, password } = payload;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return reject(createError(401, "Invalid credentials"));
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return reject(createError(401, "Invalid credentials"));
      }

      if (!user.isVerified) {
        return reject(createError(403, "Account not verified"));
      }

      const token = jwt.sign(
        { role: user.role },
        process.env.JWT_SECRET,
        { subject: String(user.id), expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
      );

      const redirectUrl = user.role === "admin" ? "/admin/profile" : "/user/profile";

      return resolve({
        accessToken: token,
        redirectUrl
      });
    } catch (error) {
      return reject(error);
    }
  });

const forgotPassword = (payload) =>
  new Promise(async (resolve, reject) => {
    try {
      const { email } = payload;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return resolve({ message: "If the email exists, an OTP has been sent" });
      }

      const otp = generateOtp();
      await Otp.destroy({ where: { userId: user.id, type: "reset" } });
      await Otp.create({
        userId: user.id,
        codeHash: hashOtp(otp),
        type: "reset",
        expiresAt: getOtpExpiry()
      });

      await sendOtpEmail({
        to: email,
        subject: "Reset your password",
        otp
      });

      return resolve({ message: "OTP sent to email" });
    } catch (error) {
      return reject(error);
    }
  });

const resetPassword = (payload) =>
  new Promise(async (resolve, reject) => {
    try {
      const { email, otp, password } = payload;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return reject(createError(404, "User not found"));
      }

      const otpRecord = await Otp.findOne({
        where: { userId: user.id, type: "reset" },
        order: [["createdAt", "DESC"]]
      });

      if (!otpRecord) {
        return reject(createError(400, "OTP not found"));
      }

      const isExpired = otpRecord.expiresAt < new Date();
      const isMatch = otpRecord.codeHash === hashOtp(otp);

      if (!isMatch || isExpired) {
        return reject(createError(400, "Invalid or expired OTP"));
      }

      user.passwordHash = await bcrypt.hash(password, 10);
      await user.save();
      await Otp.destroy({ where: { id: otpRecord.id } });

      return resolve({ message: "Password updated" });
    } catch (error) {
      return reject(error);
    }
  });

module.exports = { register, verifyOtp, login, forgotPassword, resetPassword };
