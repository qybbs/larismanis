"use client";

import { useState } from "react";
import { PlanItem } from "./CalendarView";
import { Plus, Clock, FileText, Video, Image as ImageIcon, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Category color mapping
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    "Promosi": { bg: "bg-rose-50", text: "text-rose-700" },
    "Edukasi": { bg: "bg-blue-50", text: "text-blue-700" },
    "Hiburan": { bg: "bg-amber-50", text: "text-amber-700" },
    "Behind The Scene": { bg: "bg-violet-50", text: "text-violet-700" },
    "Testimoni": { bg: "bg-cyan-50", text: "text-cyan-700" },
    "Tips & Trik": { bg: "bg-teal-50", text: "text-teal-700" },
    "Hard Sell": { bg: "bg-rose-50", text: "text-rose-700" },
    "default": { bg: "bg-emerald-50", text: "text-emerald-700" },
};

const getCategoryColor = (category?: string) => {
    return CATEGORY_COLORS[category || ""] || CATEGORY_COLORS["default"];
};

interface DayDetailsProps {
    date: Date;
    tasks: PlanItem[];
    onAddTask: () => void;
    onDeleteTask?: (id: string) => void;
}

export default function DayDetails({ date, tasks, onAddTask, onDeleteTask }: DayDetailsProps) {
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    const toggleCard = (id: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const formatDate = (d: Date) => {
        return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
    };

    const getIcon = (format: string) => {
        switch (format.toLowerCase()) {
            case "video": return <Video className="w-4 h-4" />;
            case "foto": return <ImageIcon className="w-4 h-4" />;
            case "carousel": return <FileText className="w-4 h-4" />;
            case "reels": return <Video className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 h-full flex flex-col">
            <div className="p-6 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/30">
                <div>
                    <h3 className="text-lg font-bold text-secondary">{formatDate(date)}</h3>
                    <p className="text-sm text-emerald-600">{tasks.length} Konten Terjadwal</p>
                </div>
                <button
                    onClick={onAddTask}
                    className="p-2 bg-primary text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {tasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-gray-300" />
                        </div>
                        <p>Belum ada konten untuk hari ini.<br />Klik + untuk menambahkan!</p>
                    </div>
                ) : (
                    tasks.map((task) => {
                        const categoryColors = getCategoryColor(task.category || task.content_type);
                        const isExpanded = expandedCards.has(task.id);
                        const hasLongContent = (task.caption_hook?.length || 0) > 80 || (task.visual_idea?.length || 0) > 60;

                        return (
                            <div 
                                key={task.id} 
                                className="group bg-white border border-gray-100 hover:border-emerald-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${categoryColors.bg} ${categoryColors.text}`}>
                                            {task.category || task.content_type}
                                        </span>
                                        {task.category && task.theme && (
                                            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
                                                {task.theme}
                                            </span>
                                        )}
                                    </div>
                                    {onDeleteTask && (
                                        <button 
                                            onClick={() => onDeleteTask(task.id)}
                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Visual Idea */}
                                <h4 className={`font-medium text-gray-800 mb-2 leading-snug ${!isExpanded ? 'line-clamp-2' : ''}`}>
                                    {task.visual_idea}
                                </h4>

                                {/* Caption Hook */}
                                <AnimatePresence initial={false}>
                                    <motion.div
                                        initial={false}
                                        animate={{ height: isExpanded ? 'auto' : 'auto' }}
                                    >
                                        <p className={`text-sm text-gray-600 mb-3 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                                            {task.caption_hook}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Expand/Collapse Button + Metadata */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                            {getIcon(task.content_type)}
                                            {task.content_type}
                                        </span>
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                            {task.platform}
                                        </span>
                                    </div>

                                    {hasLongContent && (
                                        <button
                                            onClick={() => toggleCard(task.id)}
                                            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <span>Lebih sedikit</span>
                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                </>
                                            ) : (
                                                <>
                                                    <span>Selengkapnya</span>
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}


