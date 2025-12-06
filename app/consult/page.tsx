"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatWindow, { Message } from "@/components/chat/ChatWindow";
import ChatSidebar, { ChatSession } from "@/components/chat/ChatSidebar";
import { ArrowLeft, MessageSquare, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import {
    streamChatMessage,
    fetchChatSession,
    deleteChatSession,
    getCurrentUserId,
    type ChatMessage as DbChatMessage
} from "@/lib/api";

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
                type: "offer_campaign" as const,
                label: "Buka Content Planner",
                description: "Klik untuk membuat jadwal konten",
            };
        default:
            return undefined;
    }
};

// Transform database messages to UI messages
const transformDbMessagesToUi = (dbMessages: DbChatMessage[]): Message[] => {
    return dbMessages.map((msg, index) => ({
        id: `msg-${index}`,
        role: msg.role,
        content: msg.content,
    }));
};

// Generate title from first user message
const generateTitleFromMessages = (messages: DbChatMessage[]): string => {
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg) {
        return firstUserMsg.content.slice(0, 25) + (firstUserMsg.content.length > 25 ? "..." : "");
    }
    return "Chat Session";
};

export default function ConsultPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isWaitingStream, setIsWaitingStream] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
    const router = useRouter();

    // Load chat session on mount
    useEffect(() => {
        const loadSession = async () => {
            setIsLoading(true);
            try {
                const userId = await getCurrentUserId();
                if (!userId) {
                    // Not logged in - show empty state
                    setIsLoading(false);
                    return;
                }

                const session = await fetchChatSession();

                if (session && session.messages.length > 0) {
                    // Transform to UI format
                    const uiMessages = transformDbMessagesToUi(session.messages);
                    setMessages(uiMessages);

                    // Create session entry for sidebar
                    const sessionEntry: ChatSession = {
                        id: session.id,
                        title: generateTitleFromMessages(session.messages),
                        date: new Date(session.updated_at),
                        preview: session.messages[session.messages.length - 1]?.content.slice(0, 50) || "",
                    };
                    setSessions([sessionEntry]);
                    setCurrentSessionId(session.id);
                } else {
                    // No existing session - show welcome state
                    setSessions([]);
                    setCurrentSessionId(null);
                }
            } catch (err) {
                console.error("Error loading session:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, []);

    const handleNewChat = useCallback(async () => {
        // Clear current messages and start fresh
        // The session will be created automatically when user sends first message
        setMessages([{
            id: "welcome",
            role: "assistant",
            content: "Halo! Saya Mas Anis dan saya adalah Agen AI LarisManis. Ada yang bisa saya bantu untuk mengembangkan bisnismu hari ini?",
        }]);

        // Generate temp session ID
        const tempSessionId = `temp-${Date.now()}`;
        const newSession: ChatSession = {
            id: tempSessionId,
            title: "Chat Baru",
            date: new Date(),
            preview: "Mulai percakapan baru...",
        };

        setSessions([newSession]);
        setCurrentSessionId(tempSessionId);
    }, []);

    const handleDeleteSession = useCallback(async (id: string) => {
        try {
            await deleteChatSession();
            setSessions([]);
            setMessages([]);
            setCurrentSessionId(null);
        } catch (err) {
            console.error("Error deleting session:", err);
            alert("Gagal menghapus chat. Silakan coba lagi.");
        }
    }, []);

    const handleSendMessage = useCallback(async (content: string) => {
        if (!currentSessionId) return;

        const userMsgId = Date.now().toString();
        const userMsg: Message = {
            id: userMsgId,
            role: "user",
            content: content
        };

        // Add user message immediately
        setMessages(prev => [...prev, userMsg]);

        // Update session preview
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
        setIsWaitingStream(true);

        // Create placeholder for assistant message
        const assistantMsgId = (Date.now() + 1).toString();
        const placeholderMsg: Message = {
            id: assistantMsgId,
            role: "assistant",
            content: "",
        };

        setMessages(prev => [...prev, placeholderMsg]);
        setStreamingMessageId(assistantMsgId);

        // Stream the response
        await streamChatMessage(
            content,
            // onChunk - update message content progressively
            (chunk) => {
                setIsWaitingStream(false);
                setMessages(prev => prev.map(msg => {
                    if (msg.id === assistantMsgId) {
                        return { ...msg, content: msg.content + chunk };
                    }
                    return msg;
                }));
            },
            // onComplete - add action if needed
            (fullResponse, action) => {
                console.log("stream complete", { fullResponse, action });
                const actionObj = createActionFromResponse(action);
                setMessages(prev => prev.map(msg => {
                    if (msg.id === assistantMsgId) {
                        return { ...msg, content: fullResponse, action: actionObj };
                    }
                    return msg;
                }));
                setIsTyping(false);
                setIsWaitingStream(false);
                setStreamingMessageId(null);
            },
            // onError
            (error) => {
                console.error("Stream error:", error);

                if (error.message.includes("Authentication required")) {
                    alert("Silakan login terlebih dahulu.");
                    router.push("/login");
                    // Remove the placeholder message
                    setMessages(prev => prev.filter(msg => msg.id !== assistantMsgId));
                } else {
                    // Show error in the placeholder message
                    setMessages(prev => prev.map(msg => {
                        if (msg.id === assistantMsgId) {
                            return { ...msg, content: `Maaf, terjadi kesalahan: ${error.message}` };
                        }
                        return msg;
                    }));
                }

                setIsTyping(false);
                setIsWaitingStream(false);
                setStreamingMessageId(null);
            }
        );
    }, [currentSessionId, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-gray-500">Memuat riwayat chat...</p>
                </div>
            </div>
        );
    }

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
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isTyping={(isTyping && !streamingMessageId) || isWaitingStream}
                            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-secondary mb-2">Mulai Konsultasi</h3>
                            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                                Tanyakan apapun tentang strategi bisnis, marketing, atau ide konten.
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
