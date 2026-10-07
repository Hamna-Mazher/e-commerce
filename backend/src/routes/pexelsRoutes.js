const express = require("express");

const router = express.Router();

const {
  searchPhotos,
} = require("../controllers/pexelsController");

const protect =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

// Admin only
router.get(
  "/search",
  protect,
  authorize("Admin"),
  searchPhotos
);

module.exports = router;