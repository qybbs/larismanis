"use client";

import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface PlannerOnboardingProps {
    hasExistingPlans: boolean;
    onGenerateNew: () => void;
    onViewExisting: () => void;
}

export default function PlannerOnboarding({ 
    hasExistingPlans, 
    onGenerateNew, 
    onViewExisting 
}: PlannerOnboardingProps) {
    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-3">
                    Selamat Datang di Campaign Planner! 🎯
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Rencanakan konten bisnismu dengan mudah dan terorganisir
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Generate New Option */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={onGenerateNew}
                    className="group p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all text-left"
                >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-emerald-700 transition-colors">
                        Buat Planning Baru ✨
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                        Generate 7 hari konten otomatis dengan AI berdasarkan kategori bisnismu
                    </p>
                    <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm group-hover:gap-3 transition-all">
                        <span>Mulai Generate</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </motion.button>

                {/* View Existing Option */}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={onViewExisting}
                    className={`group p-6 rounded-3xl border-2 text-left transition-all ${
                        hasExistingPlans 
                            ? "bg-white border-gray-200 hover:border-blue-400 hover:shadow-xl" 
                            : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                    }`}
                    disabled={!hasExistingPlans}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform ${
                        hasExistingPlans 
                            ? "bg-gradient-to-br from-blue-500 to-indigo-500 group-hover:scale-110" 
                            : "bg-gray-300"
                    }`}>
                        <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 transition-colors ${
                        hasExistingPlans 
                            ? "text-secondary group-hover:text-blue-700" 
                            : "text-gray-400"
                    }`}>
                        Lihat Planning Saya 📅
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                        {hasExistingPlans 
                            ? "Buka kalender dan lihat riwayat planning yang sudah dibuat"
                            : "Belum ada planning tersimpan"
                        }
                    </p>
                    {hasExistingPlans && (
                        <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
                            <span>Buka Kalender</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
