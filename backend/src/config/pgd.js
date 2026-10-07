const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// =====================================================
// CONNECT TO POSTGRESQL
// =====================================================

const connectDB = async () => {
  try {
    await pool.query("SELECT NOW()");

    console.log("✅ PostgreSQL Connected");

    // Create tables
    await createTables();

    console.log("✅ PostgreSQL Tables Ready");
  } catch (error) {
    console.error(
      "❌ PostgreSQL Connection Error:",
      error.message
    );

    process.exit(1);
  }
};

// =====================================================
// CREATE TABLES
// =====================================================

const createTables = async () => {
  // =========================
  // USERS TABLE
  // =========================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,

      name VARCHAR(255) NOT NULL,

      email VARCHAR(255) UNIQUE NOT NULL,

      password VARCHAR(255),

      role VARCHAR(20) DEFAULT 'User'
        CHECK (role IN ('Admin', 'User')),

      "googleId" VARCHAR(255),

      "profileImage" VARCHAR(500) DEFAULT '',

      "resetPasswordToken" VARCHAR(255),

      "resetPasswordExpire" TIMESTAMP,

      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // =========================
  // PRODUCTS TABLE
  // =========================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,

      name VARCHAR(255) NOT NULL,

      description TEXT DEFAULT '',

      price DECIMAL(10, 2) NOT NULL,

      category VARCHAR(255) NOT NULL,

      image VARCHAR(500) DEFAULT '',

      "createdBy" INTEGER NOT NULL,

      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT products_createdby_fk
        FOREIGN KEY ("createdBy")
        REFERENCES users(id)
        ON DELETE CASCADE
    );
  `);


  // =========================
  // order table
  // =========================

  await pool.query(`
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,

    "orderNumber" VARCHAR(50) UNIQUE NOT NULL,

    "userId" INTEGER NOT NULL,

    "productId" INTEGER NOT NULL,

    quantity INTEGER NOT NULL CHECK (quantity > 0),

    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),

    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
      CHECK (
        status IN (
          'Pending',
          'Processing',
          'Completed',
          'Cancelled'
        )
      ),

    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    "deletedAt" TIMESTAMP,

    CONSTRAINT orders_user_fk
      FOREIGN KEY ("userId")
      REFERENCES users(id)
      ON DELETE CASCADE,

    CONSTRAINT orders_product_fk
      FOREIGN KEY ("productId")
      REFERENCES products(id)
      ON DELETE CASCADE
  );
`);
console.log("✅ Orders table ready");
// =====================================================
// MEETINGS TABLE
// =====================================================

await pool.query(`
  CREATE TABLE IF NOT EXISTS meetings (
    id SERIAL PRIMARY KEY,

    "participantOneId" INTEGER NOT NULL,

    "participantTwoId" INTEGER NOT NULL,

    title VARCHAR(255) NOT NULL,

    duration INTEGER NOT NULL,

    mode VARCHAR(20) NOT NULL
      CHECK (mode IN ('Online', 'Physical')),

    "meetingDate" DATE NOT NULL,

    "meetingTime" TIME NOT NULL,

    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    "deletedAt" TIMESTAMP,

    CONSTRAINT meeting_participant_one_fk
      FOREIGN KEY ("participantOneId")
      REFERENCES users(id)
      ON DELETE CASCADE,

    CONSTRAINT meeting_participant_two_fk
      FOREIGN KEY ("participantTwoId")
      REFERENCES users(id)
      ON DELETE CASCADE,

    CONSTRAINT meeting_participants_different
      CHECK ("participantOneId" <> "participantTwoId"),

    CONSTRAINT meeting_duration_check
      CHECK (duration IN (30, 60, 90, 120))
  );
`);

console.log("✅ Meetings table ready");


  // =========================
  // TASKS TABLE
  // =========================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,

      title VARCHAR(255) NOT NULL,

      description TEXT DEFAULT '',

      status VARCHAR(30) DEFAULT 'Todo'
        CHECK (
          status IN (
            'Todo',
            'In Progress',
            'Done'
          )
        ),

      priority VARCHAR(20) DEFAULT 'Medium'
        CHECK (
          priority IN (
            'Low',
            'Medium',
            'High'
          )
        ),

      "dueDate" TIMESTAMP,

      "createdBy" INTEGER NOT NULL,

      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT tasks_createdby_fk
        FOREIGN KEY ("createdBy")
        REFERENCES users(id)
        ON DELETE CASCADE
    );
  `);
  await pool.query(`
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id SERIAL PRIMARY KEY,

  "sourceType" VARCHAR(50) NOT NULL,

  "sourceId" INTEGER,

  content TEXT NOT NULL,

  metadata JSONB DEFAULT '{}'::jsonb,

  embedding VECTOR(1536),

  search_vector TSVECTOR,

  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);
console.log("✅ Knowledge documents table ready");
await pool.query(`
  CREATE INDEX IF NOT EXISTS knowledge_documents_embedding_idx
  ON knowledge_documents
  USING hnsw (embedding vector_cosine_ops);
`);
await pool.query(`
  ALTER TABLE knowledge_documents
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
`);
await pool.query(`
  UPDATE knowledge_documents
  SET search_vector =
    to_tsvector(
      'english',
      content
    )
  WHERE search_vector IS NULL;
`);
await pool.query(`
  CREATE INDEX IF NOT EXISTS
  knowledge_documents_search_idx
  ON knowledge_documents
  USING GIN(search_vector);
`);
await pool.query(`
  ALTER TABLE knowledge_documents
  ADD COLUMN IF NOT EXISTS collection VARCHAR(50);
`);
await pool.query(`
  UPDATE knowledge_documents
  SET collection = "sourceType"
  WHERE collection IS NULL;

`);
// =====================================================
// CHAT SESSIONS
// =====================================================

await pool.query(`
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,

    "userId" INTEGER NOT NULL,

    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',

    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chat_session_user_fk
      FOREIGN KEY ("userId")
      REFERENCES users(id)
      ON DELETE CASCADE
  );
`);

console.log("✅ Chat sessions table ready");

// =====================================================
// CHAT MESSAGES
// =====================================================

await pool.query(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,

    "sessionId" INTEGER NOT NULL,

    role VARCHAR(20) NOT NULL
      CHECK (role IN ('user', 'assistant')),

    content TEXT NOT NULL,

    sources JSONB DEFAULT '[]'::jsonb,

    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chat_message_session_fk
      FOREIGN KEY ("sessionId")
      REFERENCES chat_sessions(id)
      ON DELETE CASCADE
  );
`);

console.log("✅ Chat messages table ready");
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  pool,
  connectDB,
};