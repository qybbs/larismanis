"use client";

import { useState, useEffect } from "react";
import ChatWindow, { Message } from "@/components/chat/ChatWindow";
import ChatSidebar, { ChatSession } from "@/components/chat/ChatSidebar";
import { ArrowLeft, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";

// Mock Initial Data
const INITIAL_SESSION_ID = "session-1";
const INITIAL_SESSIONS: ChatSession[] = [
    {
        id: INITIAL_SESSION_ID,
        title: "Strategi Penjualan",
        date: new Date(),
        preview: "Bagaimana cara meningkatkan omset..."
    }
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
    [INITIAL_SESSION_ID]: [
        {
            id: "1",
            role: "assistant",
            content: "Halo! Saya LarisManis. Ada yang bisa saya bantu untuk meningkatkan penjualanmu hari ini?",
        }
    ]
};

export default function ConsultPage() {
    const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(INITIAL_SESSION_ID);
    const [messagesBySession, setMessagesBySession] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const currentMessages = currentSessionId ? (messagesBySession[currentSessionId] || []) : [];

    const handleNewChat = () => {
        const newSessionId = Date.now().toString();
        const newSession: ChatSession = {
            id: newSessionId,
            title: "Chat Baru",
            date: new Date(),
            preview: "Mulai percakapan baru..."
        };

        setSessions(prev => [newSession, ...prev]);
        setMessagesBySession(prev => ({
            ...prev,
            [newSessionId]: [{
                id: "init",
                role: "assistant",
                content: "Halo! Ada yang bisa saya bantu?"
            }]
        }));
        setCurrentSessionId(newSessionId);
    };

    const handleDeleteSession = (id: string) => {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (currentSessionId === id) {
            setCurrentSessionId(null);
        }
        // Optional: cleanup messages
    };

    const handleSendMessage = (content: string) => {
        if (!currentSessionId) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: content
        };

        // Update messages
        setMessagesBySession(prev => ({
            ...prev,
            [currentSessionId]: [...(prev[currentSessionId] || []), userMsg]
        }));

        // Update session preview and title if it's "Chat Baru"
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                return {
                    ...s,
                    preview: content,
                    title: s.title === "Chat Baru" ? content.slice(0, 20) + "..." : s.title
                };
            }
            return s;
        }));

        setIsTyping(true);

        // Mock AI Response
        setTimeout(() => {
            let aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Maaf, saya kurang paham. Bisa jelaskan lebih detail?",
            };

            const lowerInput = content.toLowerCase();
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

            setMessagesBySession(prev => ({
                ...prev,
                [currentSessionId]: [...(prev[currentSessionId] || []), aiMsg]
            }));
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background container-mobile flex flex-col h-screen overflow-hidden">
            <div className="space-y-4 md:space-y-8 flex-shrink-0 pt-2 pb-2">
                <header className="flex items-center gap-3 md:gap-4">
                    <Link
                        href="/"
                        className="p-2 -ml-2 hover:bg-emerald-100 active:bg-emerald-200 rounded-full transition-colors text-secondary"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-secondary">Marketing Consultant</h1>
                        <p className="text-sm md:text-base text-emerald-600">Teman curhat bisnis, siap kasih solusi.</p>
                    </div>
                </header>
            </div>

            <main className="flex-1 mt-2 overflow-hidden flex gap-6 pb-4">
                <ChatSidebar
                    sessions={sessions}
                    currentSessionId={currentSessionId}
                    onSelectSession={setCurrentSessionId}
                    onNewChat={handleNewChat}
                    onDeleteSession={handleDeleteSession}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <div className="flex-1 h-full min-w-0">
                    {currentSessionId ? (
                        <ChatWindow
                            messages={currentMessages}
                            onSendMessage={handleSendMessage}
                            isTyping={isTyping}
                            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-secondary mb-2">Pilih Percakapan</h3>
                            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                                Pilih riwayat chat dari sidebar atau mulai topik baru untuk diskusi.
                            </p>
                            <button
                                onClick={handleNewChat}
                                className="bg-primary text-white px-8 py-3.5 rounded-full font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Mulai Chat Baru
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
