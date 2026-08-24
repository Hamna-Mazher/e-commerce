const { pool } = require("../config/pgd");

// =====================================================
// CREATE ORDER
// USER ONLY
// =====================================================

const createOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        message: "Product and quantity are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    // Get product
    const productResult = await pool.query(
      `
      SELECT id, name, price
      FROM products
      WHERE id = $1
      `,
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = productResult.rows[0];

    // Calculate total on backend
    const total = Number(product.price) * Number(quantity);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    const result = await pool.query(
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
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        orderNumber,
        req.user.id,
        product.id,
        quantity,
        total,
        "Pending",
      ]
    );

    res.status(201).json({
      message: "Order created successfully",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET ORDERS
// USER → OWN ORDERS
// ADMIN → ALL ORDERS
// SERVER-SIDE PAGINATION
// =====================================================

const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    let countResult;
    let result;

    if (req.user.role === "Admin") {
      countResult = await pool.query(`
        SELECT COUNT(*)
        FROM orders
        WHERE "deletedAt" IS NULL
      `);

      result = await pool.query(
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
          ON orders."productId" = products.id

        INNER JOIN users
          ON orders."userId" = users.id

        WHERE orders."deletedAt" IS NULL

        ORDER BY orders."createdAt" DESC

        LIMIT $1
        OFFSET $2
        `,
        [limit, offset]
      );
    } else {
      countResult = await pool.query(
        `
        SELECT COUNT(*)
        FROM orders
        WHERE "userId" = $1
        AND "deletedAt" IS NULL
        `,
        [req.user.id]
      );

      result = await pool.query(
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
          ON orders."productId" = products.id

        WHERE orders."userId" = $1
        AND orders."deletedAt" IS NULL

        ORDER BY orders."createdAt" DESC

        LIMIT $2
        OFFSET $3
        `,
        [req.user.id, limit, offset]
      );
    }

    const totalOrders = parseInt(
      countResult.rows[0].count
    );

    res.status(200).json({
      currentPage: page,
      pageSize: limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      orders: result.rows,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ORDER
// USER → OWN ORDER
// ADMIN → ANY ORDER
// =====================================================

const getOrderById = async (req, res) => {
  try {
    let result;

    if (req.user.role === "Admin") {
      result = await pool.query(
        `
        SELECT
          orders.*,

          products.name AS "productName",

          users.name AS "orderedBy",
          users.email AS "userEmail"

        FROM orders

        INNER JOIN products
          ON orders."productId" = products.id

        INNER JOIN users
          ON orders."userId" = users.id

        WHERE orders.id = $1
        AND orders."deletedAt" IS NULL
        `,
        [req.params.id]
      );
    } else {
      result = await pool.query(
        `
        SELECT
          orders.*,

          products.name AS "productName"

        FROM orders

        INNER JOIN products
          ON orders."productId" = products.id

        WHERE orders.id = $1
        AND orders."userId" = $2
        AND orders."deletedAt" IS NULL
        `,
        [req.params.id, req.user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get Order Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE ORDER STATUS
// USER → OWN ORDER
// ADMIN → ANY ORDER
// =====================================================

const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const result = await pool.query(
      `
      UPDATE orders
      SET
        status = $1,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
      AND "deletedAt" IS NULL
      RETURNING *
      `,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Update Order Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// SOFT DELETE / CANCEL ORDER
// USER → OWN ORDER
// =====================================================

const cancelOrder = async (req, res) => {
  try {
    const result = await pool.query(
      `
      UPDATE orders
      SET
        "deletedAt" = CURRENT_TIMESTAMP,
        status = 'Cancelled',
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $1
      AND "userId" = $2
      AND "deletedAt" IS NULL
      RETURNING *
      `,
      [
        req.params.id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order cancelled successfully",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// HARD DELETE
// ADMIN ONLY
// =====================================================

const deleteOrder = async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM orders
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete Order Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  deleteOrder,
};