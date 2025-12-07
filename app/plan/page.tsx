"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CategoryInput from "@/components/plan/CategoryInput";
import CalendarView, { PlanItem } from "@/components/plan/CalendarView";
import DayDetails from "@/components/plan/DayDetails";
import AddPlanModal from "@/components/plan/AddPlanModal";
import GenerateModal from "@/components/plan/GenerateModal";
import DeleteConfirmModal from "@/components/plan/DeleteConfirmModal";
import PlannerOnboarding from "@/components/plan/PlannerOnboarding";
import PageLoader from "@/components/ui/PageLoader";
import { ArrowLeft, RefreshCw, Sparkles, ChevronDown, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
    generateContentPlanning, 
    generateContentPlanningFromDate,
    parseDateDDMMYYYY, 
    fetchContentPlans,
    saveContentPlan,
    saveMultipleContentPlans,
    deleteContentPlan,
    type ContentPlan,
    type ContentPlanInput,
    type FlattenedPlanItem,
} from "@/lib/api";

// Transform API response to PlanItem format for calendar
const transformContentPlansToPlanItems = (plans: ContentPlan[], category?: string): PlanItem[] => {
    return plans.map((plan, index) => ({
        id: `generated-${index}-${plan.date}`,
        date: parseDateDDMMYYYY(plan.date),
        theme: plan.theme,
        content_type: plan.content_type,
        visual_idea: plan.visual_idea,
        caption_hook: plan.caption_hook,
        platform: plan.platform,
        category: category || "Promosi",
    }));
};

// Transform flattened DB items to PlanItem format (they're already similar)
const transformFlattenedToPlanItems = (items: FlattenedPlanItem[]): PlanItem[] => {
    return items.map(item => ({
        id: item.id,
        date: item.date,
        theme: item.theme,
        content_type: item.content_type,
        visual_idea: item.visual_idea,
        caption_hook: item.caption_hook,
        platform: item.platform,
        category: item.category,
    }));
};

