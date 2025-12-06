"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChatWindow, { Message } from "@/components/chat/ChatWindow";
import ChatSidebar, { ChatSession } from "@/components/chat/ChatSidebar";
import { ArrowLeft, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { getContextChatUser } from "@/lib/api";

// Initial Data
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

// Helper to create action based on backend response
const createActionFromResponse = (action: "unknown" | "generate_image" | "content_planning") => {
    switch (action) {
        case "generate_image":
            return {
                type: "generate_image" as const,
                label: "Buat Konten Visual",
                description: "Klik untuk membuat poster/gambar iklan",
            };
        case "content_planning":
            return {
                type: "content_planning" as const,
                label: "Buka Content Planner",
                description: "Klik untuk membuat jadwal konten",
            };
        default:
            return undefined;
    }
};

export default function ConsultPage() {
    const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(INITIAL_SESSION_ID);
    const [messagesBySession, setMessagesBySession] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();

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
    };

    const handleSendMessage = async (content: string) => {
        if (!currentSessionId) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: content
        };

        // Update messages with user message
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

        try {
            // Call real API
            const response = await getContextChatUser(content);

            if (response.success && response.data) {
                const action = createActionFromResponse(response.data.action);

                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: response.data.geminiResponse,
                    action: action,
                };

                setMessagesBySession(prev => ({
                    ...prev,
                    [currentSessionId]: [...(prev[currentSessionId] || []), aiMsg]
                }));
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Error getting chat response:", err);

            let errorMessage = "Maaf, terjadi kesalahan. Silakan coba lagi.";

            if (err instanceof Error) {
                if (err.message.includes("Authentication required")) {
                    alert("Silakan login terlebih dahulu.");
                    router.push("/login");
                    setIsTyping(false);
                    return;
                }
                errorMessage = `Maaf, terjadi kesalahan: ${err.message}`;
            }

            const errorAiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: errorMessage,
            };

            setMessagesBySession(prev => ({
                ...prev,
                [currentSessionId]: [...(prev[currentSessionId] || []), errorAiMsg]
            }));
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="min-h-screen bg-background container-mobile flex flex-col h-screen overflow-hidden">
            <div className="space-y-4 md:space-y-8 flex-shrink-0 pt-2 pb-2">
                <header className="flex items-center gap-3 md:gap-4">
                    <Link
                        href="/dashboard"
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
