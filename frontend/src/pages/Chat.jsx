import {
  useEffect,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Database,
  Plus,
  Trash2,
  MessageSquare,
} from "lucide-react";

import DashboardLayout from "../components/layouts/DashboardLayout";

import {
  sendChatMessage,
  getChatHistory,
  getChatHistoryById,
  deleteChatHistory,
  createProductWithImage,
  updateProductWithImage,
} from "../services/chatService";

import ProductImageSelector from "../components/chat/ProductImageSelector";

import toast from "react-hot-toast";

function Chat() {
  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [history, setHistory] =
    useState([]);

  const [sessionId, setSessionId] =
    useState(null);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const messagesEndRef =
    useRef(null);

  // =====================================================
  // SCROLL TO BOTTOM
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages,
    loading,
  ]);

  // =====================================================
  // LOAD CHAT HISTORY
  // =====================================================

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const res =
        await getChatHistory();

      setHistory(
        res.data.sessions || []
      );
    } catch (error) {
      console.error(
        "History error:",
        error
      );

      toast.error(
        "Failed to load chat history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // =====================================================
  // IMAGE CONFIRMATION
  // =====================================================

  const handleImageConfirm = async (
    selectedImage,
    action
  ) => {
    if (
      !selectedImage ||
      !action
    ) {
      return;
    }

    try {
      setLoading(true);

      const imageUrl =
        selectedImage.originalImageUrl ||
        selectedImage.largeImageUrl ||
        selectedImage.imageUrl;

      if (!imageUrl) {
        toast.error(
          "Selected image URL is missing."
        );

        return;
      }

      let response;

      // =================================================
      // CREATE PRODUCT + IMAGE
      // =================================================

      if (
        action.action ===
        "create_product"
      ) {
        response =
          await createProductWithImage({
            name:
              action.product?.name,

            description:
              action.product?.description ||
              "",

            price: Number(
              action.product?.price
            ),

            category:
              action.product?.category,

            imageUrl,
          });
      }

      // =================================================
      // UPDATE PRODUCT + IMAGE
      // =================================================

      else if (
        action.action ===
        "update_product"
      ) {
        response =
          await updateProductWithImage({
            id: Number(
              action.productId
            ),

            name:
              action.product?.name,

            description:
              action.product
                ?.description || "",

            price: Number(
              action.product?.price
            ),

            category:
              action.product?.category,

            imageUrl,
          });
      }

      // =================================================
      // INVALID ACTION
      // =================================================

      else {
        toast.error(
          "Unsupported product action."
        );

        return;
      }

      // =================================================
      // ADD SUCCESS MESSAGE TO CHAT
      // =================================================

      const successMessage = {
        id:
          `assistant-${Date.now()}`,

        role: "assistant",

        content:
          response.data?.message ||
          "Product action completed successfully.",

        sources: [],

        action: null,
      };

      setMessages(
        (prev) => [
          ...prev,
          successMessage,
        ]
      );

      toast.success(
        response.data?.message ||
          "Product action completed successfully."
      );

      await loadHistory();
    } catch (error) {
      console.error(
        "Image confirmation error:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          error.message ||
          "Failed to complete product action."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD CHAT SESSION
  // =====================================================

  const openChat = async (
    id
  ) => {
    try {
      setLoading(true);

      const res =
        await getChatHistoryById(
          id
        );

      setSessionId(
        res.data.session.id
      );

      setMessages(
        (res.data.messages || []).map(
          (message) => ({
            id: message.id,

            role:
              message.role,

            content:
              message.content,

            sources:
              message.sources ||
              [],

            action:
              message.action ||
              null,
          })
        )
      );
    } catch (error) {
      console.error(
        "Open chat error:",
        error
      );

      toast.error(
        "Failed to open chat."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // NEW CHAT
  // =====================================================

  const newChat = () => {
    setSessionId(null);

    setMessages([]);

    setInput("");
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSend = async () => {
    const question =
      input.trim();

    if (
      !question ||
      loading
    ) {
      return;
    }

    const userMessage = {
      id:
        `user-${Date.now()}`,

      role: "user",

      content: question,

      sources: [],

      action: null,
    };

    setMessages(
      (prev) => [
        ...prev,
        userMessage,
      ]
    );

    setInput("");
    setLoading(true);

    try {
      const res =
        await sendChatMessage(
          question,
          sessionId
        );

      setSessionId(
        res.data.sessionId
      );

      const assistantMessage = {
        id:
          `assistant-${Date.now()}`,

        role: "assistant",

        content:
          res.data.answer ||
          "I couldn't find an answer.",

        sources:
          res.data.sources ||
          [],

        action:
          res.data.action ||
          null,
      };

      setMessages(
        (prev) => [
          ...prev,
          assistantMessage,
        ]
      );

      await loadHistory();
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE CHAT
  // =====================================================

  const handleDeleteChat = async (
    e,
    id
  ) => {
    e.stopPropagation();

    try {
      await deleteChatHistory(
        id
      );

      setHistory(
        (prev) =>
          prev.filter(
            (chat) =>
              chat.id !== id
          )
      );

      if (
        sessionId === id
      ) {
        newChat();
      }

      toast.success(
        "Chat deleted."
      );
    } catch (error) {
      console.error(
        "Delete chat error:",
        error
      );

      toast.error(
        "Failed to delete chat."
      );
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      handleSend();
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">

        {/* =================================================
            HISTORY
        ================================================= */}

        <aside className="hidden w-72 shrink-0 border-r border-slate-700 bg-slate-950 md:flex md:flex-col">

          <div className="flex items-center justify-between border-b border-slate-800 p-4">

            <div className="flex items-center gap-2">
              <MessageSquare
                size={18}
                className="text-blue-400"
              />

              <span className="font-semibold text-white">
                Chat History
              </span>
            </div>

            <button
              onClick={newChat}
              className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700"
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">

            {historyLoading ? (
              <p className="p-3 text-sm text-slate-500">
                Loading history...
              </p>
            ) : history.length === 0 ? (
              <div className="p-4 text-center">
                <MessageSquare
                  size={24}
                  className="mx-auto text-slate-600"
                />

                <p className="mt-2 text-sm text-slate-500">
                  No conversations yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map(
                  (chat) => (
                    <button
                      key={chat.id}
                      onClick={() =>
                        openChat(
                          chat.id
                        )
                      }
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                        sessionId ===
                        chat.id
                          ? "bg-blue-600/15 text-blue-400"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium">
                          {chat.title ||
                            chat.firstMessage ||
                            "New Chat"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {chat.updatedAt
                            ? new Date(
                                chat.updatedAt
                              ).toLocaleDateString()
                            : ""}
                        </p>

                      </div>

                      <span
                        onClick={(e) =>
                          handleDeleteChat(
                            e,
                            chat.id
                          )
                        }
                        className="ml-2 rounded-md p-1.5 text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                      >
                        <Trash2
                          size={14}
                        />
                      </span>
                    </button>
                  )
                )}
              </div>
            )}

          </div>
        </aside>

        {/* =================================================
            MAIN CHAT
        ================================================= */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                <Sparkles
                  size={23}
                />
              </div>

              <div>
                <h1 className="font-bold text-white">
                  AI Assistant
                </h1>

                <p className="text-xs text-slate-500">
                  Project knowledge assistant
                </p>
              </div>

            </div>

            <button
              onClick={newChat}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Plus size={16} />
              New Chat
            </button>

          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">

            {messages.length === 0 ? (
              <div className="mx-auto flex h-full max-w-3xl items-center justify-center">

                <div className="w-full text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400">
                    <Bot size={31} />
                  </div>

                  <h2 className="mt-5 text-2xl font-bold text-white">
                    How can I help?
                  </h2>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Ask questions about products,
                    orders, tasks, and meetings
                    available to you.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">

                    <button
                      onClick={() =>
                        setInput(
                          "What products do we have?"
                        )
                      }
                      className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-left transition hover:border-blue-500/40 hover:bg-slate-800"
                    >
                      <p className="text-sm font-medium text-white">
                        Products
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Explore products
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        setInput(
                          "What tasks are pending?"
                        )
                      }
                      className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-left transition hover:border-blue-500/40 hover:bg-slate-800"
                    >
                      <p className="text-sm font-medium text-white">
                        Tasks
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Find pending tasks
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        setInput(
                          "What meetings do I have?"
                        )
                      }
                      className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-left transition hover:border-blue-500/40 hover:bg-slate-800"
                    >
                      <p className="text-sm font-medium text-white">
                        Meetings
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        View your meetings
                      </p>
                    </button>

                  </div>

                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-6">

                {messages.map(
                  (message) => (
                    <div
                      key={
                        message.id
                      }
                      className={`flex gap-3 ${
                        message.role ===
                        "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      {/* Assistant icon */}
                      {message.role ===
                        "assistant" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/15 text-blue-400">
                          <Bot
                            size={18}
                          />
                        </div>
                      )}

                      {/* Message */}
                      <div
                        className={`max-w-[85%] min-w-0 rounded-2xl px-5 py-4 ${
                          message.role ===
                          "user"
                            ? "rounded-br-md bg-blue-600 text-white"
                            : "rounded-bl-md border border-slate-700 bg-slate-800 text-slate-200"
                        }`}
                      >

                        <div className="flex items-start gap-2">

                          {message.role ===
                            "user" && (
                            <User
                              size={16}
                              className="mt-1 shrink-0"
                            />
                          )}

                         <div className="text-sm leading-7">
  <ReactMarkdown
    components={{
      h1: ({ children }) => (
        <h1 className="mb-3 text-xl font-bold text-white">
          {children}
        </h1>
      ),

      h2: ({ children }) => (
        <h2 className="mb-3 mt-5 text-lg font-bold text-white">
          {children}
        </h2>
      ),

      h3: ({ children }) => (
        <h3 className="mb-2 mt-4 text-base font-semibold text-white">
          {children}
        </h3>
      ),

      p: ({ children }) => (
        <p className="mb-3 last:mb-0">
          {children}
        </p>
      ),

      strong: ({ children }) => (
        <strong className="font-semibold text-white">
          {children}
        </strong>
      ),

      ul: ({ children }) => (
        <ul className="mb-3 ml-5 list-disc space-y-1">
          {children}
        </ul>
      ),

      ol: ({ children }) => (
        <ol className="mb-3 ml-5 list-decimal space-y-2">
          {children}
        </ol>
      ),

      li: ({ children }) => (
        <li className="pl-1">
          {children}
        </li>
      ),

      code: ({ children }) => (
        <code className="rounded bg-slate-900 px-1.5 py-0.5 text-xs text-blue-300">
          {children}
        </code>
      ),
    }}
  >
    {message.content}
  </ReactMarkdown>
</div>

                        </div>

                        {/* =================================================
                            PRODUCT IMAGE SELECTION
                        ================================================= */}

                        {message.action
                          ?.requiresImageSelection && (
                          <ProductImageSelector
                            action={
                              message.action
                            }
                            loading={
                              loading
                            }
                            onConfirm={(
                              selectedImage
                            ) =>
                              handleImageConfirm(
                                selectedImage,
                                message.action
                              )
                            }
                          />
                        )}

                        {/* =================================================
                            SOURCES
                        ================================================= */}

                        {message.role ===
                          "assistant" &&
                          message.sources
                            ?.length >
                            0 && (
                            <div className="mt-4 border-t border-slate-700 pt-3">

                              <div className="mb-2 flex items-center gap-2 text-slate-500">

                                <Database
                                  size={13}
                                />

                                <span className="text-xs">
                                  Sources
                                </span>

                              </div>

                              <div className="flex flex-wrap gap-2">

                                {message.sources.map(
                                  (
                                    source,
                                    index
                                  ) => (
                                    <span
                                      key={`${source.sourceType}-${source.sourceId}-${index}`}
                                      className="rounded-md bg-slate-900 px-2 py-1 text-[11px] text-slate-500"
                                    >
                                      {
                                        source.sourceType
                                      }{" "}
                                      #
                                      {
                                        source.sourceId
                                      }
                                    </span>
                                  )
                                )}

                              </div>
                            </div>
                          )}

                      </div>
                    </div>
                  )
                )}

                {/* Loading */}
                {loading && (
                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/15 text-blue-400">
                      <Bot size={18} />
                    </div>

                    <div className="rounded-2xl rounded-bl-md border border-slate-700 bg-slate-800 px-5 py-4">

                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />

                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-slate-500"
                          style={{
                            animationDelay:
                              "150ms",
                          }}
                        />

                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-slate-500"
                          style={{
                            animationDelay:
                              "300ms",
                          }}
                        />
                      </div>

                    </div>
                  </div>
                )}

                <div
                  ref={
                    messagesEndRef
                  }
                />

              </div>
            )}

          </div>

          {/* Input */}
          <div className="border-t border-slate-700 p-4 sm:p-6">

            <div className="mx-auto max-w-4xl">

              <div className="flex items-end gap-3 rounded-2xl border border-slate-700 bg-slate-800 p-2 focus-within:border-blue-500/50">

                <textarea
                  value={input}
                  onChange={(e) =>
                    setInput(
                      e.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  disabled={loading}
                  rows={1}
                  placeholder="Ask about products, orders, tasks or meetings..."
                  className="max-h-32 min-h-[48px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />

                <button
                  onClick={
                    handleSend
                  }
                  disabled={
                    !input.trim() ||
                    loading
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={18} />
                </button>

              </div>

              <p className="mt-2 text-center text-[11px] text-slate-600">
                Answers and actions are based on your
                available project data.
              </p>

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default Chat;