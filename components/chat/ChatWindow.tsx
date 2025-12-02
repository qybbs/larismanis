"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ActionSuggestion from "./ActionSuggestion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: {
    type: "create_poster";
    label: string;
    prompt: string;
  };
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Halo! Saya LarisManis. Ada yang bisa saya bantu untuk meningkatkan penjualanmu hari ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mock AI Response Logic
    setTimeout(() => {
      let aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Maaf, saya kurang paham. Bisa jelaskan lebih detail?",
      };

      const lowerInput = userMsg.content.toLowerCase();
      if (lowerInput.includes("sepi") || lowerInput.includes("turun")) {
        aiMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Wah, jangan patah semangat! Kalau lagi sepi, biasanya strategi 'Bundle Hemat' atau 'Menu Baru' cukup ampuh. Coba deh bikin poster promo yang menarik.",
          action: {
            type: "create_poster",
            label: "Buat Poster Promo",
            prompt: "Poster promo makanan bundle hemat diskon menarik",
          },
        };
      } else if (lowerInput.includes("ide") || lowerInput.includes("konten")) {
        aiMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Untuk ide konten, kamu bisa coba selang-seling antara edukasi produk dan hiburan. Mau saya buatkan jadwal mingguan?",
        };
      }

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 md:rounded-[2.5rem] md:shadow-2xl md:border md:border-gray-200 overflow-hidden relative font-sans">
      {/* App Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
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
        <button className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400">
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#e5ddd5]/10" ref={scrollRef}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${msg.role === "user"
                ? "bg-primary text-white rounded-tr-none"
                : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                }`}
            >
              <p>{msg.content}</p>
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
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
              <span className="text-xs text-gray-400 mr-2">Sedang mengetik</span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <div className="flex-1 bg-gray-100 rounded-[1.5rem] px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
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
