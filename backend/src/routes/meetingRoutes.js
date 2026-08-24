const express = require("express");

const router = express.Router();

const {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  softDeleteMeeting,
  deleteMeeting,
} = require("../controllers/meetingController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// =====================================================
// CREATE
// ADMIN ONLY
// =====================================================

router.post(
  "/",
  protect,
  authorize("Admin"),
  createMeeting
);

// =====================================================
// GET ALL
// USER + ADMIN
// User sees only their meetings
// Admin sees all meetings
// =====================================================

router.get(
  "/",
  protect,
  authorize("User", "Admin"),
  getMeetings
);

// =====================================================
// GET SINGLE
// USER + ADMIN
// =====================================================

router.get(
  "/:id",
  protect,
  authorize("User", "Admin"),
  getMeetingById
);

// =====================================================
// UPDATE
// ADMIN ONLY
// =====================================================

router.put(
  "/:id",
  protect,
  authorize("Admin"),
  updateMeeting
);

// =====================================================
// SOFT DELETE
// ADMIN ONLY
// =====================================================

router.patch(
  "/:id/soft-delete",
  protect,
  authorize("Admin"),
  softDeleteMeeting
);

// =====================================================
// HARD DELETE
// ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteMeeting
);

module.exports = router;