const express = require("express");
const { body } = require("express-validator");

const { validate } = require("../middlewares/validate");
const authController = require("../controllers/authController");

const router = express.Router();

const passwordRules = body("password")
  .isString()
  .isLength({ min: 8 })
  .matches(/[a-z]/)
  .matches(/[A-Z]/)
  .matches(/[0-9]/)
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Password must be at least 8 characters and include upper, lower, number, special");

router.post(
  "/register",
  [body("email").isEmail().normalizeEmail(), passwordRules],
  validate,
  authController.register
);

router.post(
  "/verify-otp",
  [
    body("email").isEmail().normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric()
  ],
  validate,
  authController.verifyOtp
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").isString()],
  validate,
  authController.login
);

router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  validate,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("email").isEmail().normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
    passwordRules
  ],
  validate,
  authController.resetPassword
);

module.exports = router;
