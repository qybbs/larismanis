"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface CategoryInputProps {
    onSubmit: (category: string) => void;
    isLoading: boolean;
    initialValue?: string;
}

export default function CategoryInput({ onSubmit, isLoading, initialValue = "" }: CategoryInputProps) {
    const [category, setCategory] = useState(initialValue);

    useEffect(() => {
        setCategory(initialValue);
    }, [initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (category.trim()) {
            onSubmit(category);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto text-center space-y-5 md:space-y-6 px-4">
            <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-bold text-secondary">
                    Apa Kategori Usahamu?
                </h2>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                    Kami akan buatkan jadwal konten seminggu penuh yang pas buatmu.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Contoh: Coffeeshop, Jual Baju Anak, Bengkel..."
                    className="w-full pl-5 pr-14 py-3.5 md:py-4 rounded-full border-2 border-emerald-100 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none text-base md:text-lg transition-all shadow-sm"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!category.trim() || isLoading}
                    className="absolute right-1.5 md:right-2 top-1.5 md:top-2 bottom-1.5 md:bottom-2 bg-primary text-white p-2.5 md:p-3 rounded-full hover:bg-emerald-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Search className="w-5 h-5" />
                </button>
            </form>

            <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm text-gray-400">
                <span className="py-1">Populer:</span>
                {["Kuliner", "Fashion", "Jasa", "Elektronik"].map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setCategory(tag)}
                        className="hover:text-primary active:text-primary underline decoration-dotted px-2 py-1 min-h-[32px]"
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
}
