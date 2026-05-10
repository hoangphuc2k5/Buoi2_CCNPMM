const express = require("express");
const { body } = require("express-validator");

const { verifyToken } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/profile", verifyToken, userController.getProfile);

router.put(
  "/profile",
  verifyToken,
  [
    body("fullName").optional().isString().isLength({ max: 255 }),
    body("phone").optional().isString().isLength({ max: 30 }),
    body("bio").optional().isString().isLength({ max: 500 }),
  ],
  validate,
  userController.updateProfile,
);

module.exports = router;
