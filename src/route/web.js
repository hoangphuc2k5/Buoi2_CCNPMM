import express from 'express';
import forgotPasswordController from '../controller/forgotPasswordController';
import profileController from '../controller/profileController';
import registerController from '../controller/registerController';
import authMiddleware from '../middlewares/authMiddleware';
import preventRapidOtp from '../middlewares/otpRateLimiter';
import preventRapidRegisterOtp from '../middlewares/registerRateLimiter';
import { validateRegisterInput, validateVerifyRegisterOtpInput } from '../middlewares/registerValidation';
import validateUpdateProfile from '../middlewares/validateUpdateProfile';

const router = express.Router();

router.get('/', (req, res) => res.redirect('/login'));
router.get('/register', (req, res) => res.render('register'));
router.get('/verify-register-otp', (req, res) => res.render('verifyRegisterOtp'));
router.get('/login', (req, res) => res.render('login', {
  message: req.query.message || null,
  success: req.query.success === 'true',
  email: req.query.email || '',
}));
router.get('/forgot-password', (req, res) => res.render('forgotPassword', {
  message: req.query.message || null,
  success: req.query.success === 'true',
  email: req.query.email || '',
}));
router.get('/reset-password', (req, res) => res.render('resetPassword', {
  message: req.query.message || null,
  success: req.query.success === 'true',
  email: req.query.email || '',
}));
router.get('/profile', authMiddleware, profileController.viewProfile);

router.post('/api/auth/register', validateRegisterInput, preventRapidRegisterOtp, registerController.register);
router.post('/api/auth/verify-register-otp', validateVerifyRegisterOtpInput, registerController.verifyRegisterOtp);
router.post('/api/auth/forgot-password', preventRapidOtp, forgotPasswordController.forgotPassword);
router.post('/api/auth/reset-password', forgotPasswordController.resetPassword);
router.post('/api/profile/update', authMiddleware, validateUpdateProfile, profileController.updateProfile);

export default router;
