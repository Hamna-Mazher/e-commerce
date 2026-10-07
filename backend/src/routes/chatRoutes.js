const express = require("express");

const router = express.Router();

const {
  chat,
} = require("../controllers/chatController");

const {
  getHistory,
  getHistoryById,
  deleteHistory,
} = require("../controllers/chatHistoryController");

const protect = require("../middleware/authMiddleware");

// =====================================================
// CHAT
// =====================================================

router.post(
  "/",
  protect,
  chat
);

// =====================================================
// CHAT HISTORY
// =====================================================

router.get(
  "/history",
  protect,
  getHistory
);

router.get(
  "/history/:id",
  protect,
  getHistoryById
);

router.delete(
  "/history/:id",
  protect,
  deleteHistory
);

module.exports = router;