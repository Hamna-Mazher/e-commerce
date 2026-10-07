const {
  semanticSearch,
  sparseSearch,
} = require("../services/vectorSearchService");

const {
  hybridSearch,
} = require("../services/hybridSearchService");

// =====================================================
// SEMANTIC SEARCH
// =====================================================

const semantic = async (req, res) => {
  try {
    const {
      q,
      limit,
      sourceType,
    } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

  const results = await semanticSearch({
  query: q.trim(),
  limit: Math.min(
    parseInt(limit) || 5,
    20
  ),
  sourceType: sourceType || null,
  collection: collection || null,
  userId: req.user.id,
  role: req.user.role,
});

    return res.status(200).json({
      query: q,
      type: "semantic",
      count: results.length,
      results,
    });
  } catch (error) {
    console.error(
      "Semantic Search Error:",
      error
    );

    return res.status(500).json({
      message: "Semantic search failed",
      error: error.message,
    });
  }
};

// =====================================================
// SPARSE SEARCH
// =====================================================

const sparse = async (req, res) => {
  try {
    const {
      q,
      limit,
      sourceType,
      collection,
    } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const results = await sparseSearch({
      query: q.trim(),
      limit: Math.min(
        parseInt(limit) || 5,
        20
      ),
      sourceType:
        sourceType || null,
      collection: collection || null,
      userId: req.user.id,
      role: req.user.role,
    });

    return res.status(200).json({
      query: q,
      type: "sparse",
      count: results.length,
      results,
    });
  } catch (error) {
    console.error(
      "Sparse Search Error:",
      error
    );

    return res.status(500).json({
      message: "Sparse search failed",
      error: error.message,
    });
  }
};

// =====================================================
// HYBRID SEARCH
// =====================================================

const hybrid = async (req, res) => {
  try {
    const {
      q,
      limit,
      sourceType,
    } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const result = await hybridSearch({
      query: q.trim(),
      limit: Math.min(
        parseInt(limit) || 8,
        20
      ),
      sourceType:
        sourceType || null,
      userId: req.user.id,
      role: req.user.role,
    });

    return res.status(200).json({
      query: q,
      ...result,
    });
  } catch (error) {
    console.error(
      "Hybrid Search Error:",
      error
    );

    return res.status(500).json({
      message: "Hybrid search failed",
      error: error.message,
    });
  }
};

module.exports = {
  semantic,
  sparse,
  hybrid,
};