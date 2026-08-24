const protect = require("../middleware/authMiddleware");
const express = require("express");
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const router = express.Router();

// Create Task
router.post("/", protect, createTask);
// Get All Tasks
router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
module.exports = router;