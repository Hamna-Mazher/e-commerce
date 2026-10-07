const {
  pool,
} = require("../../config/pgd");

// =====================================================
// LOOKUP / READ TOOLS
// =====================================================

const lookupTools = [
  // ===================================================
  // FIND USER
  // ===================================================

  {
    type: "function",

    name: "find_user",

    description:
      "Find users by name or email. Use this when a user's name or email needs to be resolved to an actual database user.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        search: {
          type: "string",

          description:
            "User name or email to search for.",
        },
      },

      required: [
        "search",
      ],

      additionalProperties: false,
    },
  },

  // ===================================================
  // FIND PRODUCT
  // ===================================================

  {
    type: "function",

    name: "find_product",

    description:
      "Find products by name. Use this when a product name needs to be resolved to an actual product ID.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        search: {
          type: "string",

          description:
            "Product name to search for.",
        },
      },

      required: [
        "search",
      ],

      additionalProperties: false,
    },
  },

  // ===================================================
  // LIST PRODUCTS
  // ===================================================

  {
    type: "function",

    name: "list_products",

    description:
      "List products from the product catalog. Use this when the user asks what products exist, asks to see the product catalog, or asks for multiple products.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        search: {
          type: [
            "string",
            "null",
          ],

          description:
            "Optional product name search. Use null to list all products.",
        },

        limit: {
          type: "integer",

          description:
            "Maximum number of products to return. Maximum 20.",
        },
      },

      required: [
        "search",
        "limit",
      ],

      additionalProperties: false,
    },
  },

  // ===================================================
  // LIST ORDERS
  // ===================================================

  {
    type: "function",

    name: "list_orders",

    description:
      "List orders. Admins can view all orders. Normal users can only view their own orders. Use this when the user asks what orders exist, asks for recent orders, or asks to see their orders.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        limit: {
          type: "integer",

          description:
            "Maximum number of orders to return. Maximum 20.",
        },

        status: {
          type: [
            "string",
            "null",
          ],

          description:
            "Optional order status filter. Use null for all statuses.",
        },
      },

      required: [
        "limit",
        "status",
      ],

      additionalProperties: false,
    },
  },

  // ===================================================
  // LIST TASKS
  // ===================================================

  {
    type: "function",

    name: "list_tasks",

    description:
      "List tasks. Admins can view all tasks. Normal users can only view tasks belonging to themselves. Use this when the user asks about tasks, pending tasks, completed tasks, or their tasks.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        limit: {
          type: "integer",

          description:
            "Maximum number of tasks to return. Maximum 20.",
        },

        status: {
          type: [
            "string",
            "null",
          ],

          description:
            "Optional task status filter such as Pending, In Progress, or Completed. Use null for all statuses.",
        },
      },

      required: [
        "limit",
        "status",
      ],

      additionalProperties: false,
    },
  },
];

// =====================================================
// EXECUTE LOOKUP TOOL
// =====================================================

