const { pool } = require("../config/pgd");
const {
  createProductService,
  updateProductService,
  deleteProductService,
} = require("../services/productService");
// =====================================================
// CREATE PRODUCT
// =====================================================

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
    } = req.body;

    const product =
      await createProductService({
        name,
        description,
        price,
        category,
        image: req.file
          ? req.file.filename
          : "",
        createdBy: req.user.id,
      });

    res.status(201).json({
      message:
        "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Create Product Error:",
      error
    );

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
    const {
      name,
      description,
      price,
      category,
    } = req.body;

    const product =
      await updateProductService({
        id: req.params.id,
        name,
        description,
        price,
        category,
        image: req.file
          ? req.file.filename
          : null,
      });

    res.status(200).json({
      message:
        "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Update Product Error:",
      error
    );

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
    const product =
      await deleteProductService({
        id: req.params.id,
      });

    res.status(200).json({
      message:
        "Product deleted successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Delete Product Error:",
      error
    );

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