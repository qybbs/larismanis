"use client";

import { useState } from "react";
import { X, Sparkles, Video, Image as ImageIcon, FileText, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddPlanModalProps {
    isOpen: boolean;
    date: Date;
    onClose: () => void;
    onSubmit: (plan: {
        theme: string;
        content_type: string;
        visual_idea: string;
        caption_hook: string;
        platform: string;
        category: string;
    }) => void;
    isLoading?: boolean;
}

const CONTENT_TYPES = [
    { value: "Video", icon: Video, color: "bg-rose-100 text-rose-700 border-rose-200" },
    { value: "Foto", icon: ImageIcon, color: "bg-amber-100 text-amber-700 border-amber-200" },
    { value: "Carousel", icon: LayoutGrid, color: "bg-violet-100 text-violet-700 border-violet-200" },
    { value: "Story", icon: FileText, color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
];

const PLATFORMS = ["Instagram", "TikTok", "Facebook", "Twitter/X", "YouTube"];

const CATEGORIES = ["Promosi", "Edukasi", "Hiburan", "Behind The Scene", "Testimoni", "Tips & Trik"];

export default function AddPlanModal({ isOpen, date, onClose, onSubmit, isLoading }: AddPlanModalProps) {
    const [theme, setTheme] = useState("");
    const [contentType, setContentType] = useState("Foto");
    const [visualIdea, setVisualIdea] = useState("");
    const [captionHook, setCaptionHook] = useState("");
    const [platform, setPlatform] = useState("Instagram");
    const [category, setCategory] = useState("Promosi");

    const formatDate = (d: Date) => {
        return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!theme.trim() || !visualIdea.trim()) return;

        onSubmit({
            theme: theme.trim(),
            content_type: contentType,
            visual_idea: visualIdea.trim(),
            caption_hook: captionHook.trim(),
            platform,
            category,
        });

        // Reset form
        setTheme("");
        setVisualIdea("");
        setCaptionHook("");
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
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-[5%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-3xl shadow-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                            <div>
                                <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-emerald-500" />
                                    Tambah Konten
                                </h3>
                                <p className="text-sm text-emerald-600 mt-0.5">{formatDate(date)}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/80 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
                            {/* Theme */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tema Konten <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    placeholder="Contoh: Promo Weekend, Tips Bisnis..."
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-gray-800"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Content Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tipe Konten
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {CONTENT_TYPES.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = contentType === type.value;
                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setContentType(type.value)}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                                                    isSelected
                                                        ? type.color + " border-current"
                                                        : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"
                                                }`}
                                                disabled={isLoading}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="text-xs font-medium">{type.value}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kategori
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                                category === cat
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                            disabled={isLoading}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Visual Idea */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ide Visual <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={visualIdea}
                                    onChange={(e) => setVisualIdea(e.target.value)}
                                    placeholder="Deskripsikan visual yang ingin dibuat..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-gray-800 resize-none"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Caption Hook */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Caption Hook
                                </label>
                                <textarea
                                    value={captionHook}
                                    onChange={(e) => setCaptionHook(e.target.value)}
                                    placeholder="Hook pembuka yang menarik perhatian..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-gray-800 resize-none"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Platform */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Platform
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PLATFORMS.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPlatform(p)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                                platform === p
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                            disabled={isLoading}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                                    disabled={isLoading}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={!theme.trim() || !visualIdea.trim() || isLoading}
                                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200"
                                >
                                    {isLoading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