export default function PlanPage() {
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [plan, setPlan] = useState<PlanItem[] | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
    
    // New state for onboarding, filter, and delete confirmation
    const [showOnboarding, setShowOnboarding] = useState(true);
    const [selectedBusinessType, setSelectedBusinessType] = useState<string>("all");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<PlanItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const router = useRouter();

    // Get unique business types from plans
    const uniqueBusinessTypes = useMemo(() => {
        if (!plan) return [];
        const types = new Set(plan.map(p => p.category).filter(Boolean));
        return Array.from(types) as string[];
    }, [plan]);

    // Filter plans by selected business type
    const filteredPlan = useMemo(() => {
        if (!plan) return null;
        if (selectedBusinessType === "all") return plan;
        return plan.filter(p => p.category === selectedBusinessType);
    }, [plan, selectedBusinessType]);

    // Load existing plans on mount
    useEffect(() => {
        const loadExistingPlans = async () => {
            try {
                const existingPlans = await fetchContentPlans();
                if (existingPlans.length > 0) {
                    const planItems = transformFlattenedToPlanItems(existingPlans);
                    setPlan(planItems);
                    setHasLoadedHistory(true);
                }
            } catch (err) {
                console.error("Error loading existing plans:", err);
            }
        };
        loadExistingPlans();
    }, []);

    const handleGenerate = async (cat: string) => {
        setCategory(cat);
        setIsLoading(true);
        setError(null);

        try {
            const response = await generateContentPlanning(cat, cat);

            if (response.success && response.data?.contentPlans?.plans) {
                const planItems = transformContentPlansToPlanItems(response.data.contentPlans.plans, cat);
                
                // Save generated plans to database
                const plansToSave: ContentPlanInput[] = planItems.map(item => ({
                    date: item.date,
                    theme: item.theme,
                    content_type: item.content_type,
                    visual_idea: item.visual_idea,
                    caption_hook: item.caption_hook,
                    platform: item.platform,
                    category: item.category || "Promosi",
                }));

                try {
                    const savedPlans = await saveMultipleContentPlans(plansToSave);
                    const savedPlanItems = transformFlattenedToPlanItems(savedPlans);
                    
                    // Merge with existing plans
                    setPlan(prev => {
                        if (prev) {
                            return [...prev, ...savedPlanItems];
                        }
                        return savedPlanItems;
                    });
                } catch (saveErr) {
                    console.error("Error saving generated plans:", saveErr);
                    // Still show the plans even if save fails
                    setPlan(prev => prev ? [...prev, ...planItems] : planItems);
                }
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
            // Hide category input after generation (success or partial success)
            if (!error) {
                setShowCategoryInput(false);
            }
        }
    };

    const handleEmptyDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsGenerateModalOpen(true);
    };

    const handleGenerateAI = async () => {
        const businessType = category || "Bisnis Umum";
        setIsGenerating(true);
        setError(null);

        try {
            const response = await generateContentPlanningFromDate(businessType, selectedDate);

            if (response.success && response.data?.contentPlans?.plans) {
                const planItems = transformContentPlansToPlanItems(response.data.contentPlans.plans, businessType);
                
                // Save generated plans to database
                const plansToSave: ContentPlanInput[] = planItems.map(item => ({
                    date: item.date,
                    theme: item.theme,
                    content_type: item.content_type,
                    visual_idea: item.visual_idea,
                    caption_hook: item.caption_hook,
                    platform: item.platform,
                    category: item.category || "Promosi",
                }));

                try {
                    const savedPlans = await saveMultipleContentPlans(plansToSave, businessType);
                    const savedPlanItems = transformFlattenedToPlanItems(savedPlans);
                    
                    setPlan(prev => {
                        if (prev) {
                            return [...prev, ...savedPlanItems];
                        }
                        return savedPlanItems;
                    });
                } catch (saveErr) {
                    console.error("Error saving generated plans:", saveErr);
                    setPlan(prev => prev ? [...prev, ...planItems] : planItems);
                }
            }
        } catch (err) {
            console.error("Error generating content from date:", err);
            if (err instanceof Error && err.message.includes("Authentication required")) {
                alert("Silakan login terlebih dahulu.");
                router.push("/login");
            }
        } finally {
            setIsGenerating(false);
            setIsGenerateModalOpen(false);
        }
    };

    const handleManualAdd = () => {
        setIsGenerateModalOpen(false);
        setIsModalOpen(true);
    };

    const handleAddPlan = async (planData: {
        theme: string;
        content_type: string;
        visual_idea: string;
        caption_hook: string;
        platform: string;
        category: string;
    }) => {
        setIsSaving(true);
        
        try {
            const newPlan: ContentPlanInput = {
                date: selectedDate,
                ...planData,
            };

            const savedPlan = await saveContentPlan(newPlan);
            
            if (savedPlan) {
                const planItem: PlanItem = {
                    id: savedPlan.id,
                    date: savedPlan.date,
                    theme: savedPlan.theme,
                    content_type: savedPlan.content_type,
                    visual_idea: savedPlan.visual_idea,
                    caption_hook: savedPlan.caption_hook,
                    platform: savedPlan.platform,
                    category: savedPlan.category,
                };

                setPlan(prev => {
                    if (prev) {
                        return [...prev, planItem];
                    }
                    return [planItem];
                });
            }

            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving plan:", err);
            alert("Gagal menyimpan plan. Silakan coba lagi.");
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteModal = (item: PlanItem) => {
        setPlanToDelete(item);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!planToDelete) return;

        setIsDeleting(true);
        try {
            await deleteContentPlan(planToDelete.id);
            setPlan(prev => {
                if (!prev) return null;
                return prev.filter(p => p.id !== planToDelete.id);
            });
            setDeleteModalOpen(false);
            setPlanToDelete(null);
        } catch (err) {
            console.error("Error deleting plan:", err);
            alert("Gagal menghapus. Silakan coba lagi.");
        } finally {
            setIsDeleting(false);
        }
    };

    const getTasksForSelectedDate = useCallback(() => {
        if (!filteredPlan || !selectedDate) return [];
        return filteredPlan.filter(item =>
            item.date.getDate() === selectedDate.getDate() &&
            item.date.getMonth() === selectedDate.getMonth() &&
            item.date.getFullYear() === selectedDate.getFullYear()
        );
    }, [filteredPlan, selectedDate]);

    const handleReset = () => {
        setPlan(null);
        setCategory("");
        setError(null);
        setHasLoadedHistory(false);
        setShowOnboarding(true);
        setSelectedBusinessType("all");
    };

    // Show CategoryInput form for generating new plans
    const [showCategoryInput, setShowCategoryInput] = useState(false);

    const handleViewExisting = () => {
        setShowOnboarding(false);
        setShowCategoryInput(false);
    };

    const handleGenerateNew = () => {
        setShowOnboarding(false);
        setShowCategoryInput(true); // Show the category input form
    };

    const handleBackToOnboarding = () => {
        setShowOnboarding(true);
        setShowCategoryInput(false);
    };

    const showCalendar = !showOnboarding && !showCategoryInput && (plan || hasLoadedHistory);

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
                        {showOnboarding && !showCategoryInput && !isLoading && (
                            <motion.div
                                key="onboarding"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mt-6 md:mt-8"
                            >
                                <PlannerOnboarding
                                    hasExistingPlans={hasLoadedHistory}
                                    onGenerateNew={handleGenerateNew}
                                    onViewExisting={handleViewExisting}
                                />

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

                        {/* Category Input for generating new plans */}
                        {showCategoryInput && !isLoading && (
                            <motion.div
                                key="category-input"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mt-6 md:mt-12"
                            >
                                <div className="max-w-xl mx-auto">
                                    <button
                                        onClick={handleBackToOnboarding}
                                        className="mb-4 text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Kembali
                                    </button>
                                </div>
                                <CategoryInput onSubmit={handleGenerate} isLoading={isLoading} initialValue={category} />

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

                        {showCalendar && !isLoading && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 md:space-y-6"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-2">
                                    {/* Left side - Filter dropdown */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {uniqueBusinessTypes.length > 0 && (
                                            <div className="relative">
                                                <select
                                                    value={selectedBusinessType}
                                                    onChange={(e) => setSelectedBusinessType(e.target.value)}
                                                    className="appearance-none text-sm bg-white px-4 py-2 pr-8 rounded-full border border-gray-200 hover:border-emerald-300 transition-colors text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                                >
                                                    <option value="all">Semua Kategori</option>
                                                    {uniqueBusinessTypes.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        )}
                                        {isGenerating && (
                                            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                                <Sparkles className="w-4 h-4 animate-pulse" />
                                                Generating...
                                            </div>
                                        )}
                                    </div>
                                    {/* Right side - Add new category button */}
                                    <button
                                        onClick={() => setShowCategoryInput(true)}
                                        className="text-sm text-white hover:bg-emerald-600 transition-colors flex items-center gap-2 bg-primary px-4 py-2 rounded-full shadow-md hover:shadow-lg"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tambah Kategori
                                    </button>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                                    <div className="lg:col-span-2 order-2 lg:order-1">
                                        <CalendarView
                                            plan={filteredPlan || []}
                                            selectedDate={selectedDate}
                                            onSelectDate={setSelectedDate}
                                            onEmptyDayClick={handleEmptyDayClick}
                                        />
                                    </div>
                                    <div className="lg:col-span-1 order-1 lg:order-2">
                                        <DayDetails
                                            date={selectedDate}
                                            tasks={getTasksForSelectedDate()}
                                            onAddTask={() => setIsModalOpen(true)}
                                            onDeleteTask={(id) => {
                                                const item = plan?.find(p => p.id === id);
                                                if (item) openDeleteModal(item);
                                            }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Add Plan Modal */}
            <AddPlanModal
                isOpen={isModalOpen}
                date={selectedDate}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddPlan}
                isLoading={isSaving}
            />

            {/* Generate Choice Modal */}
            <GenerateModal
                isOpen={isGenerateModalOpen}
                date={selectedDate}
                isGenerating={isGenerating}
                onClose={() => setIsGenerateModalOpen(false)}
                onGenerateAI={handleGenerateAI}
                onAddManual={handleManualAdd}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                itemName={planToDelete?.theme || planToDelete?.visual_idea?.substring(0, 30) || "Konten ini"}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setPlanToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
