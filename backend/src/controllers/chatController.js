const {
  runAgent,
} = require("../services/agentServices");

const {
  createChatSession,
  getChatSession,
  addChatMessage,
  updateChatTitle,
} = require("../services/chatHistoryService");

// =====================================================
// CHAT
// =====================================================

const chat = async (req, res) => {
  try {
    const {
      question,
      sessionId,
    } = req.body || {};

    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    let session;
    let history = [];

    // -----------------------------------------
    // Existing session
    // -----------------------------------------

    if (sessionId) {
      const sessionData =
        await getChatSession({
          userId: req.user.id,
          sessionId,
        });

      if (!sessionData) {
        return res.status(404).json({
          message:
            "Chat session not found",
        });
      }

      session =
        sessionData.session;

      history =
        sessionData.messages;
    }

    // -----------------------------------------
    // New session
    // -----------------------------------------

    else {
      session =
        await createChatSession({
          userId: req.user.id,
        });
    }

    // -----------------------------------------
    // Run AI agent
    // -----------------------------------------

    const result =
      await runAgent({
        question: question.trim(),
        user: req.user,
        history,
      });

    // -----------------------------------------
    // Save user message
    // -----------------------------------------

    await addChatMessage({
      sessionId: session.id,
      role: "user",
      content: question.trim(),
    });

    // -----------------------------------------
    // Save assistant message
    // -----------------------------------------

    await addChatMessage({
      sessionId: session.id,
      role: "assistant",
      content: result.answer,
      sources: [],
    });

    // -----------------------------------------
    // Generate title
    // -----------------------------------------

    if (
      !session.title ||
      session.title ===
        "New Chat"
    ) {
      await updateChatTitle({
        userId: req.user.id,
        sessionId: session.id,
        title:
          question
            .trim()
            .slice(0, 60),
      });
    }

    return res.status(200).json({
      sessionId: session.id,
      answer: result.answer,
      action: result.action,
    });
  } catch (error) {
    console.error(
      "Chat Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to process request",
      error: error.message,
    });
  }
};

module.exports = {
  chat,
};