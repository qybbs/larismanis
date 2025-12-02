"use client";

import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    isProcessing: boolean;
}

export default function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                onFileSelect(e.dataTransfer.files[0]);
            }
        },
        [onFileSelect]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                onFileSelect(e.target.files[0]);
            }
        },
        [onFileSelect]
    );

    return (
        <div
            className={`relative w-full max-w-2xl mx-auto h-80 md:h-96 rounded-[2.5rem] transition-all duration-500 flex flex-col items-center justify-center overflow-hidden ${isDragging
                ? "bg-primary/10 scale-[1.02] shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                : "bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl hover:bg-white/50"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Glass Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent opacity-50 pointer-events-none" />

            <AnimatePresence mode="wait">
                {isProcessing ? (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center space-y-6 text-center p-6 md:p-8 relative z-10"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping blur-xl" />
                            <div className="relative bg-white p-6 rounded-full shadow-xl">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight">
                                Meracik Bumbu Digital...
                            </h3>
                            <p className="text-sm md:text-base text-secondary/60 font-medium px-4">
                                AI sedang menganalisis foto produkmu & membuatkan caption terbaik.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center space-y-8 text-center p-6 md:p-8 relative z-10"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
                            <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Upload className="w-10 h-10 text-primary group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground p-2 rounded-full shadow-lg animate-bounce">
                                <Sparkles className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            <h3 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight px-4">
                                Upload Foto Produk
                            </h3>
                            <p className="text-sm md:text-base text-secondary/60 max-w-sm mx-auto leading-relaxed px-4">
                                Tarik & lepas foto di sini, atau klik tombol di bawah.
                                <br />
                                <span className="text-sm text-primary font-medium">
                                    Biar AI yang kerjakan sisanya.
                                </span>
                            </p>
                        </div>

                        <label className="cursor-pointer group relative px-6 md:px-8 py-3.5 md:py-4 bg-primary text-white rounded-xl font-bold shadow-lg overflow-hidden transition-all active:scale-95 md:hover:shadow-primary/30 md:hover:shadow-2xl md:hover:-translate-y-1 text-sm md:text-base">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center gap-2 justify-center">
                                <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                                Pilih Foto Galeri
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileInput}
                            />
                        </label>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
