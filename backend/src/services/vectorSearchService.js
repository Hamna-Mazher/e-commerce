const { pool } = require("../config/pgd");
const openai = require("../config/openai");

const EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Convert a JavaScript array into pgvector format.
 */
const vectorToSql = (vector) => {
  return `[${vector.join(",")}]`;
};

/**
 * Generate an embedding for the user's search question.
 */
const generateQueryEmbedding = async (query) => {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
  });

  return response.data[0].embedding;
};

/**
 * Search knowledge_documents using cosine similarity.
 *
 * Returns the most semantically relevant documents.
 */
const semanticSearch = async ({
  query,
  limit = 5,
  sourceType = null,
  collection = null,
  userId = null,
  role = null,
}) => {
  if (!query || !query.trim()) {
    return [];
  }

  const embedding =
    await generateQueryEmbedding(query);

  const vector = vectorToSql(embedding);

  const conditions = [
    `embedding IS NOT NULL`,
  ];

  const values = [vector];
  let parameterIndex = 2;

  // Metadata filtering by document type
  if (sourceType) {
    conditions.push(
      `"sourceType" = $${parameterIndex}`
    );

    values.push(sourceType);
    parameterIndex++;
  }

  /**
   * IMPORTANT:
   *
   * Normal Users must never retrieve another
   * user's private order/meeting information.
   *
   * Admin can retrieve all records.
   */
  if (role !== "Admin" && userId) {
    conditions.push(`
      (
        "sourceType" NOT IN ('order', 'meeting')
        OR
        (
          "sourceType" = 'order'
          AND (metadata->>'userId')::INTEGER = $${parameterIndex}
        )
        OR
        (
          "sourceType" = 'meeting'
          AND (
            (metadata->>'participantOneId')::INTEGER = $${parameterIndex}
            OR
            (metadata->>'participantTwoId')::INTEGER = $${parameterIndex}
          )
        )
      )
    `);

    values.push(userId);
    parameterIndex++;
  }

  values.push(limit);

  const result = await pool.query(
    `
    SELECT
      id,
      "sourceType",
      "sourceId",
      content,
      metadata,

      1 - (
        embedding <=> $1::vector
      ) AS similarity

    FROM knowledge_documents

    WHERE ${conditions.join(" AND ")}

    ORDER BY embedding <=> $1::vector

    LIMIT $${parameterIndex}
    `,
    values
  );

  return result.rows;
};
const sparseSearch = async ({
  query,
  limit = 5,
  sourceType = null,
  collection = null,
  userId = null,
  role = null,
}) => {
  if (!query || !query.trim()) {
    return [];
  }

  const conditions = [
    `search_vector @@ websearch_to_tsquery('english', $1)`,
  ];

  const values = [query];
  let parameterIndex = 2;

  // Source type filtering
  if (sourceType) {
    conditions.push(
      `"sourceType" = $${parameterIndex}`
    );

    values.push(sourceType);
    parameterIndex++;
  }
if (collection) {
  conditions.push(
    `collection = $${parameterIndex}`
  );

  values.push(collection);
  parameterIndex++;
}
  // User permission filtering
  if (role !== "Admin" && userId) {
    conditions.push(`
      (
        "sourceType" NOT IN ('order', 'meeting')
        OR
        (
          "sourceType" = 'order'
          AND (metadata->>'userId')::INTEGER = $${parameterIndex}
        )
        OR
        (
          "sourceType" = 'meeting'
          AND (
            (metadata->>'participantOneId')::INTEGER = $${parameterIndex}
            OR
            (metadata->>'participantTwoId')::INTEGER = $${parameterIndex}
          )
        )
      )
    `);

    values.push(userId);
    parameterIndex++;
  }

  values.push(limit);

  const result = await pool.query(
    `
    SELECT
      id,
      "sourceType",
      "sourceId",
      content,
      metadata,

      ts_rank_cd(
        search_vector,
        websearch_to_tsquery('english', $1)
      ) AS sparse_score

    FROM knowledge_documents

    WHERE ${conditions.join(" AND ")}

    ORDER BY sparse_score DESC

    LIMIT $${parameterIndex}
    `,
    values
  );

  return result.rows;
};
module.exports = {
  semanticSearch,
  sparseSearch,
};