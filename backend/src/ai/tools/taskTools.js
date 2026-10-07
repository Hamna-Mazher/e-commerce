const { pool } = require("../../config/pgd");

// =====================================================
// AI TASK TOOL DEFINITIONS
// =====================================================

const taskTools = [
  // ===================================================
  // CREATE TASK
  // ===================================================

  {
    type: "function",

    name: "create_task",

    description:
      "Create a new task. The authenticated user is automatically used as the task creator. Use this only when the user explicitly asks to create a task.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        title: {
          type: "string",

          description:
            "Task title.",
        },

        description: {
          type: "string",

          description:
            "Task description. Use an empty string when no description is provided.",
        },

        status: {
          type: "string",

          description:
            "Task status. Allowed values: Todo, In Progress, Done.",

          enum: [
            "Todo",
            "In Progress",
            "Done",
          ],
        },

        priority: {
          type: "string",

          description:
            "Task priority. Allowed values: Low, Medium, High.",

          enum: [
            "Low",
            "Medium",
            "High",
          ],
        },

        dueDate: {
          type: [
            "string",
            "null",
          ],

          description:
            "Task due date in a valid date/time format. Use null when no due date is provided.",
        },
      },

      required: [
        "title",
        "description",
        "status",
        "priority",
        "dueDate",
      ],

      additionalProperties: false,
    },
  },

  // ===================================================
  // UPDATE TASK
  // ===================================================

  {
    type: "function",

    name: "update_task",

    description:
      "Update an existing task. Only modify fields explicitly requested by the user.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        id: {
          type: "integer",

          description:
            "Task ID.",
        },

        title: {
          type: [
            "string",
            "null",
          ],

          description:
            "New task title. Use null if unchanged.",
        },

        description: {
          type: [
            "string",
            "null",
          ],

          description:
            "New task description. Use null if unchanged.",
        },

        status: {
          type: [
            "string",
            "null",
          ],

          enum: [
            "Todo",
            "In Progress",
            "Done",
            null,
          ],

          description:
            "New task status. Use null if unchanged.",
        },

        priority: {
          type: [
            "string",
            "null",
          ],

          enum: [
            "Low",
            "Medium",
            "High",
            null,
          ],

          description:
            "New task priority. Use null if unchanged.",
        },

        dueDate: {
          type: [
            "string",
            "null",
          ],

          description:
            "New due date. Use null if unchanged or when the user wants no due date.",
        },
      },

      required: [
        "id",
        "title",
        "description",
        "status",
        "priority",
        "dueDate",
      ],

      additionalProperties: false,
    },
  },

  // ===================================================
  // DELETE TASK
  // ===================================================

  {
    type: "function",

    name: "delete_task",

    description:
      "Delete an existing task. Use this only when the user explicitly asks to delete a task.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        id: {
          type: "integer",

          description:
            "Task ID to delete.",
        },
      },

      required: [
        "id",
      ],

      additionalProperties: false,
    },
  },
];

// =====================================================
// EXECUTE TASK TOOL
// =====================================================

const executeTaskTool = async ({
  name,
  arguments: rawArguments,
  user,
}) => {
  // ===================================================
  // AUTHENTICATION
  // ===================================================

  if (!user) {
    throw new Error(
      "Authenticated user is required."
    );
  }

  // ===================================================
  // PARSE ARGUMENTS
  // ===================================================

  let args;

  try {
    args =
      typeof rawArguments === "string"
        ? JSON.parse(rawArguments)
        : rawArguments;
  } catch (error) {
    throw new Error(
      "Invalid task tool arguments."
    );
  }

  // ===================================================
  // CREATE TASK
  // ===================================================

  if (name === "create_task") {
    if (
      !args.title ||
      !String(args.title).trim()
    ) {
      throw new Error(
        "Task title is required."
      );
    }

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
        String(args.title).trim(),

        args.description || "",

        args.status || "Todo",

        args.priority || "Medium",

        args.dueDate || null,

        user.id,
      ]
    );

    return {
      success: true,

      action: "create_task",

      message:
        "Task created successfully.",

      task:
        result.rows[0],
    };
  }

  // ===================================================
  // UPDATE TASK
  // ===================================================

  if (name === "update_task") {
    if (!args.id) {
      throw new Error(
        "Task ID is required."
      );
    }

    const existing =
      await pool.query(
        `
        SELECT *
        FROM tasks
        WHERE id = $1
        `,
        [args.id]
      );

    if (
      existing.rows.length === 0
    ) {
      throw new Error(
        "Task not found."
      );
    }

    const current =
      existing.rows[0];

    const title =
      args.title !== null
        ? args.title
        : current.title;

    const description =
      args.description !== null
        ? args.description
        : current.description;

    const status =
      args.status !== null
        ? args.status
        : current.status;

    const priority =
      args.priority !== null
        ? args.priority
        : current.priority;

    const dueDate =
      args.dueDate !== null
        ? args.dueDate
        : current.dueDate;

    const result =
      await pool.query(
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
          args.id,
        ]
      );

    return {
      success: true,

      action: "update_task",

      message:
        "Task updated successfully.",

      task:
        result.rows[0],
    };
  }

  // ===================================================
  // DELETE TASK
  // ===================================================

  if (name === "delete_task") {
    if (!args.id) {
      throw new Error(
        "Task ID is required."
      );
    }

    const result =
      await pool.query(
        `
        DELETE FROM tasks
        WHERE id = $1
        RETURNING *
        `,
        [args.id]
      );

    if (
      result.rows.length === 0
    ) {
      throw new Error(
        "Task not found."
      );
    }

    return {
      success: true,

      action: "delete_task",

      message:
        "Task deleted successfully.",

      task:
        result.rows[0],
    };
  }

  throw new Error(
    `Unknown task tool: ${name}`
  );
};

module.exports = {
  taskTools,
  executeTaskTool,
};