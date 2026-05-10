import express from 'express';
import forgotPasswordController from '../controller/forgotPasswordController';
import preventRapidOtp from '../middlewares/otpRateLimiter';

const router = express.Router();

router.get('/forgot-password', (req, res) => res.render('forgotPassword', {
    message: req.query.message || null,
    success: req.query.success === 'true',
    email: req.query.email || '',
}));
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
router.post('/api/auth/reset-password',  forgotPasswordController.resetPassword);

export default router;