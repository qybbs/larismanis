"use client";

import { MessageSquare, Plus, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatSession {
    id: string;
    title: string;
    date: Date;
    preview: string;
}

interface ChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
    onDeleteSession: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatSidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    isOpen,
    onClose
}: ChatSidebarProps) {
    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                className={`
                    fixed md:relative inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-secondary text-lg">Riwayat Chat</h2>
                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Coming Soon</span>
                        </div>
                        <button onClick={onClose} className="md:hidden p-2 text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* New Chat Button */}
                    <div className="p-4">
                        <button
                            disabled
                            className="w-full flex items-center justify-center gap-2 bg-gray-300 text-gray-500 font-bold py-3 rounded-xl cursor-not-allowed opacity-60"
                        >
                            <Plus className="w-5 h-5" />
                            Chat Baru
                        </button>
                    </div>

                    {/* Session List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
                        {/* Disabled Overlay */}
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <div className="text-center px-6">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <MessageSquare className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Fitur Segera Hadir</p>
                                <p className="text-xs text-gray-400">Riwayat chat akan tersedia dalam waktu dekat</p>
                            </div>
                        </div>

                        {sessions.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                Belum ada riwayat chat.
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`
                                        group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                                        ${currentSessionId === session.id
                                            ? "bg-emerald-50 border border-emerald-100"
                                            : "hover:bg-gray-50 border border-transparent hover:border-gray-100"
                                        }
                                    `}
                                    onClick={() => {
                                        onSelectSession(session.id);
                                        if (window.innerWidth < 768) onClose();
                                    }}
                                >
                                    <div className={`
                                        p-2 rounded-lg flex-shrink-0
                                        ${currentSessionId === session.id ? "bg-white text-primary shadow-sm" : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-primary group-hover:shadow-sm transition-all"}
                                    `}>
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium text-sm truncate ${currentSessionId === session.id ? "text-primary" : "text-gray-700"}`}>
                                            {session.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 truncate">
                                            {session.preview}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteSession(session.id);
                                        }}
                                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
}
