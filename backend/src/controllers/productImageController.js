const {
  downloadPexelsImage,
} = require("../services/pexelsService");

const {
  createProductService,
  updateProductService,
} = require("../services/productService");

// =====================================================
// CREATE PRODUCT WITH SELECTED IMAGE
// =====================================================

const createProductWithImage = async (
  req,
  res
) => {
  try {
    // -----------------------------
    // Admin only
    // -----------------------------

    if (
      !req.user ||
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        message:
          "Only Admin users can create products.",
      });
    }

    const {
      name,
      description,
      price,
      category,
      imageUrl,
    } = req.body || {};

    if (
      !name ||
      price === undefined ||
      !category ||
      !imageUrl
    ) {
      return res.status(400).json({
        message:
          "Name, price, category and image are required.",
      });
    }

    // -----------------------------
    // Download selected Pexels image
    // -----------------------------

    const fileName =
      await downloadPexelsImage(
        imageUrl
      );

    // -----------------------------
    // Create product
    // -----------------------------

    const product =
      await createProductService({
        name,
        description,
        price,
        category,
        image: fileName,
        createdBy: req.user.id,
      });

    return res.status(201).json({
      message:
        "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Create Product With Image Error:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE PRODUCT WITH SELECTED IMAGE
// =====================================================

const updateProductWithImage = async (
  req,
  res
) => {
  try {
    if (
      !req.user ||
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        message:
          "Only Admin users can update products.",
      });
    }

    const {
      id,
      name,
      description,
      price,
      category,
      imageUrl,
    } = req.body || {};

    if (!id) {
      return res.status(400).json({
        message:
          "Product ID is required.",
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        message:
          "Image URL is required.",
      });
    }

    // -----------------------------------------
    // Download selected image
    // -----------------------------------------

    const fileName =
      await downloadPexelsImage(
        imageUrl
      );

    // -----------------------------------------
    // Update product
    // -----------------------------------------

    const product =
      await updateProductService({
        id,

        name:
          name !== undefined
            ? name
            : undefined,

        description:
          description !== undefined
            ? description
            : undefined,

        price:
          price !== undefined
            ? price
            : undefined,

        category:
          category !== undefined
            ? category
            : undefined,

        image: fileName,
      });

    return res.status(200).json({
      message:
        "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Update Product With Image Error:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createProductWithImage,
  updateProductWithImage,
};