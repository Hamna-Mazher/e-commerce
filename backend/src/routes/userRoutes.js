const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUserById,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// =====================================================
// USERS
// Admin only
// =====================================================

router.get(
  "/",
  protect,
  authorize("Admin"),
  getUsers
);

router.get(
  "/:id",
  protect,
  authorize("Admin"),
  getUserById
);

module.exports = router;