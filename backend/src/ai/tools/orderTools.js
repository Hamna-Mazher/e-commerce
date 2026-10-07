const {
  pool,
} = require("../../config/pgd");

// =====================================================
// OPENAI ORDER TOOL DEFINITIONS
// =====================================================

const orderTools = [
  // ===================================================
  // CREATE ORDER
  // ===================================================

  {
    type: "function",

    name: "create_order",

    description:
      "Place an order for a specific user. Admin only. Use this when the Admin explicitly asks to place an order. The user and product must be resolved to actual database IDs before creating the order.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        userId: {
          type: "integer",

          description:
            "ID of the user who should own the order.",
        },

        productId: {
          type: "integer",

          description:
            "ID of the product being ordered.",
        },

        quantity: {
          type: "integer",

          description:
            "Number of units being ordered.",
        },
      },

      required: [
        "userId",
        "productId",
        "quantity",
      ],

      additionalProperties: false,
    },
  },

  // ===================================================
  // DELETE ORDER
  // ===================================================

  {
    type: "function",

    name: "delete_order",

    description:
      "Permanently delete an order. Admin only. Use only when the Admin explicitly requests order deletion.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        id: {
          type: "integer",

          description:
            "Order ID to permanently delete.",
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
// EXECUTE ORDER TOOL
// =====================================================

const executeOrderTool = async ({
  name,
  arguments: rawArguments,
  user,
}) => {
  // ===================================================
  // SECURITY
  // ===================================================

  if (
    !user ||
    user.role !== "Admin"
  ) {
    throw new Error(
      "Only Admin users can perform order actions through AI."
    );
  }

  // ===================================================
  // PARSE
  // ===================================================

  let args;

  try {
    args =
      typeof rawArguments === "string"
        ? JSON.parse(rawArguments)
        : rawArguments;
  } catch {
    throw new Error(
      "Invalid order tool arguments."
    );
  }

  // ===================================================
  // CREATE ORDER
  // ===================================================

  if (
    name === "create_order"
  ) {
    const {
      userId,
      productId,
      quantity,
    } = args;

    // -----------------------------------------------
    // Validate IDs
    // -----------------------------------------------

    if (
      !Number.isInteger(
        Number(userId)
      )
    ) {
      throw new Error(
        "A valid user ID is required."
      );
    }

    if (
      !Number.isInteger(
        Number(productId)
      )
    ) {
      throw new Error(
        "A valid product ID is required."
      );
    }

    if (
      !Number.isInteger(
        Number(quantity)
      ) ||
      Number(quantity) <= 0
    ) {
      throw new Error(
        "Quantity must be greater than 0."
      );
    }

    // -----------------------------------------------
    // Check User
    // -----------------------------------------------

    const userResult =
      await pool.query(
        `
        SELECT
          id,
          name,
          email,
          role
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

    if (
      userResult.rows.length ===
      0
    ) {
      throw new Error(
        "User not found."
      );
    }

    // -----------------------------------------------
    // Check Product
    // -----------------------------------------------

    const productResult =
      await pool.query(
        `
        SELECT
          id,
          name,
          price
        FROM products
        WHERE id = $1
        `,
        [productId]
      );

    if (
      productResult.rows.length ===
      0
    ) {
      throw new Error(
        "Product not found."
      );
    }

    const product =
      productResult.rows[0];

    // -----------------------------------------------
    // Calculate total
    // -----------------------------------------------

    const total =
      Number(product.price) *
      Number(quantity);

    // -----------------------------------------------
    // Generate order number
    // -----------------------------------------------

    const orderNumber =
      `ORD-${Date.now()}`;

    // -----------------------------------------------
    // Insert
    // -----------------------------------------------

    const result =
      await pool.query(
        `
        INSERT INTO orders
        (
          "orderNumber",
          "userId",
          "productId",
          quantity,
          total,
          status
        )
        VALUES
        ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          orderNumber,
          userId,
          productId,
          Number(quantity),
          total,
          "Pending",
        ]
      );

    return {
      action:
        "create_order",

      success: true,

      order:
        result.rows[0],

      user:
        userResult.rows[0],

      product,
    };
  }

  // ===================================================
  // DELETE ORDER
  // ===================================================

  if (
    name === "delete_order"
  ) {
    if (
      !Number.isInteger(
        Number(args.id)
      )
    ) {
      throw new Error(
        "A valid order ID is required."
      );
    }

    const result =
      await pool.query(
        `
        DELETE FROM orders
        WHERE id = $1
        RETURNING *
        `,
        [args.id]
      );

    if (
      result.rows.length ===
      0
    ) {
      throw new Error(
        "Order not found."
      );
    }

    return {
      action:
        "delete_order",

      success: true,

      order:
        result.rows[0],
    };
  }

  throw new Error(
    `Unknown order tool: ${name}`
  );
};

module.exports = {
  orderTools,
  executeOrderTool,
};