const {
  semanticSearch,
  sparseSearch,
} = require("./vectorSearchService");

// =====================================================
// RECIPROCAL RANK FUSION
// =====================================================

const reciprocalRankFusion = (
  denseResults,
  sparseResults,
  k = 60
) => {
  const fused = new Map();

  const addResults = (results, retrievalType) => {
    results.forEach((result, index) => {
      const key = `${result.sourceType}:${result.sourceId}`;

      if (!fused.has(key)) {
        fused.set(key, {
          sourceType: result.sourceType,
          sourceId: result.sourceId,
          content: result.content,
          metadata: result.metadata,

          denseScore:
            retrievalType === "dense"
              ? Number(result.similarity) || 0
              : 0,

          sparseScore:
            retrievalType === "sparse"
              ? Number(result.sparse_score) || 0
              : 0,

          rrfScore: 0,
        });
      } else {
        const existing = fused.get(key);

        if (retrievalType === "dense") {
          existing.denseScore =
            Number(result.similarity) || 0;
        }

        if (retrievalType === "sparse") {
          existing.sparseScore =
            Number(result.sparse_score) || 0;
        }
      }

      const existing = fused.get(key);

      existing.rrfScore +=
        1 / (k + index + 1);
    });
  };

  addResults(
    denseResults,
    "dense"
  );

  addResults(
    sparseResults,
    "sparse"
  );

  return Array.from(fused.values()).sort(
    (a, b) => b.rrfScore - a.rrfScore
  );
};

// =====================================================
// HYBRID SEARCH
// =====================================================

const hybridSearch = async ({
  query,
  limit = 10,
  userId,
  role,
  sourceType = null,
}) => {
  const [denseResults, sparseResults] =
    await Promise.all([
      semanticSearch({
        query,
        limit,
        userId,
        role,
        sourceType,
      }),

      sparseSearch({
        query,
        limit,
        userId,
        role,
        sourceType,
      }),
    ]);

  const fusedResults =
    reciprocalRankFusion(
      denseResults,
      sparseResults
    );

  return {
    denseResults,
    sparseResults,
    fusedResults: fusedResults.slice(
      0,
      limit
    ),
  };
};

module.exports = {
  hybridSearch,
  reciprocalRankFusion,
};