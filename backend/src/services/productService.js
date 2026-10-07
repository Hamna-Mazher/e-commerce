const { pool } = require("../config/pgd");

// =====================================================
// CREATE PRODUCT
// =====================================================

const createProductService = async ({
  name,
  description = "",
  price,
  category,
  image = "",
  createdBy,
}) => {
  if (!name || !String(name).trim()) {
    throw new Error("Product name is required");
  }

  if (
    price === undefined ||
    price === null ||
    !Number.isFinite(Number(price)) ||
    Number(price) <= 0
  ) {
    throw new Error(
      "Product price must be greater than 0"
    );
  }

  if (!category || !String(category).trim()) {
    throw new Error(
      "Product category is required"
    );
  }

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
      String(name).trim(),
      String(description || "").trim(),
      Number(price),
      String(category).trim(),
      image || "",
      createdBy,
    ]
  );

  return result.rows[0];
};

// =====================================================
// GET PRODUCT FOR SERVICE / AI
// =====================================================

const getProductService = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM products
    WHERE id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Product not found");
  }

  return result.rows[0];
};

// =====================================================
// UPDATE PRODUCT
// Supports PARTIAL updates
// =====================================================

const updateProductService = async ({
  id,
  name,
  description,
  price,
  category,
  image = null,
}) => {
  if (!id) {
    throw new Error(
      "Product ID is required"
    );
  }

  // -----------------------------------------
  // Get existing product
  // -----------------------------------------

  const existingProduct =
    await getProductService(id);

  // -----------------------------------------
  // Preserve unchanged values
  // -----------------------------------------

  const finalName =
    name !== undefined &&
    name !== null
      ? String(name).trim()
      : existingProduct.name;

  const finalDescription =
    description !== undefined &&
    description !== null
      ? String(description).trim()
      : existingProduct.description || "";

  const finalPrice =
    price !== undefined &&
    price !== null
      ? Number(price)
      : Number(existingProduct.price);

  const finalCategory =
    category !== undefined &&
    category !== null
      ? String(category).trim()
      : existingProduct.category;

  // -----------------------------------------
  // Validation after merging
  // -----------------------------------------

  if (!finalName) {
    throw new Error(
      "Product name is required"
    );
  }

  if (
    !Number.isFinite(finalPrice) ||
    finalPrice <= 0
  ) {
    throw new Error(
      "Product price must be greater than 0"
    );
  }

  if (!finalCategory) {
    throw new Error(
      "Product category is required"
    );
  }

  // -----------------------------------------
  // Update WITH new image
  // -----------------------------------------

  if (image) {
    const result = await pool.query(
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
        finalName,
        finalDescription,
        finalPrice,
        finalCategory,
        image,
        id,
      ]
    );

    return result.rows[0];
  }

  // -----------------------------------------
  // Update WITHOUT changing image
  // -----------------------------------------

  const result = await pool.query(
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
      finalName,
      finalDescription,
      finalPrice,
      finalCategory,
      id,
    ]
  );

  return result.rows[0];
};

// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProductService = async ({
  id,
}) => {
  if (!id) {
    throw new Error(
      "Product ID is required"
    );
  }

  const result = await pool.query(
    `
    DELETE FROM products
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error(
      "Product not found"
    );
  }

  return result.rows[0];
};

module.exports = {
  createProductService,
  getProductService,
  updateProductService,
  deleteProductService,
};