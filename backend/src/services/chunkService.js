const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP = 150;

/**
 * Simple character-based chunking.
 *
 * This keeps the implementation easy to understand:
 * - chunkSize = maximum characters per chunk
 * - overlap = characters shared with the next chunk
 */
const chunkText = (
  text,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP
) => {
  if (!text) {
    return [];
  }

  if (overlap >= chunkSize) {
    throw new Error(
      "Chunk overlap must be smaller than chunk size."
    );
  }

  const cleanText = String(text)
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) {
    return [];
  }

  const chunks = [];

  let start = 0;

  while (start < cleanText.length) {
    const end = Math.min(
      start + chunkSize,
      cleanText.length
    );

    const chunk = cleanText.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= cleanText.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
};

module.exports = {
  chunkText,
};