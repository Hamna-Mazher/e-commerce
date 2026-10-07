const {
  getChatSessions,
  getChatSession,
  deleteChatSession,
} = require("../services/chatHistoryService");

// =====================================================
// GET CHAT HISTORY
// =====================================================

const getHistory = async (
  req,
  res
) => {
  try {
    const sessions =
      await getChatSessions({
        userId: req.user.id,
      });

    return res.status(200).json({
      sessions,
    });
  } catch (error) {
    console.error(
      "Get Chat History Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load chat history",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE CHAT
// =====================================================

const getHistoryById = async (
  req,
  res
) => {
  try {
    const chat =
      await getChatSession({
        userId: req.user.id,
        sessionId:
          req.params.id,
      });

    if (!chat) {
      return res.status(404).json({
        message:
          "Chat session not found",
      });
    }

    return res.status(200).json(
      chat
    );
  } catch (error) {
    console.error(
      "Get Chat Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load chat",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE CHAT
// =====================================================

const deleteHistory = async (
  req,
  res
) => {
  try {
    const deleted =
      await deleteChatSession({
        userId: req.user.id,
        sessionId:
          req.params.id,
      });

    if (!deleted) {
      return res.status(404).json({
        message:
          "Chat session not found",
      });
    }

    return res.status(200).json({
      message:
        "Chat deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Chat Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete chat",
      error: error.message,
    });
  }
};

module.exports = {
  getHistory,
  getHistoryById,
  deleteHistory,
};