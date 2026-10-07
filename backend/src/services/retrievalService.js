const {
  hybridSearch,
} = require("./hybridSearchService");

const {
  rerankResults,
} = require("./rerankService");

// =====================================================
// RETRIEVE RELEVANT CONTEXT
// =====================================================

const retrieveContext = async ({
  query,
  userId,
  role,
  sourceType = null,
}) => {
  // -----------------------------------------
  // 1. Hybrid retrieval
  // -----------------------------------------

  const {
    denseResults,
    sparseResults,
    fusedResults,
  } = await hybridSearch({
    query,
    limit: 10,
    userId,
    role,
    sourceType,
  });

  // -----------------------------------------
  // 2. Reranking
  // -----------------------------------------

  const rerankedResults =
    await rerankResults({
      query,
      documents: fusedResults,
      limit: 5,
    });

  return {
    denseResults,
    sparseResults,
    fusedResults,
    rerankedResults,
  };
};

module.exports = {
  retrieveContext,
};