const executeLookupTool = async ({
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
      typeof rawArguments ===
      "string"
        ? JSON.parse(
            rawArguments
          )
        : rawArguments;
  } catch {
    throw new Error(
      "Invalid lookup tool arguments."
    );
  }

  // ===================================================
  // FIND USER
  // ===================================================

  if (
    name === "find_user"
  ) {
    if (
      !args.search ||
      !args.search.trim()
    ) {
      throw new Error(
        "User search text is required."
      );
    }

    const result =
      await pool.query(
        `
        SELECT
          id,
          name,
          email,
          role
        FROM users
        WHERE
          name ILIKE $1
          OR email ILIKE $1
        ORDER BY name ASC
        LIMIT 10
        `,
        [
          `%${args.search.trim()}%`,
        ]
      );

    return {
      type: "user_lookup",

      count:
        result.rows.length,

      results:
        result.rows,
    };
  }

  // ===================================================
  // FIND PRODUCT
  // ===================================================

  if (
    name === "find_product"
  ) {
    if (
      !args.search ||
      !args.search.trim()
    ) {
      throw new Error(
        "Product search text is required."
      );
    }

    const result =
      await pool.query(
        `
        SELECT
          id,
          name,
          price,
          category,
          image
        FROM products
        WHERE name ILIKE $1
        ORDER BY name ASC
        LIMIT 10
        `,
        [
          `%${args.search.trim()}%`,
        ]
      );

    return {
      type:
        "product_lookup",

      count:
        result.rows.length,

      results:
        result.rows,
    };
  }

  // ===================================================
  // LIST PRODUCTS
  // ===================================================

  if (
    name === "list_products"
  ) {
    const limit = Math.min(
      Math.max(
        Number(args.limit) || 10,
        1
      ),
      20
    );

    const search =
      args.search?.trim() || "";

    const result =
      await pool.query(
        `
        SELECT
          id,
          name,
          description,
          price,
          category,
          image,
          "createdAt"
        FROM products
        WHERE name ILIKE $1
        ORDER BY "createdAt" DESC
        LIMIT $2
        `,
        [
          `%${search}%`,
          limit,
        ]
      );

    return {
      type:
        "product_list",

      count:
        result.rows.length,

      results:
        result.rows,
    };
  }

  // ===================================================
  // LIST ORDERS
  // ===================================================

  if (
    name === "list_orders"
  ) {
    const limit = Math.min(
      Math.max(
        Number(args.limit) || 10,
        1
      ),
      20
    );

    let result;

    // -----------------------------------------------
    // ADMIN → ALL ORDERS
    // -----------------------------------------------

    if (
      user.role === "Admin"
    ) {
      result =
        await pool.query(
          `
          SELECT
            orders.id,
            orders."orderNumber",
            orders.quantity,
            orders.total,
            orders.status,
            orders."createdAt",

            products.name AS "productName",

            users.id AS "userId",
            users.name AS "orderedBy",
            users.email AS "userEmail"

          FROM orders

          INNER JOIN products
            ON orders."productId" =
               products.id

          INNER JOIN users
            ON orders."userId" =
               users.id

          WHERE
            orders."deletedAt" IS NULL

            AND (
              $1::TEXT IS NULL
              OR orders.status = $1
            )

          ORDER BY
            orders."createdAt" DESC

          LIMIT $2
          `,
          [
            args.status || null,
            limit,
          ]
        );
    }

    // -----------------------------------------------
    // USER → OWN ORDERS ONLY
    // -----------------------------------------------

    else {
      result =
        await pool.query(
          `
          SELECT
            orders.id,
            orders."orderNumber",
            orders.quantity,
            orders.total,
            orders.status,
            orders."createdAt",

            products.name AS "productName"

          FROM orders

          INNER JOIN products
            ON orders."productId" =
               products.id

          WHERE
            orders."userId" = $1

            AND orders."deletedAt" IS NULL

            AND (
              $2::TEXT IS NULL
              OR orders.status = $2
            )

          ORDER BY
            orders."createdAt" DESC

          LIMIT $3
          `,
          [
            user.id,
            args.status || null,
            limit,
          ]
        );
    }

    return {
      type:
        "order_list",

      count:
        result.rows.length,

      results:
        result.rows,
    };
  }

  // ===================================================
  // LIST TASKS
  // ===================================================

  if (
    name === "list_tasks"
  ) {
    const limit = Math.min(
      Math.max(
        Number(args.limit) || 10,
        1
      ),
      20
    );

    let result;

    // -----------------------------------------------
    // ADMIN → ALL TASKS
    // -----------------------------------------------

    if (
      user.role === "Admin"
    ) {
      result =
        await pool.query(
          `
          SELECT
            tasks.id,
            tasks.title,
            tasks.description,
            tasks.status,
            tasks.priority,
            tasks."dueDate",
            tasks."createdAt",

            users.id AS "userId",
            users.name AS "createdByName",
            users.email AS "createdByEmail"

          FROM tasks

          INNER JOIN users
            ON tasks."createdBy" =
               users.id

          WHERE
            (
              $1::TEXT IS NULL
              OR tasks.status = $1
            )

          ORDER BY
            tasks."createdAt" DESC

          LIMIT $2
          `,
          [
            args.status || null,
            limit,
          ]
        );
    }

    // -----------------------------------------------
    // USER → OWN TASKS ONLY
    // -----------------------------------------------

    else {
      result =
        await pool.query(
          `
          SELECT
            id,
            title,
            description,
            status,
            priority,
            "dueDate",
            "createdAt"

          FROM tasks

          WHERE
            "createdBy" = $1

            AND (
              $2::TEXT IS NULL
              OR status = $2
            )

          ORDER BY
            "createdAt" DESC

          LIMIT $3
          `,
          [
            user.id,
            args.status || null,
            limit,
          ]
        );
    }

    return {
      type:
        "task_list",

      count:
        result.rows.length,

      results:
        result.rows,
    };
  }

  // ===================================================
  // UNKNOWN TOOL
  // ===================================================

  throw new Error(
    `Unknown lookup tool: ${name}`
  );
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  lookupTools,
  executeLookupTool,
};