const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
// Create Product
router.post("/", protect, authorize("Admin", "User"), upload.single("image"), createProduct);
router.get("/", protect, authorize("Admin", "User"), getProducts);
router.get("/:id", protect, authorize("Admin", "User"), getProductById);
router.put(
  "/:id",
  protect,
  authorize("Admin"),
  upload.single("image"),
  updateProduct
);
router.delete("/:id", protect, authorize("Admin"), deleteProduct);
module.exports = router;