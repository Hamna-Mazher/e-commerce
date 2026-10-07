const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PEXELS_API_URL =
  "https://api.pexels.com/v1";

const PEXELS_API_KEY =
  process.env.PEXELS_API_KEY;

// =====================================================
// SEARCH PHOTOS
// =====================================================

const searchPexelsPhotos = async (
  query,
  perPage = 5
) => {
  // -----------------------------------------
  // Validate API key
  // -----------------------------------------

  if (
    !PEXELS_API_KEY ||
    !PEXELS_API_KEY.trim()
  ) {
    throw new Error(
      "PEXELS_API_KEY is not configured. Please add it to backend/.env."
    );
  }

  // -----------------------------------------
  // Validate query
  // -----------------------------------------

  if (
    !query ||
    typeof query !== "string" ||
    !query.trim()
  ) {
    throw new Error(
      "Pexels search query is required."
    );
  }

  const requestedPerPage =
    Number(perPage) || 5;

  const safePerPage = Math.min(
    Math.max(requestedPerPage, 1),
    10
  );

  try {
    console.log(
      "🔎 Pexels search:",
      query.trim()
    );

    const response =
      await axios.get(
        `${PEXELS_API_URL}/search`,
        {
          headers: {
            Authorization:
              PEXELS_API_KEY.trim(),
          },

          params: {
            query: query.trim(),
            per_page: safePerPage,
            orientation: "square",
          },

          timeout: 15000,
        }
      );

    // ---------------------------------------
    // Validate Pexels response
    // ---------------------------------------

    if (
      !response.data ||
      !Array.isArray(
        response.data.photos
      )
    ) {
      throw new Error(
        "Invalid response received from Pexels."
      );
    }

    if (
      response.data.photos.length ===
      0
    ) {
      return [];
    }

    // ---------------------------------------
    // Format results
    // ---------------------------------------

    const photos =
      response.data.photos
        .map((photo) => ({
          id: photo.id,

          photographer:
            photo.photographer ||
            "Unknown photographer",

          photographerUrl:
            photo.photographer_url ||
            null,

          photoUrl:
            photo.url || null,

          imageUrl:
            photo.src?.medium ||
            photo.src?.small ||
            null,

          largeImageUrl:
            photo.src?.large ||
            photo.src?.medium ||
            null,

          originalImageUrl:
            photo.src?.original ||
            photo.src?.large ||
            photo.src?.medium ||
            null,

          alt:
            photo.alt ||
            query.trim(),
        }))
        .filter(
          (photo) =>
            photo.imageUrl
        );

    console.log(
      `✅ Pexels returned ${photos.length} images`
    );

    return photos;
  } catch (error) {
    // -----------------------------------------
    // Axios / Pexels errors
    // -----------------------------------------

    if (error.response) {
      const status =
        error.response.status;

      const responseData =
        error.response.data;

      console.error(
        "❌ Pexels API Error:",
        status,
        responseData
      );

      if (status === 401) {
        throw new Error(
          "Pexels API key is invalid."
        );
      }

      if (status === 403) {
        throw new Error(
          "Pexels API access was forbidden. Check your API key and account."
        );
      }

      if (status === 429) {
        throw new Error(
          "Pexels API rate limit reached. Please try again later."
        );
      }

      throw new Error(
        `Pexels API request failed with status ${status}.`
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Pexels request timed out."
      );
    }

    console.error(
      "❌ Pexels Search Error:",
      error.message
    );

    throw new Error(
      `Pexels image search failed: ${error.message}`
    );
  }
};

// =====================================================
// DOWNLOAD PEXELS IMAGE
// =====================================================

const downloadPexelsImage = async (
  imageUrl
) => {
  // -----------------------------------------
  // Validate URL
  // -----------------------------------------

  if (
    !imageUrl ||
    typeof imageUrl !== "string" ||
    !imageUrl.trim()
  ) {
    throw new Error(
      "Valid image URL is required."
    );
  }

  // -----------------------------------------
  // Only allow HTTPS images
  // -----------------------------------------

  if (
    !imageUrl.startsWith(
      "https://"
    )
  ) {
    throw new Error(
      "Only HTTPS image URLs are allowed."
    );
  }

  // -----------------------------------------
  // Upload directory
  // -----------------------------------------

  const uploadsDir =
    path.resolve(
      __dirname,
      "../../uploads"
    );

  await fs.promises.mkdir(
    uploadsDir,
    {
      recursive: true,
    }
  );

  // -----------------------------------------
  // Generate filename
  // -----------------------------------------

  const fileName =
    `pexels-${crypto
      .randomBytes(12)
      .toString("hex")}.jpg`;

  const filePath =
    path.join(
      uploadsDir,
      fileName
    );

  try {
    console.log(
      "⬇️ Downloading Pexels image..."
    );

    const response =
      await axios.get(
        imageUrl.trim(),
        {
          responseType:
            "arraybuffer",

          timeout: 30000,

          headers: {
            "User-Agent":
              "Ecommerce-AI-App/1.0",
          },
        }
      );

    // ---------------------------------------
    // Validate content
    // ---------------------------------------

    if (
      !response.data ||
      response.data.length === 0
    ) {
      throw new Error(
        "Downloaded image is empty."
      );
    }

    // ---------------------------------------
    // Save
    // ---------------------------------------

    await fs.promises.writeFile(
      filePath,
      response.data
    );

    // ---------------------------------------
    // Verify file
    // ---------------------------------------

    await fs.promises.access(
      filePath,
      fs.constants.F_OK
    );

    console.log(
      "✅ Pexels image saved:",
      fileName
    );

    return fileName;
  } catch (error) {
    // ---------------------------------------
    // Cleanup failed download
    // ---------------------------------------

    try {
      await fs.promises.unlink(
        filePath
      );
    } catch {
      // Nothing to clean up
    }

    if (error.response) {
      throw new Error(
        `Failed to download Pexels image (HTTP ${error.response.status}).`
      );
    }

    console.error(
      "❌ Pexels image download error:",
      error.message
    );

    throw new Error(
      `Failed to download Pexels image: ${error.message}`
    );
  }
};

module.exports = {
  searchPexelsPhotos,
  downloadPexelsImage,
};