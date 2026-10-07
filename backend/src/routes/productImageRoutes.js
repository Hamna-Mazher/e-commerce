const express = require("express");

const router = express.Router();

const {
  createProductWithImage,
  updateProductWithImage,
} = require("../controllers/productImageController");

const protect =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

// Create with selected image
router.post(
  "/create",
  protect,
  authorize("Admin"),
  createProductWithImage
);

// Update with selected image
router.put(
  "/update",
  protect,
  authorize("Admin"),
  updateProductWithImage
);

module.exports = router;