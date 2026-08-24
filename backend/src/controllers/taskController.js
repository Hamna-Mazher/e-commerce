const { pool } = require("../config/pgd");

// =====================================================
// CREATE TASK
// =====================================================

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO tasks
      (
        title,
        description,
        status,
        priority,
        "dueDate",
        "createdBy"
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        title,
        description || "",
        status || "Todo",
        priority || "Medium",
        dueDate || null,
        req.user.id,
      ]
    );

    res.status(201).json({
      message: "Task created successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Create Task Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL TASKS
// =====================================================

const getAllTasks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        tasks.*,
        users.name AS "creatorName",
        users.email AS "creatorEmail"
      FROM tasks
      LEFT JOIN users
        ON tasks."createdBy" = users.id
      ORDER BY tasks."createdAt" DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get Tasks Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE TASK
// =====================================================

const getTaskById = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        tasks.*,
        users.name AS "creatorName",
        users.email AS "creatorEmail"
      FROM tasks
      LEFT JOIN users
        ON tasks."createdBy" = users.id
      WHERE tasks.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get Task Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE TASK
// =====================================================

const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        title = $1,
        description = $2,
        status = $3,
        priority = $4,
        "dueDate" = $5,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
      [
        title,
        description || "",
        status,
        priority,
        dueDate || null,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task updated successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Update Task Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// DELETE TASK
// =====================================================

const deleteTask = async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};