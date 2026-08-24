const { pool } = require("../config/pgd");

// =====================================================
// GET ALL USERS
// Admin only
// Server-side pagination
// =====================================================

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    // Count total users
    const countResult = await pool.query(`
      SELECT COUNT(*)
      FROM users
    `);

    const totalUsers = parseInt(countResult.rows[0].count);

    // Get paginated users
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        "profileImage",
        "googleId",
        "createdAt",
        "updatedAt"
      FROM users
      ORDER BY "createdAt" DESC
      LIMIT $1
      OFFSET $2
      `,
      [limit, offset]
    );

    res.status(200).json({
      currentPage: page,
      pageSize: limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      users: result.rows,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE USER PROFILE
// Admin only
//
// Orders and meetings will be added after those
// modules/tables are created.
// =====================================================

const getUserById = async (req, res) => {
  try {
    // -----------------------------
    // Get user
    // -----------------------------

    const userResult = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        "profileImage",
        "googleId",
        "createdAt",
        "updatedAt"
      FROM users
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // -----------------------------
    // Get user's orders
    // -----------------------------

    const ordersResult = await pool.query(
      `
      SELECT
        o.id,
        o."orderNumber",
        o.quantity,
        o.total,
        o.status,
        o."createdAt",
        p.name AS "productName"
      FROM orders o
      INNER JOIN products p
        ON o."productId" = p.id
      WHERE o."userId" = $1
        AND o."deletedAt" IS NULL
      ORDER BY o."createdAt" DESC
      `,
      [req.params.id]
    );

    // -----------------------------
    // Get user's meetings
    // -----------------------------

    const meetingsResult = await pool.query(
      `
      SELECT
        m.id,
        m.title,
        m.duration,
        m.mode,
        m."meetingDate",
        m."meetingTime",

        u1.id AS "participantOneId",
        u1.name AS "participantOneName",
        u1.email AS "participantOneEmail",
        u1.role AS "participantOneRole",

        u2.id AS "participantTwoId",
        u2.name AS "participantTwoName",
        u2.email AS "participantTwoEmail",
        u2.role AS "participantTwoRole"

      FROM meetings m

      INNER JOIN users u1
        ON m."participantOneId" = u1.id

      INNER JOIN users u2
        ON m."participantTwoId" = u2.id

      WHERE m."deletedAt" IS NULL
        AND (
          m."participantOneId" = $1
          OR m."participantTwoId" = $1
        )

      ORDER BY
        m."meetingDate" ASC,
        m."meetingTime" ASC
      `,
      [req.params.id]
    );

    res.status(200).json({
      user,
      orders: ordersResult.rows,
      meetings: meetingsResult.rows,
    });
  } catch (error) {
    console.error("Get User Profile Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  getUsers,
  getUserById,
};