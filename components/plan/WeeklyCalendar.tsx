"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Lightbulb, Video, Image as ImageIcon, Sparkles } from "lucide-react";

export interface PlanItem {
    day: string;
    type: "Promo" | "Edukasi" | "Hiburan" | "Interaksi";
    idea: string;
    format: "Video" | "Foto" | "Carousel";
}

interface WeeklyCalendarProps {
    plan: PlanItem[];
}

export default function WeeklyCalendar({ plan }: WeeklyCalendarProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "Promo": return <Sparkles className="w-5 h-5 text-emerald-500" />;
            case "Edukasi": return <Lightbulb className="w-5 h-5 text-amber-500" />;
            default: return <CalendarCheck className="w-5 h-5 text-blue-500" />;
        }
    };

    const getFormatIcon = (format: string) => {
        switch (format) {
            case "Video": return <Video className="w-4 h-4" />;
            default: return <ImageIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-8 relative">
            <h3 className="text-xl md:text-2xl font-bold text-secondary text-center mb-8">
                Rencana Konten Minggu Ini
            </h3>

            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plan.map((item, index) => (
                    <motion.div
                        key={item.day}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                    >
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                            {/* Color Indicator Strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.type === 'Promo' ? 'bg-emerald-500' :
                                item.type === 'Edukasi' ? 'bg-amber-500' :
                                    'bg-blue-500'
                                }`} />

                            <div className="flex items-start justify-between mb-3 pl-3">
                                <div>
                                    <span className="block text-lg font-bold text-secondary">{item.day}</span>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${item.type === 'Promo' ? 'bg-emerald-100 text-emerald-700' :
                                        item.type === 'Edukasi' ? 'bg-amber-100 text-amber-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {item.type}
                                    </span>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-primary transition-colors">
                                    {getIcon(item.type)}
                                </div>
                            </div>

                            <p className="text-secondary/80 font-medium text-base leading-relaxed mb-4 pl-3">
                                "{item.idea}"
                            </p>

                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg w-fit ml-3">
                                {getFormatIcon(item.format)}
                                <span>Format: <span className="font-semibold">{item.format}</span></span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
