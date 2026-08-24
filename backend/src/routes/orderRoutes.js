const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  deleteOrder,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// =====================================================
// CREATE ORDER
// USER ONLY
// =====================================================

router.post(
  "/",
  protect,
  authorize("User"),
  createOrder
);

// =====================================================
// GET ORDERS
// USER + ADMIN
// =====================================================

router.get(
  "/",
  protect,
  authorize("User", "Admin"),
  getOrders
);

// =====================================================
// GET SINGLE ORDER
// USER + ADMIN
// =====================================================

router.get(
  "/:id",
  protect,
  authorize("User", "Admin"),
  getOrderById
);

// =====================================================
// UPDATE STATUS
// USER + ADMIN
// =====================================================

router.put(
  "/:id",
  protect,
  authorize("Admin"),
  updateOrder
);

// =====================================================
// SOFT DELETE / CANCEL
// USER ONLY
// =====================================================

router.patch(
  "/:id/cancel",
  protect,
  authorize("User"),
  cancelOrder
);

// =====================================================
// HARD DELETE
// ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteOrder
);

module.exports = router;