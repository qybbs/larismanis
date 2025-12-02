"use client";

import { useState } from "react";
import CategoryInput from "@/components/plan/CategoryInput";
import WeeklyCalendar, { PlanItem } from "@/components/plan/WeeklyCalendar";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

// Mock Data Generator
const generateMockPlan = (category: string): PlanItem[] => [
    { day: "Senin", type: "Promo", idea: `Promo awal minggu! Diskon khusus untuk ${category}.`, format: "Foto" },
    { day: "Selasa", type: "Edukasi", idea: `Tips memilih ${category} yang berkualitas.`, format: "Carousel" },
    { day: "Rabu", type: "Hiburan", idea: `Meme lucu tentang pelanggan ${category}.`, format: "Foto" },
    { day: "Kamis", type: "Promo", idea: "Flash sale 2 jam saja!", format: "Video" },
    { day: "Jumat", type: "Interaksi", idea: "Tanya jawab (Q&A) seputar produk.", format: "Video" },
    { day: "Sabtu", type: "Hiburan", idea: "Behind the scene proses packing.", format: "Video" },
    { day: "Minggu", type: "Edukasi", idea: "Review jujur dari pelanggan setia.", format: "Carousel" },
];

export default function PlanPage() {
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [plan, setPlan] = useState<PlanItem[] | null>(null);

    const handleGenerate = (cat: string) => {
        setCategory(cat);
        setIsLoading(true);

        // Simulate AI Delay
        setTimeout(() => {
            setPlan(generateMockPlan(cat));
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background container-mobile">
            <div className="space-y-6 md:space-y-8">
                <header className="flex items-center gap-3 md:gap-4 pt-2">
                    <Link
                        href="/"
                        className="p-2 -ml-2 hover:bg-emerald-100 active:bg-emerald-200 rounded-full transition-colors text-secondary"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-secondary">Campaign Planner</h1>
                        <p className="text-sm md:text-base text-emerald-600">Jadwal konten otomatis biar gak pusing.</p>
                    </div>
                </header>

                <main>
                    {!plan && !isLoading && (
                        <div className="mt-8 md:mt-12">
                            <CategoryInput onSubmit={handleGenerate} isLoading={isLoading} />
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-gray-500">Sedang menyusun strategi untuk {category}...</p>
                        </div>
                    )}

                    {plan && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                                <p className="text-secondary">
                                    Strategi untuk: <span className="font-bold">{category}</span>
                                </p>
                                <button
                                    onClick={() => setPlan(null)}
                                    className="text-xs text-primary hover:underline mt-1"
                                >
                                    Ganti Kategori
                                </button>
                            </div>
                            <WeeklyCalendar plan={plan} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
