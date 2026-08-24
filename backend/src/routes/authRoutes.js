const express = require("express");

const router = express.Router();

const {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// Register User
router.post("/register", register);

// Login User
router.post("/login", login);

// Google Login / Signup
router.post("/google", googleLogin);
// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.post("/reset-password/:token", resetPassword);

module.exports = router;