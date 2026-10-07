const {
  createProductService,
  getProductService,
  updateProductService,
  deleteProductService,
} = require("../../services/productService");

const {
  searchPexelsPhotos,
} = require("../../services/pexelsService");

// =====================================================
// OPENAI PRODUCT TOOL DEFINITIONS
// =====================================================

const productTools = [
  // ===================================================
  // CREATE PRODUCT
  // ===================================================

  {
    type: "function",

    name: "create_product",

    description:
      "Create a new product. Admin only. Use this when the Admin explicitly asks to add or create a product. If the Admin asks for an image, use imageQuery to search Pexels and return image candidates for Admin selection.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        name: {
          type: "string",

          description:
            "Product name.",
        },

        description: {
          type: "string",

          description:
            "Product description. Use an empty string if the Admin does not provide a description.",
        },

        price: {
          type: "number",

          description:
            "Product price. Do not invent a price.",
        },

        category: {
          type: "string",

          description:
            "Product category.",
        },

        imageQuery: {
          type: ["string", "null"],

          description:
            "Pexels search query when the Admin wants a product image. Use null when no image is requested.",
        },
      },

      required: [
        "name",
        "description",
        "price",
        "category",
        "imageQuery",
      ],

      additionalProperties: false,
    },
  },

  // ===================================================
  // UPDATE PRODUCT
  // ===================================================

  {
    type: "function",

    name: "update_product",

    description:
      "Update an existing product. Admin only. The product ID is required. Only fields explicitly mentioned by the Admin should be changed. Any field not mentioned must remain unchanged. Use imageQuery only when the Admin wants to replace the product image.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        id: {
          type: "integer",

          description:
            "Product ID to update.",
        },

        name: {
          type: ["string", "null"],

          description:
            "New product name. Use null if the Admin did not ask to change the name.",
        },

        description: {
          type: ["string", "null"],

          description:
            "New product description. Use null if the Admin did not ask to change the description.",
        },

        price: {
          type: ["number", "null"],

          description:
            "New product price. Use null if the Admin did not ask to change the price.",
        },

        category: {
          type: ["string", "null"],

          description:
            "New product category. Use null if the Admin did not ask to change the category.",
        },

        imageQuery: {
          type: ["string", "null"],

          description:
            "Pexels image search query if the Admin wants to replace the product image. Use null to keep the current image.",
        },
      },

      required: [
        "id",
        "name",
        "description",
        "price",
        "category",
        "imageQuery",
      ],

      additionalProperties: false,
    },
  },

  // ===================================================
  // DELETE PRODUCT
  // ===================================================

  {
    type: "function",

    name: "delete_product",

    description:
      "Permanently delete an existing product. Admin only. Use this only when the Admin explicitly asks to delete a product.",

    strict: true,

    parameters: {
      type: "object",

      properties: {
        id: {
          type: "integer",

          description:
            "Product ID to delete.",
        },
      },

      required: ["id"],

      additionalProperties: false,
    },
  },
];

// =====================================================
// EXECUTE PRODUCT TOOL
// =====================================================

const executeProductTool = async ({
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
      "Only Admin users can perform product actions through AI."
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
      "Invalid product tool arguments."
    );
  }

  // ===================================================
  // CREATE PRODUCT
  // ===================================================

  if (name === "create_product") {
    // -----------------------------------------------
    // Validate required fields
    // -----------------------------------------------

    if (
      !args.name ||
      !String(args.name).trim()
    ) {
      throw new Error(
        "Product name is required."
      );
    }

    if (
      args.price === undefined ||
      args.price === null
    ) {
      throw new Error(
        "Product price is required."
      );
    }

    if (
      !Number.isFinite(
        Number(args.price)
      ) ||
      Number(args.price) <= 0
    ) {
      throw new Error(
        "Product price must be greater than 0."
      );
    }

    if (
      !args.category ||
      !String(args.category).trim()
    ) {
      throw new Error(
        "Product category is required."
      );
    }

    // -----------------------------------------------
    // IMAGE REQUEST
    // -----------------------------------------------

    if (
      args.imageQuery &&
      String(args.imageQuery).trim()
    ) {
      const photos =
        await searchPexelsPhotos(
          args.imageQuery,
          5
        );

      return {
        action:
          "create_product",

        requiresImageSelection:
          true,

        product: {
          name:
            String(
              args.name
            ).trim(),

          description:
            args.description || "",

          price:
            Number(args.price),

          category:
            String(
              args.category
            ).trim(),
        },

        imageCandidates:
          photos,
      };
    }

    // -----------------------------------------------
    // CREATE WITHOUT IMAGE
    // -----------------------------------------------

    const product =
      await createProductService({
        name:
          String(
            args.name
          ).trim(),

        description:
          args.description || "",

        price:
          Number(args.price),

        category:
          String(
            args.category
          ).trim(),

        image: "",

        createdBy:
          user.id,
      });

    return {
      action:
        "create_product",

      success: true,

      product,
    };
  }

  // ===================================================
  // UPDATE PRODUCT
  // ===================================================

  if (
    name === "update_product"
  ) {
    if (!args.id) {
      throw new Error(
        "Product ID is required."
      );
    }

    // -----------------------------------------------
    // Get existing product
    // -----------------------------------------------

    const existingProduct =
      await getProductService(
        args.id
      );

    // -----------------------------------------------
    // Merge requested changes
    // -----------------------------------------------

    const mergedProduct = {
      id: args.id,

      name:
        args.name !== null
          ? args.name
          : existingProduct.name,

      description:
        args.description !== null
          ? args.description
          : existingProduct.description ||
            "",

      price:
        args.price !== null
          ? Number(args.price)
          : Number(
              existingProduct.price
            ),

      category:
        args.category !== null
          ? args.category
          : existingProduct.category,

      currentImage:
        existingProduct.image ||
        "",
    };

    // -----------------------------------------------
    // IMAGE REPLACEMENT
    // -----------------------------------------------

    if (
      args.imageQuery &&
      String(args.imageQuery).trim()
    ) {
      const photos =
        await searchPexelsPhotos(
          args.imageQuery,
          5
        );

      return {
        action:
          "update_product",

        requiresImageSelection:
          true,

        productId:
          args.id,

        product: {
          name:
            mergedProduct.name,

          description:
            mergedProduct.description,

          price:
            mergedProduct.price,

          category:
            mergedProduct.category,
        },

        currentImage:
          mergedProduct.currentImage,

        imageCandidates:
          photos,
      };
    }

    // -----------------------------------------------
    // NORMAL UPDATE
    // -----------------------------------------------

    const product =
      await updateProductService({
        id: args.id,

        name:
          args.name !== null
            ? args.name
            : undefined,

        description:
          args.description !== null
            ? args.description
            : undefined,

        price:
          args.price !== null
            ? args.price
            : undefined,

        category:
          args.category !== null
            ? args.category
            : undefined,
      });

    return {
      action:
        "update_product",

      success: true,

      product,
    };
  }

  // ===================================================
  // DELETE PRODUCT
  // ===================================================

  if (
    name === "delete_product"
  ) {
    if (!args.id) {
      throw new Error(
        "Product ID is required."
      );
    }

    const product =
      await deleteProductService({
        id: args.id,
      });

    return {
      action:
        "delete_product",

      success: true,

      product,
    };
  }

  // ===================================================
  // UNKNOWN TOOL
  // ===================================================

  throw new Error(
    `Unknown product tool: ${name}`
  );
};

module.exports = {
  productTools,
  executeProductTool,
};