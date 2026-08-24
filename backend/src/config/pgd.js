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
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  pool,
  connectDB,
};