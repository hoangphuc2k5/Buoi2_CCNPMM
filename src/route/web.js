import express from "express";
import forgotPasswordController from "../controller/forgotPasswordController";
import profileController from "../controller/profileController";
import preventRapidOtp from "../middlewares/otpRateLimiter";
import authMiddleware from "../middlewares/authMiddleware";
import validateUpdateProfile from "../middlewares/validateUpdateProfile";

const router = express.Router();

// Forgot Password Routes
router.get("/forgot-password", (req, res) =>
  res.render("forgotPassword", {
    message: req.query.message || null,
    success: req.query.success === "true",
    email: req.query.email || "",
  }),
);
router.get("/reset-password", (req, res) =>
  res.render("resetPassword", {
    message: req.query.message || null,
    success: req.query.success === "true",
    email: req.query.email || "",
  }),
);
router.post(
  "/api/auth/forgot-password",
  preventRapidOtp,
  forgotPasswordController.forgotPassword,
);
router.post("/api/auth/reset-password", forgotPasswordController.resetPassword);

// Profile Routes
router.get("/profile", authMiddleware, profileController.viewProfile);
router.post(
  "/api/profile/update",
  authMiddleware,
  validateUpdateProfile,
  profileController.updateProfile,
);

export default router;
