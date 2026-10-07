require("dotenv").config();

const {
  ingestAllKnowledge,
} = require("../services/knowledgeIngestionService");

const run = async () => {
  try {
    await ingestAllKnowledge();

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Knowledge ingestion failed:",
      error
    );

    process.exit(1);
  }
};

run();