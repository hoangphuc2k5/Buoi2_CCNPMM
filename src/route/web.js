import express from 'express';
import forgotPasswordController from '../controller/forgotPasswordController';
import registerController from '../controller/registerController';
import preventRapidOtp from '../middlewares/otpRateLimiter';
import preventRapidRegisterOtp from '../middlewares/registerRateLimiter';
import { validateRegisterInput, validateVerifyRegisterOtpInput } from '../middlewares/registerValidation';

const router = express.Router();

console.log('web.js da duoc nap voi route register');

router.get('/', (req, res) => res.redirect('/register'));
router.get('/register-health', (req, res) => {
    return res.json({
        success: true,
        message: 'register route dang hoat dong',
        routes: [
            'GET /register',
            'GET /verify-register-otp',
            'POST /api/auth/register',
            'POST /api/auth/verify-register-otp',
        ],
    });
});
router.get('/register', (req, res) => res.render('register'));
router.get('/verify-register-otp', (req, res) => res.render('verifyRegisterOtp'));
router.get('/forgot-password', (req, res) => res.render('forgotPassword', {
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
    success: req.query.success === 'true',
    email: req.query.email || '',
}));
router.get('/reset-password', (req, res) => res.render('resetPassword', {
    message: req.query.message || null,
router.get('/login', (req, res) => {
    console.log('GET /login hit');
    return res.render('login', {
        message: req.query.message || null,
        success: req.query.success === 'true',
        email: req.query.email || '',
    });
});
router.get('/reset-password', (req, res) => res.render('resetPassword', { 
    message: req.query.message || null, 
    success: req.query.success === 'true',
    email: req.query.email || '',
}));
router.post('/api/auth/forgot-password', preventRapidOtp, forgotPasswordController.forgotPassword);
router.post('/api/auth/reset-password', forgotPasswordController.resetPassword);
router.post('/api/auth/register', validateRegisterInput, preventRapidRegisterOtp, registerController.register);
router.post('/api/auth/verify-register-otp', validateVerifyRegisterOtpInput, registerController.verifyRegisterOtp);

export default router;
