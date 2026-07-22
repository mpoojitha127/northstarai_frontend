import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Send } from "lucide-react";

import { api, ChatResponse, Goal, Message } from "../lib/api";
import { AlignmentBadge } from "../components/AlignmentBadge";
import { StarMark } from "../components/StarMark";

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState("");

  const [conversationId, setConversationId] = useState<string | null>(
    searchParams.get("conversation")
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // -----------------------------
  // Load Goals
  // -----------------------------
  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await api.get<Goal[]>("/goals?status_filter=active");
        setGoals(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadGoals();
  }, []);

  // -----------------------------
  // Load Conversation Messages
  // -----------------------------
  useEffect(() => {
    if (!conversationId) return;

    async function loadConversation() {
      try {
        const data = await api.get<Message[]>(
          `/chat/conversations/${conversationId}/messages`
        );

        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadConversation();
  }, [conversationId]);

  // -----------------------------
  // Auto Scroll
  // -----------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  // -----------------------------
  // Send Message
  // -----------------------------
  async function handleSend() {
    if (!input.trim()) return;

    if (sending) return;

    setError("");

    const text = input;

    setInput("");

    setSending(true);

    const optimisticUser: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      alignment_verdict: null,
      alignment_reason: null,
      alignment_alternative: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const res = await api.post<ChatResponse>("/chat", {
        conversation_id: conversationId,
        goal_id: selectedGoalId || null,
        message: text,
      });

      // Save conversation
      setConversationId(res.conversation_id);

      // Update URL
      setSearchParams({
        conversation: res.conversation_id,
      });

      // Always reload messages from backend
      const updatedMessages = await api.get<Message[]>(
        `/chat/conversations/${res.conversation_id}/messages`
      );

      setMessages(updatedMessages);
    } catch (err) {
      console.error(err);

      setError("Failed to send message.");

      // Restore input if request failed
      setInput(text);

      // Remove optimistic message
      setMessages((prev) =>
        prev.filter((m) => m.id !== optimisticUser.id)
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="flex flex-col h-screen">
      {/* ---------------- Header ---------------- */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-semibold">
            {conversationId ? "Conversation" : "New Conversation"}
          </h1>

          {conversationId && (
            <p className="text-xs text-ink-muted mt-1">
              Conversation ID: {conversationId.slice(0, 8)}...
            </p>
          )}
        </div>

        <select
          className="input-field w-64"
          value={selectedGoalId}
          onChange={(e) => setSelectedGoalId(e.target.value)}
        >
          <option value="">No goal linked (General Chat)</option>

          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      </header>

      {/* ---------------- Messages ---------------- */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages.length === 0 && !sending && (
          <div className="max-w-2xl mx-auto text-center mt-24">
            <StarMark
              size={36}
              className="text-gold-400 mx-auto mb-4"
              animated
            />

            <h2 className="text-xl font-semibold mb-2">
              Welcome to NorthStar
            </h2>

            <p className="text-ink-muted">
              Link a goal and every AI response will be strategically reviewed
              before reaching you.
            </p>
          </div>
        )}

        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              {msg.role === "user" ? (
                <div className="bg-star-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] whitespace-pre-wrap">
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[90%]">

                  {msg.alignment_verdict && (
                    <AlignmentBadge
                      verdict={msg.alignment_verdict}
                      reason={msg.alignment_reason ?? undefined}
                      alternative={msg.alignment_alternative ?? undefined}
                    />
                  )}

                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ---------------- Thinking Indicator ---------------- */}

          {sending && (
            <div className="flex items-start gap-3 animate-pulse">
              <StarMark
                size={20}
                className="text-gold-400 mt-1"
                animated
              />

              <div>
                <p className="font-medium">
                  NorthStar is thinking...
                </p>

                <p className="text-sm text-ink-muted">
                  🧠 Generating AI response...
                </p>

                <p className="text-sm text-ink-muted">
                  🧭 Reviewing alignment with your long-term goal...
                </p>

                <p className="text-sm text-ink-muted">
                  ✨ Preparing the best response...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-red-300">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ---------------- Input ---------------- */}

      <div className="border-t border-border px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <textarea
            className="input-field min-h-[52px] max-h-48 resize-none"
            placeholder="Ask NorthStar anything..."
            value={input}
            disabled={sending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            className="btn-primary h-12 w-12 !p-0"
            disabled={sending}
            onClick={handleSend}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}