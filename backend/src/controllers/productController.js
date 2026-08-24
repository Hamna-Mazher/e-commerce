const { pool } = require("../config/pgd");

// =====================================================
// CREATE PRODUCT
// =====================================================

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    const result = await pool.query(
      `
      INSERT INTO products
      (
        name,
        description,
        price,
        category,
        image,
        "createdBy"
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        name,
        description || "",
        price,
        category,
        req.file ? req.file.filename : "",
        req.user.id,
      ]
    );

    res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL PRODUCTS WITH PAGINATION + SEARCH
// =====================================================

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    // Count total products
    const countResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM products
      WHERE name ILIKE $1
      `,
      [`%${search}%`]
    );

    const totalProducts = parseInt(
      countResult.rows[0].count
    );

    // Get products with creator information
    const result = await pool.query(
      `
      SELECT
        products.*,
        users.name AS "creatorName",
        users.email AS "creatorEmail",
        users.role AS "creatorRole"
      FROM products
      LEFT JOIN users
        ON products."createdBy" = users.id
      WHERE products.name ILIKE $1
      ORDER BY products."createdAt" DESC
      LIMIT $2 OFFSET $3
      `,
      [
        `%${search}%`,
        limit,
        offset,
      ]
    );

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      products: result.rows,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET PRODUCT BY ID
// =====================================================

const getProductById = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        products.*,
        users.name AS "creatorName",
        users.email AS "creatorEmail",
        users.role AS "creatorRole"
      FROM products
      LEFT JOIN users
        ON products."createdBy" = users.id
      WHERE products.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get Product Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    const newImage = req.file
      ? req.file.filename
      : null;

    let result;

    if (newImage) {
      // Update WITH new image
      result = await pool.query(
        `
        UPDATE products
        SET
          name = $1,
          description = $2,
          price = $3,
          category = $4,
          image = $5,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
        `,
        [
          name,
          description || "",
          price,
          category,
          newImage,
          req.params.id,
        ]
      );
    } else {
      // Update WITHOUT changing existing image
      result = await pool.query(
        `
        UPDATE products
        SET
          name = $1,
          description = $2,
          price = $3,
          category = $4,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
        `,
        [
          name,
          description || "",
          price,
          category,
          req.params.id,
        ]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: result.rows[0],
    });

  } catch (error) {
    console.error("Update Product Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProduct = async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};