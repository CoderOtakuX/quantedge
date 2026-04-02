"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface StockChatProps {
  ticker: string;
  stockData: any;
}

const SUGGESTIONS = [
  "What is the revenue trend?",
  "How does it compare to peers?",
  "Is the debt level concerning?",
  "What are the key risks?",
];

export default function StockChat({ ticker, stockData }: StockChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      console.log('Sending stockData:', JSON.stringify(stockData, null, 2));
      const response = await fetch(`/api/ai/chat/${ticker}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, stockData }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Add empty assistant message to append text to
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantMessage,
          };
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm shadow-black/5 max-w-4xl mx-auto h-[600px]">
      <div className="bg-surface-container-lowest p-5 border-b border-outline-variant/10 flex items-center justify-between">
        <h3 className="font-bold text-[#1E2761]">Ask AI about {ticker}</h3>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B] bg-[#F4F6FB] px-2 py-1 rounded">Beta</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white min-h-[420px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <h4 className="text-[#1E2761] font-bold text-lg">What would you like to know?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="bg-[#F4F6FB] hover:bg-[#1E2761]/5 text-[#1E2761] font-medium text-sm py-3 px-4 rounded-xl border border-[#64748B]/10 transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#1E2761] text-white rounded-tl-2xl rounded-tr-sm rounded-bl-2xl shadow-sm"
                    : "bg-[#F4F6FB] text-[#1E2761] rounded-tr-2xl rounded-tl-sm rounded-br-2xl shadow-sm border border-[#64748B]/10"
                }`}
              >
                {msg.content}
                {msg.role === "assistant" && loading && i === messages.length - 1 && msg.content === "" && (
                  <div className="flex items-center gap-1 h-5">
                    <span className="w-1.5 h-1.5 bg-[#1E2761]/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#1E2761]/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#1E2761]/40 rounded-full animate-bounce"></span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 border-t border-[#64748B]/10 bg-surface-container-lowest">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            placeholder="Ask about revenue, peers, or risks..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white border border-[#1E2761]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent transition-all placeholder:text-[#64748B]/50 text-[#1E2761]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#1E2761] text-white px-5 rounded-xl hover:bg-[#1E2761]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        <p className="text-center text-[9px] text-[#64748B] tracking-wider uppercase mt-3 font-semibold">
          Powered by Groq • AI may make mistakes. Verify critical data.
        </p>
      </div>
    </div>
  );
}
