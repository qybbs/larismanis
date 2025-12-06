"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryInput from "@/components/plan/CategoryInput";
import CalendarView, { PlanItem } from "@/components/plan/CalendarView";
import DayDetails from "@/components/plan/DayDetails";
import PageLoader from "@/components/ui/PageLoader";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { generateContentPlanning, parseDateDDMMYYYY, type ContentPlan } from "@/lib/api";

// Transform API response to PlanItem format for calendar
const transformContentPlansToPlanItems = (plans: ContentPlan[]): PlanItem[] => {
    return plans.map((plan, index) => ({
        id: `plan-${index}-${plan.date}`,
        date: parseDateDDMMYYYY(plan.date),
        theme: plan.theme,
        content_type: plan.content_type,
        visual_idea: plan.visual_idea,
        caption_hook: plan.caption_hook,
        platform: plan.platform,
    }));
};

export default function PlanPage() {
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [plan, setPlan] = useState<PlanItem[] | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleGenerate = async (cat: string) => {
        setCategory(cat);
        setIsLoading(true);
        setError(null);

        try {
            // businessName and businessType both use the category input
            // startDate is automatically set to today in the API function
            const response = await generateContentPlanning(cat, cat);

            if (response.success && response.data?.contentPlans?.plans) {
                const planItems = transformContentPlansToPlanItems(response.data.contentPlans.plans);
                setPlan(planItems);
            } else {
                throw new Error("Invalid response format from API");
            }
        } catch (err) {
            console.error("Error generating content plan:", err);

            if (err instanceof Error) {
                if (err.message.includes("Authentication required")) {
                    alert("Silakan login terlebih dahulu.");
                    router.push("/login");
                    return;
                }
                setError(err.message);
            } else {
                setError("Gagal membuat content plan. Silakan coba lagi.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getTasksForSelectedDate = () => {
        if (!plan || !selectedDate) return [];
        return plan.filter(item =>
            item.date.getDate() === selectedDate.getDate() &&
            item.date.getMonth() === selectedDate.getMonth() &&
            item.date.getFullYear() === selectedDate.getFullYear()
        );
    };

    const handleReset = () => {
        setPlan(null);
        setCategory("");
        setError(null);
    };

    return (
        <div className="min-h-screen bg-background container-mobile pb-8">
            <div className="space-y-4 md:space-y-6">
                <header className="flex items-center gap-3 md:gap-4 pt-2">
                    <Link
                        href="/dashboard"
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

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 max-w-xl mx-auto"
                                    >
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                                            {error}
                                        </div>
                                    </motion.div>
                                )}
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
                                        onClick={handleReset}
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
