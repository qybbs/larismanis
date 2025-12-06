"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, Menu } from "lucide-react";
import { motion } from "framer-motion";
import Markdown from "react-markdown";
import ActionSuggestion from "./ActionSuggestion";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: {
    type: "create_poster" | "open_planner" | "consult_more" | "generate_image" | "content_planning" | "unknown";
    label: string;
    prompt?: string;
    description?: string;
  };
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isTyping: boolean;
  onToggleSidebar: () => void;
}

export default function ChatWindow({ messages, onSendMessage, isTyping, onToggleSidebar }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative font-sans">
      {/* App Header */}
      <div className="px-4 md:px-0 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-secondary text-base leading-tight">LarisManis AI</h3>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-400">
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 space-y-6" ref={scrollRef}>
        {messages.filter(m => m.role !== "assistant" || m.content.trim() !== "").length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Mulai percakapan baru dengan LarisManis AI.</p>
          </div>
        )}
        {messages
          .filter((msg) => msg.role !== "assistant" || msg.content.trim() !== "")
          .map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] min-w-[140px] min-h-[56px] p-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${msg.role === "user"
                ? "bg-primary text-white rounded-tr-none"
                : "bg-white text-gray-800 rounded-tl-none shadow-sm"
                }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-emerald max-w-none prose-headings:text-secondary prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:text-emerald-700 prose-hr:my-3 prose-hr:border-emerald-100">
                  <Markdown>{msg.content}</Markdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
              {msg.action && (
                <div className="mt-3 pt-3 border-t border-gray-100/20">
                  <ActionSuggestion action={msg.action} />
                </div>
              )}
              <span className={`text-[10px] absolute bottom-1 right-2 opacity-60 ${msg.role === 'user' ? 'text-white' : 'text-gray-400'}`}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
              <span className="text-xs text-gray-400 mr-2">Sedang mengetik</span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="py-4 md:py-6">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 bg-white rounded-[1.5rem] px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm border border-gray-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="w-full bg-transparent border-0 focus:ring-0 p-2 text-gray-800 placeholder:text-gray-400 max-h-32"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-primary text-white p-3.5 rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>

  );
}
