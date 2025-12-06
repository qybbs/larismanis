"use client";

import { PlanItem } from "./CalendarView";
import { Plus, Clock, FileText, Video, Image as ImageIcon, MoreVertical } from "lucide-react";

interface DayDetailsProps {
    date: Date;
    tasks: PlanItem[];
    onAddTask: () => void;
}

export default function DayDetails({ date, tasks, onAddTask }: DayDetailsProps) {
    const formatDate = (d: Date) => {
        return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
    };

    const getIcon = (format: string) => {
        switch (format.toLowerCase()) {
            case "video": return <Video className="w-4 h-4" />;
            case "foto": return <ImageIcon className="w-4 h-4" />;
            case "carousel": return <FileText className="w-4 h-4" />;
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
                        <p>Belum ada konten untuk hari ini.<br />Mulai tambahkan ide!</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="group bg-white border border-gray-100 hover:border-emerald-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide">
                                    {task.theme}
                                </span>
                                <button className="text-gray-300 hover:text-gray-500">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                            <h4 className="font-medium text-gray-800 mb-2 leading-snug">{task.visual_idea}</h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.caption_hook}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                    {getIcon(task.content_type)}
                                    {task.content_type}
                                </span>
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                    {task.platform}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
