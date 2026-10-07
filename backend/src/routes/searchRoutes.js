const express = require("express");

const router = express.Router();

const {
  semantic,
  sparse,
  hybrid,
} = require("../controllers/searchController");

const protect = require("../middleware/authMiddleware");

// Dense
router.get(
  "/semantic",
  protect,
  semantic
);

// Sparse
router.get(
  "/sparse",
  protect,
  sparse
);

// Hybrid
router.get(
  "/hybrid",
  protect,
  hybrid
);

module.exports = router;