const openai = require("../config/openai");

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_BATCH_SIZE = 100;

/**
 * Generate embeddings for multiple texts.
 *
 * OpenAI's embeddings endpoint accepts multiple inputs,
 * so we batch them to reduce the number of API calls.
 */
const generateEmbeddings = async (texts) => {
  if (!texts || texts.length === 0) {
    return [];
  }

  const embeddings = [];

  for (
    let i = 0;
    i < texts.length;
    i += EMBEDDING_BATCH_SIZE
  ) {
    const batch = texts.slice(
      i,
      i + EMBEDDING_BATCH_SIZE
    );

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    const sortedData = response.data.sort(
      (a, b) => a.index - b.index
    );

    embeddings.push(
      ...sortedData.map((item) => item.embedding)
    );
  }

  return embeddings;
};

module.exports = {
  generateEmbeddings,
  EMBEDDING_MODEL,
};