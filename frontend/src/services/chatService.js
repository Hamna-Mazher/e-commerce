import api from "./api";

// =====================================================
// CHAT
// =====================================================

export const sendChatMessage = (
  question,
  sessionId = null
) => {
  return api.post("/chat", {
    question,
    sessionId,
  });
};

// =====================================================
// CHAT HISTORY
// =====================================================

export const getChatHistory = () => {
  return api.get("/chat/history");
};

export const getChatHistoryById = (
  sessionId
) => {
  return api.get(
    `/chat/history/${sessionId}`
  );
};

export const deleteChatHistory = (
  sessionId
) => {
  return api.delete(
    `/chat/history/${sessionId}`
  );
};

// =====================================================
// PRODUCT ACTIONS WITH PEXELS IMAGE
// =====================================================

export const createProductWithImage = (
  data
) => {
  return api.post(
    "/product-images/create",
    data
  );
};

export const updateProductWithImage = (
  data
) => {
  return api.put(
    "/product-images/update",
    data
  );
};