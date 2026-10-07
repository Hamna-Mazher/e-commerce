const updateProductService = async ({
  id,
  name,
  description,
  price,
  category,
  image = null,
}) => {
  if (!id) {
    throw new Error("Product ID is required");
  }

  // -----------------------------------------
  // Get existing product
  // -----------------------------------------

  const existingResult = await pool.query(
    `
    SELECT *
    FROM products
    WHERE id = $1
    `,
    [id]
  );

  if (existingResult.rows.length === 0) {
    throw new Error("Product not found");
  }

  const existingProduct =
    existingResult.rows[0];

  // -----------------------------------------
  // Merge existing + new values
  // -----------------------------------------

  const finalName =
    name !== undefined
      ? String(name).trim()
      : existingProduct.name;

  const finalDescription =
    description !== undefined
      ? String(description).trim()
      : existingProduct.description || "";

  const finalPrice =
    price !== undefined
      ? Number(price)
      : Number(existingProduct.price);

  const finalCategory =
    category !== undefined
      ? String(category).trim()
      : existingProduct.category;

  // -----------------------------------------
  // Validation
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
  // Update with new image
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
  // Update without changing image
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