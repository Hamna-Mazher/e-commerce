const {
  searchPexelsPhotos,
} = require("../services/pexelsService");

// =====================================================
// SEARCH PEXELS
// =====================================================

const searchPhotos = async (
  req,
  res
) => {
  try {
    const {
      q,
      limit,
    } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message:
          "Search query is required",
      });
    }

    const photos =
      await searchPexelsPhotos(
        q,
        limit
      );

    return res.status(200).json({
      query: q,
      count: photos.length,
      photos,
    });
  } catch (error) {
    console.error(
      "Pexels Search Error:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      message:
        "Failed to search Pexels",
      error:
        error.response?.data ||
        error.message,
    });
  }
};

module.exports = {
  searchPhotos,
};