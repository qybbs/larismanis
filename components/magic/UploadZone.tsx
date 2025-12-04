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
            className={`relative w-full max-w-2xl mx-auto min-h-[400px] md:min-h-[500px] rounded-[2.5rem] transition-all duration-500 flex flex-col items-center justify-center overflow-hidden ${isDragging
                ? "bg-primary/5 scale-[1.02] border-2 border-dashed border-primary"
                : "hover:bg-white/20 border-2 border-dashed border-transparent hover:border-emerald-100/50"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
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
                        className="flex flex-col items-center justify-center space-y-6 md:space-y-8 text-center p-4 md:p-8 relative z-10 w-full h-full"
                    >
                        <div className="relative group mt-4 md:mt-0">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 border border-white/50">
                                <Upload className="w-8 h-8 md:w-10 md:h-10 text-primary/80 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-white text-primary p-2 rounded-full shadow-sm animate-bounce">
                                <Sparkles className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-3 max-w-md mx-auto">
                            <h3 className="text-xl md:text-3xl font-bold text-secondary tracking-tight px-4">
                                Upload Foto Produk
                            </h3>
                            <p className="text-sm md:text-base text-secondary/60 leading-relaxed px-4">
                                Tarik & lepas foto di sini, atau klik tombol di bawah.
                                <br className="hidden md:block" />
                                <span className="text-sm text-primary font-medium block mt-1">
                                    Biar AI yang kerjakan sisanya.
                                </span>
                            </p>
                        </div>

                        <label className="cursor-pointer group relative px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 overflow-hidden transition-all active:scale-95 hover:shadow-primary/40 hover:-translate-y-1 mb-4 md:mb-0">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center gap-2 justify-center">
                                <ImageIcon className="w-5 h-5" />
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
