"use client";

import { useState } from "react";
import CategoryInput from "@/components/plan/CategoryInput";
import CalendarView, { PlanItem } from "@/components/plan/CalendarView";
import DayDetails from "@/components/plan/DayDetails";
import PageLoader from "@/components/ui/PageLoader";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data Generator
const generateMockPlan = (category: string): PlanItem[] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const plan: PlanItem[] = [];
    const types = ["Promo", "Edukasi", "Hiburan", "Interaksi", "Inspirasi"];
    const formats = ["Foto", "Video", "Carousel", "Reels", "Story"];

    for (let i = 1; i <= daysInMonth; i++) {
        if (Math.random() > 0.4) {
            const date = new Date(year, month, i);
            const type = types[Math.floor(Math.random() * types.length)];
            const format = formats[Math.floor(Math.random() * formats.length)];

            plan.push({
                id: `task-${i}`,
                date: date,
                type: type,
                idea: `${type} content for ${category}: Idea #${i}`,
                format: format
            });
        }
    }
    return plan;
};

export default function PlanPage() {
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [plan, setPlan] = useState<PlanItem[] | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const handleGenerate = (cat: string) => {
        setCategory(cat);
        setIsLoading(true);

        setTimeout(() => {
            setPlan(generateMockPlan(cat));
            setIsLoading(false);
        }, 2000);
    };

    const getTasksForSelectedDate = () => {
        if (!plan || !selectedDate) return [];
        return plan.filter(item =>
            item.date.getDate() === selectedDate.getDate() &&
            item.date.getMonth() === selectedDate.getMonth() &&
            item.date.getFullYear() === selectedDate.getFullYear()
        );
    };

    return (
        <div className="min-h-screen bg-background container-mobile pb-8">
            <div className="space-y-4 md:space-y-6">
                <header className="flex items-center gap-3 md:gap-4 pt-2">
                    <Link
                        href="/"
                        className="p-2 -ml-2 hover:bg-emerald-100 active:bg-emerald-200 rounded-full transition-colors text-secondary"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-secondary">Campaign Planner</h1>
                        <p className="text-xs md:text-base text-emerald-600">Jadwal konten otomatis biar gak pusing.</p>
                    </div>
                </header>

                <main>
                    <AnimatePresence mode="wait">
                        {!plan && !isLoading && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mt-6 md:mt-12"
                            >
                                <CategoryInput onSubmit={handleGenerate} isLoading={isLoading} />
                            </motion.div>
                        )}

                        {isLoading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <PageLoader message={`Menyusun strategi untuk ${category}...`} />
                            </motion.div>
                        )}

                        {plan && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 md:space-y-6"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-2">
                                    <p className="text-lg md:text-xl text-secondary font-bold">
                                        Strategi: <span className="text-primary">{category}</span>
                                    </p>
                                    <button
                                        onClick={() => setPlan(null)}
                                        className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-gray-200 hover:border-primary/30"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Ganti Kategori
                                    </button>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                                    <div className="lg:col-span-2 order-2 lg:order-1">
                                        <CalendarView
                                            plan={plan}
                                            selectedDate={selectedDate}
                                            onSelectDate={setSelectedDate}
                                        />
                                    </div>
                                    <div className="lg:col-span-1 order-1 lg:order-2">
                                        <DayDetails
                                            date={selectedDate}
                                            tasks={getTasksForSelectedDate()}
                                            onAddTask={() => alert("Fitur tambah manual akan segera hadir!")}
                                        />
                                    </div>
                                </div>
                            </motion.div>

                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

