const { pool } = require("../config/pgd");
const { chunkText } = require("./chunkService");
const { generateEmbeddings } = require("./embeddingService");
const pgvector = require("pgvector/pg");

// =====================================================
// HELPERS
// =====================================================

const buildDocumentText = (type, row) => {
  switch (type) {
    // -----------------------------
    // PRODUCT
    // -----------------------------
    case "product":
      return `
        Product ID: ${row.id}
        Product Name: ${row.name}
        Category: ${row.category}
        Price: ${row.price}
        Description: ${row.description || "No description"}
        Created By: ${row.creatorName || "Unknown"}
        Creator Email: ${row.creatorEmail || "Unknown"}
        Creator Role: ${row.creatorRole || "Unknown"}
      `;

    // -----------------------------
    // ORDER
    // -----------------------------
    case "order":
      return `
        Order ID: ${row.id}
        Order Number: ${row.orderNumber}
        Product: ${row.productName}
        Quantity: ${row.quantity}
        Total: ${row.total}
        Status: ${row.status}
        Ordered By: ${row.userName}
        User Email: ${row.userEmail}
        Placed On: ${row.createdAt}
      `;

    // -----------------------------
    // TASK
    // -----------------------------
    case "task":
      return `
        Task ID: ${row.id}
        Title: ${row.title}
        Description: ${row.description || "No description"}
        Status: ${row.status}
        Priority: ${row.priority}
        Due Date: ${row.dueDate || "No due date"}
        Created By: ${row.userName || "Unknown"}
        User Email: ${row.userEmail || "Unknown"}
      `;

    // -----------------------------
    // MEETING
    // -----------------------------
    case "meeting":
      return `
        Meeting ID: ${row.id}
        Title: ${row.title}

        Participant 1:
        Name: ${row.participantOneName}
        Email: ${row.participantOneEmail}
        Role: ${row.participantOneRole}

        Participant 2:
        Name: ${row.participantTwoName}
        Email: ${row.participantTwoEmail}
        Role: ${row.participantTwoRole}

        Duration: ${row.duration} minutes
        Mode: ${row.mode}
        Date: ${row.meetingDate}
        Time: ${row.meetingTime}
      `;

    default:
      throw new Error(
        `Unsupported source type: ${type}`
      );
  }
};

// =====================================================
// FETCH PRODUCTS
// =====================================================

const getProducts = async () => {
  const result = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.category,
      p."createdAt",

      u.name AS "creatorName",
      u.email AS "creatorEmail",
      u.role AS "creatorRole"

    FROM products p

    LEFT JOIN users u
      ON p."createdBy" = u.id
  `);

  return result.rows;
};

// =====================================================
// FETCH ORDERS
// =====================================================

const getOrders = async () => {
  const result = await pool.query(`
    SELECT
      o.id,
      o."orderNumber",
      o."userId",
      o.quantity,
      o.total,
      o.status,
      o."createdAt",

      p.name AS "productName",

      u.name AS "userName",
      u.email AS "userEmail"

    FROM orders o

    INNER JOIN products p
      ON o."productId" = p.id

    INNER JOIN users u
      ON o."userId" = u.id

    WHERE o."deletedAt" IS NULL
  `);

  return result.rows;
};

// =====================================================
// FETCH TASKS
// =====================================================

const getTasks = async () => {
  const result = await pool.query(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      t."dueDate",

      u.name AS "userName",
      u.email AS "userEmail"

    FROM tasks t

    LEFT JOIN users u
      ON t."createdBy" = u.id
  `);

  return result.rows;
};

// =====================================================
// FETCH MEETINGS
// =====================================================

const getMeetings = async () => {
  const result = await pool.query(`
    SELECT
      m.id,
      m.title,
      m.duration,
      m.mode,
      m."participantOneId",
m."participantTwoId",
      m."meetingDate",
      m."meetingTime",

      u1.name AS "participantOneName",
      u1.email AS "participantOneEmail",
      u1.role AS "participantOneRole",

      u2.name AS "participantTwoName",
      u2.email AS "participantTwoEmail",
      u2.role AS "participantTwoRole"

    FROM meetings m

    INNER JOIN users u1
      ON m."participantOneId" = u1.id

    INNER JOIN users u2
      ON m."participantTwoId" = u2.id

    WHERE m."deletedAt" IS NULL
  `);

  return result.rows;
};

// =====================================================
// STORE DOCUMENT CHUNKS + EMBEDDINGS
// =====================================================

const storeDocuments = async (
  sourceType,
  rows
) => {
  let totalChunks = 0;

  for (const row of rows) {
    const fullText = buildDocumentText(
      sourceType,
      row
    );

    const chunks = chunkText(fullText);

    if (chunks.length === 0) {
      continue;
    }

    const embeddings =
      await generateEmbeddings(chunks);

    for (let i = 0; i < chunks.length; i++) {
      const metadata = {
        sourceType,
        sourceId: row.id,
        userId:
          sourceType === "order"
            ? row.userId
            : null,
        participantOneId:
          sourceType === "meeting"
            ? row.participantOneId
            : null,
        participantTwoId:
          sourceType === "meeting"
            ? row.participantTwoId
            : null,
      };

      await pool.query(
        `
      INSERT INTO knowledge_documents
(
  collection,
  "sourceType",
  "sourceId",
  content,
  metadata,
  embedding,
  search_vector
)
VALUES ($1, $2, $3, $4, $5, $6, to_tsvector('english', $4))
        `,
        [
          sourceType,
          row.id,
          chunks[i],
          JSON.stringify(metadata),
          pgvector.toSql(embeddings[i]),
        ]
      );

      totalChunks++;
    }
  }

  return totalChunks;
};

// =====================================================
// CLEAR EXISTING DATA
// =====================================================

const clearKnowledgeDocuments =
  async () => {
    await pool.query(
      `TRUNCATE TABLE knowledge_documents RESTART IDENTITY`
    );
  };

// =====================================================
// INGEST EVERYTHING
// =====================================================

const ingestAllKnowledge = async () => {
  console.log(
    "🚀 Starting knowledge ingestion..."
  );

  await clearKnowledgeDocuments();

  const products = await getProducts();
  console.log(
    `📦 Products fetched: ${products.length}`
  );

  const productChunks =
    await storeDocuments(
      "product",
      products
    );

  const orders = await getOrders();
  console.log(
    `🛒 Orders fetched: ${orders.length}`
  );

  const orderChunks =
    await storeDocuments(
      "order",
      orders
    );

  const tasks = await getTasks();
  console.log(
    `✅ Tasks fetched: ${tasks.length}`
  );

  const taskChunks =
    await storeDocuments(
      "task",
      tasks
    );

  const meetings = await getMeetings();
  console.log(
    `📅 Meetings fetched: ${meetings.length}`
  );

  const meetingChunks =
    await storeDocuments(
      "meeting",
      meetings
    );

  console.log(
    "✅ Knowledge ingestion completed."
  );

  console.log({
    productChunks,
    orderChunks,
    taskChunks,
    meetingChunks,
    totalChunks:
      productChunks +
      orderChunks +
      taskChunks +
      meetingChunks,
  });
};

module.exports = {
  ingestAllKnowledge,
};