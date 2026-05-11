import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import authController from '../controller/authController';

const router = express.Router();

// Limit login attempts to reduce brute-force and abuse.
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).json({
            message: 'Too many login attempts. Please try again later.',
        });
    },
});

// Validate login input before it reaches the controller.
const loginValidation = [
    body('email')
        .notEmpty()
        .withMessage('Email is required.')
        .isEmail()
        .withMessage('Email is not valid.'),
    body('password')
        .notEmpty()
        .withMessage('Password is required.'),
];

const validateLogin = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Invalid input data.',
            errors: errors.array(),
        });
    }
    return next();
};

// POST /api/auth/login
router.post('/login', loginRateLimiter, loginValidation, validateLogin, authController.login);

export default router;
