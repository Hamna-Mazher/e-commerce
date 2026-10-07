const { pool } = require("../config/pgd");

// =====================================================
// CREATE SESSION
// =====================================================

const createChatSession = async ({
  userId,
  title = "New Chat",
}) => {
  const result = await pool.query(
    `
    INSERT INTO chat_sessions
    (
      "userId",
      title
    )
    VALUES ($1, $2)
    RETURNING *
    `,
    [userId, title]
  );

  return result.rows[0];
};

// =====================================================
// GET USER SESSIONS
// =====================================================

const getChatSessions = async ({
  userId,
}) => {
  const result = await pool.query(
    `
    SELECT
      s.id,
      s.title,
      s."createdAt",
      s."updatedAt",

      (
        SELECT content
        FROM chat_messages m
        WHERE m."sessionId" = s.id
          AND m.role = 'user'
        ORDER BY m."createdAt" ASC
        LIMIT 1
      ) AS "firstMessage"

    FROM chat_sessions s

    WHERE s."userId" = $1

    ORDER BY s."updatedAt" DESC
    `,
    [userId]
  );

  return result.rows;
};

// =====================================================
// GET SINGLE SESSION
// =====================================================

const getChatSession = async ({
  userId,
  sessionId,
}) => {
  const sessionResult = await pool.query(
    `
    SELECT
      id,
      title,
      "createdAt",
      "updatedAt"
    FROM chat_sessions
    WHERE id = $1
      AND "userId" = $2
    `,
    [sessionId, userId]
  );

  if (sessionResult.rows.length === 0) {
    return null;
  }

  const messagesResult = await pool.query(
    `
    SELECT
      id,
      role,
      content,
      sources,
      "createdAt"
    FROM chat_messages
    WHERE "sessionId" = $1
    ORDER BY "createdAt" ASC
    `,
    [sessionId]
  );

  return {
    session: sessionResult.rows[0],
    messages: messagesResult.rows,
  };
};

// =====================================================
// ADD MESSAGE
// =====================================================

const addChatMessage = async ({
  sessionId,
  role,
  content,
  sources = [],
}) => {
  const result = await pool.query(
    `
    INSERT INTO chat_messages
    (
      "sessionId",
      role,
      content,
      sources
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      sessionId,
      role,
      content,
      JSON.stringify(sources),
    ]
  );

  await pool.query(
    `
    UPDATE chat_sessions
    SET "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = $1
    `,
    [sessionId]
  );

  return result.rows[0];
};

// =====================================================
// UPDATE SESSION TITLE
// =====================================================

const updateChatTitle = async ({
  userId,
  sessionId,
  title,
}) => {
  const result = await pool.query(
    `
    UPDATE chat_sessions
    SET
      title = $1,
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = $2
      AND "userId" = $3
    RETURNING *
    `,
    [title, sessionId, userId]
  );

  return result.rows[0];
};

// =====================================================
// DELETE SESSION
// =====================================================

const deleteChatSession = async ({
  userId,
  sessionId,
}) => {
  const result = await pool.query(
    `
    DELETE FROM chat_sessions
    WHERE id = $1
      AND "userId" = $2
    RETURNING id
    `,
    [sessionId, userId]
  );

  return result.rows.length > 0;
};

module.exports = {
  createChatSession,
  getChatSessions,
  getChatSession,
  addChatMessage,
  updateChatTitle,
  deleteChatSession,
};