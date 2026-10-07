import { useState } from "react";
import { Bot, Send, X, MessageCircle, Loader2 } from "lucide-react";
import { sendChatMessage } from "../../services/chatService";

function Chatbot() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I can help you with products, orders, tasks, and meetings.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const question = input.trim();

    if (!question || loading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(question);

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          res.data.answer ||
          "I couldn't find an answer.",
        sources: res.data.sources || [],
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      };

      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:scale-105 hover:bg-blue-700"
          aria-label="Open AI Assistant"
        >
          <MessageCircle size={25} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <Bot size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  AI Assistant
                </h2>

                <p className="text-xs text-slate-400">
                  Project knowledge assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-br-md bg-blue-600 text-white"
                      : "rounded-bl-md bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {message.content}
                  </p>

                  {/* Optional Sources */}
                  {message.sources?.length > 0 && (
                    <div className="mt-3 border-t border-slate-700 pt-2">
                      <p className="text-xs text-slate-500">
                        Sources:{" "}
                        {message.sources
                          .map(
                            (source) =>
                              `${source.sourceType} #${source.sourceId}`
                          )
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-slate-800 px-4 py-3 text-sm text-slate-400">
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-end gap-2 rounded-xl border border-slate-700 bg-slate-800 p-2">

              <textarea
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about your project..."
                disabled={loading}
                className="max-h-24 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={18} />
              </button>

            </div>

            <p className="mt-2 text-center text-[11px] text-slate-600">
              Answers are based on available project data.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;