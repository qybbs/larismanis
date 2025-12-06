"use client";

import { X, Sparkles, PenLine, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GenerateModalProps {
    isOpen: boolean;
    date: Date;
    isGenerating: boolean;
    onClose: () => void;
    onGenerateAI: () => void;
    onAddManual: () => void;
}

export default function GenerateModal({ 
    isOpen, 
    date, 
    isGenerating,
    onClose, 
    onGenerateAI, 
    onAddManual 
}: GenerateModalProps) {
    const formatDate = (d: Date) => {
        return d.toLocaleDateString("id-ID", { 
            weekday: "long", 
            day: "numeric", 
            month: "long", 
            year: "numeric" 
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={!isGenerating ? onClose : undefined}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 pb-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-secondary">
                                        Tambah Konten
                                    </h3>
                                    <p className="text-sm text-emerald-600 mt-0.5">
                                        {formatDate(date)}
                                    </p>
                                </div>
                                {!isGenerating && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/80 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {isGenerating ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-8 space-y-4"
                                >
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center animate-pulse">
                                            <Sparkles className="w-8 h-8 text-white" />
                                        </div>
                                        <Loader2 className="w-20 h-20 text-emerald-500 absolute -top-2 -left-2 animate-spin" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-semibold text-secondary">
                                            Generating dengan AI...
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Menyusun 7 hari konten untuk kamu
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <>
                                    <p className="text-center text-gray-600 mb-2">
                                        Bagaimana kamu ingin menambahkan konten?
                                    </p>

                                    {/* AI Generate Option */}
                                    <button
                                        onClick={onGenerateAI}
                                        className="w-full p-5 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-400 hover:shadow-lg transition-all group text-left"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <Sparkles className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-secondary group-hover:text-emerald-700 transition-colors">
                                                    Generate dengan AI ✨
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Buat 7 hari konten otomatis mulai dari tanggal ini
                                                </p>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Manual Add Option */}
                                    <button
                                        onClick={onAddManual}
                                        className="w-full p-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all group text-left"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                                                <PenLine className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-secondary">
                                                    Tambah Manual
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Buat konten sendiri dengan detail lengkap
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
