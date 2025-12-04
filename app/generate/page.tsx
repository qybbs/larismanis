"use client";

import { useState, useEffect, Suspense } from "react";
import UploadZone from "@/components/magic/UploadZone";
import GeneratingLoader from "@/components/ui/GeneratingLoader";
import PageLoader from "@/components/ui/PageLoader";
import { ArrowLeft, Copy, Check, CalendarDays, Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function GenerateContent() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{ image: string; caption: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const searchParams = useSearchParams();
    const promptParam = searchParams.get("prompt");

    useEffect(() => {
        if (promptParam) {
            console.log("Auto-filling prompt:", promptParam);
        }
    }, [promptParam]);

    const [imageStyle, setImageStyle] = useState("Modern");
    const [captionStyle, setCaptionStyle] = useState("Professional");

    const imageStyles = [
        { id: "Modern", label: "Modern", desc: "Clean & sleek", emoji: "✨" },
        { id: "Vintage", label: "Vintage", desc: "Retro charm", emoji: "📻" },
        { id: "Futuristic", label: "Futuristic", desc: "Tech-forward", emoji: "🚀" },
        { id: "Minimalist", label: "Minimalist", desc: "Less is more", emoji: "◻️" },
        { id: "Luxury", label: "Luxury", desc: "Premium feel", emoji: "💎" },
        { id: "Playful", label: "Playful", desc: "Fun & energetic", emoji: "🎨" },
    ];

    const captionStyles = [
        { id: "Professional", label: "Professional", desc: "Trustworthy & clear", emoji: "💼" },
        { id: "Friendly", label: "Friendly", desc: "Warm & approachable", emoji: "👋" },
        { id: "Enthusiastic", label: "Enthusiastic", desc: "Exciting & bold", emoji: "🔥" },
        { id: "Witty", label: "Witty", desc: "Clever & humorous", emoji: "😜" },
        { id: "Urgent", label: "Urgent", desc: "FOMO inducing", emoji: "⚡" },
        { id: "Storytelling", label: "Storytelling", desc: "Narrative driven", emoji: "📖" },
    ];

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
    };

    const handleGenerate = async () => {
        if (!file) return;
        setIsProcessing(true);

        setTimeout(() => {
            setIsProcessing(false);

            let stylePrefix = "";
            switch (captionStyle) {
                case "Friendly": stylePrefix = "Hai Bestie! 👋 "; break;
                case "Enthusiastic": stylePrefix = "WOW! 😱 "; break;
                case "Urgent": stylePrefix = "BURUAN SERBU! 🏃💨 "; break;
                case "Witty": stylePrefix = "Awas ketagihan! 😜 "; break;
                case "Luxury": stylePrefix = "Elegance redefined. ✨ "; break;
                default: stylePrefix = "🔥 PROMO SPESIAL! ";
            }

            setResult({
                image: URL.createObjectURL(file),
                caption: promptParam
                    ? `(Based on: ${promptParam}) ${stylePrefix}Nikmati kelezatan tiada tara. Pesan sekarang! #LarisManis`
                    : `${stylePrefix}Nikmati kelezatan tiada tara dengan sentuhan ${imageStyle} yang memukau. Pesan sekarang sebelum kehabisan! #KulinerEnak #Promo`,
            });
        }, 4000);
    };

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result.caption);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setIsProcessing(false);
    };

    return (
        <main>
            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {promptParam && (
                            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-sm">
                                <strong>Mode Konsultasi:</strong> Membuat poster berdasarkan saran: "{promptParam}"
                            </div>
                        )}
                        <UploadZone onFileSelect={handleFileSelect} isProcessing={false} />
                    </motion.div>
                ) : isProcessing ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <GeneratingLoader imageStyle={imageStyle} captionStyle={captionStyle} />
                    </motion.div>
                ) : !result ? (
                    <motion.div
                        key="config"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100"
                    >
                        <div className="grid md:grid-cols-2 gap-0">
                            {/* Preview Column */}
                            <div className="bg-gray-100 p-4 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 min-h-[250px] md:min-h-[500px]">
                                <h3 className="text-base md:text-lg font-semibold text-secondary mb-4 md:mb-6 w-full text-left">Preview Foto</h3>
                                <div className="relative group w-full max-w-md aspect-square bg-white rounded-2xl shadow-sm overflow-hidden">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => setFile(null)}
                                        className="absolute top-3 right-3 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-500 p-2 rounded-full shadow-sm transition-all"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Configuration Column */}
                            <div className="p-4 md:p-8 space-y-6 md:space-y-8 flex flex-col h-full overflow-y-auto max-h-[70vh] md:max-h-[80vh]">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-secondary mb-1 md:mb-2">Racik Iklanmu</h3>
                                    <p className="text-sm md:text-base text-gray-500">Sesuaikan gaya visual dan bahasa iklan.</p>
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                    <label className="text-xs md:text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                                        Gaya Visual
                                    </label>
                                    <div className="grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-3">
                                        {imageStyles.map((style) => (
                                            <button
                                                key={style.id}
                                                onClick={() => setImageStyle(style.id)}
                                                className={`p-2 md:p-3 rounded-xl border-2 text-left transition-all duration-300 ${imageStyle === style.id
                                                        ? "border-primary bg-emerald-50 text-primary shadow-md"
                                                        : "border-gray-100 hover:border-emerald-200 hover:bg-gray-50 text-gray-600"
                                                    }`}
                                            >
                                                <div className="text-lg md:text-xl mb-1">{style.emoji}</div>
                                                <div className="font-semibold text-xs md:text-sm">{style.label}</div>
                                                <div className="text-[10px] md:text-xs opacity-70 hidden md:block">{style.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                    <label className="text-xs md:text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Gaya Caption
                                    </label>
                                    <div className="grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-3">
                                        {captionStyles.map((style) => (
                                            <button
                                                key={style.id}
                                                onClick={() => setCaptionStyle(style.id)}
                                                className={`p-2 md:p-3 rounded-xl border-2 text-left transition-all duration-300 ${captionStyle === style.id
                                                        ? "border-primary bg-emerald-50 text-primary shadow-md"
                                                        : "border-gray-100 hover:border-emerald-200 hover:bg-gray-50 text-gray-600"
                                                    }`}
                                            >
                                                <div className="text-lg md:text-xl mb-1">{style.emoji}</div>
                                                <div className="font-semibold text-xs md:text-sm">{style.label}</div>
                                                <div className="text-[10px] md:text-xs opacity-70 hidden md:block">{style.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 md:pt-4 mt-auto">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isProcessing}
                                        className="w-full bg-gradient-to-r from-primary to-emerald-600 text-white font-bold py-3 md:py-4 rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        Generate Magic ✨
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100">
                            <div className="grid md:grid-cols-2">
                                <div className="bg-gray-100 p-4 md:p-8 flex items-center justify-center min-h-[250px]">
                                    <img
                                        src={result.image}
                                        alt="Generated Ad"
                                        className="max-w-full max-h-[400px] md:max-h-[500px] rounded-lg shadow-md object-cover"
                                    />
                                </div>
                                <div className="p-4 md:p-8 space-y-4 md:space-y-6 flex flex-col justify-center">
                                    <div>
                                        <h3 className="text-base md:text-lg font-semibold text-secondary mb-2">Caption Iklan</h3>
                                        <div className="bg-emerald-50 p-3 md:p-4 rounded-xl text-gray-700 leading-relaxed border border-emerald-100 text-sm md:text-base">
                                            {result.caption}
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-500">Style: {imageStyle}</span>
                                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-500">Tone: {captionStyle}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={handleCopy}
                                            className="flex-1 bg-white border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            {copied ? "Tersalin!" : "Copy Caption"}
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-emerald-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            Buat Lagi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transition to Planner CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 md:p-6 border border-emerald-100"
                        >
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <CalendarDays className="w-8 h-8 text-primary" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h4 className="font-bold text-secondary text-base md:text-lg">Jadwalkan Kontenmu!</h4>
                                    <p className="text-sm text-gray-600">Buat jadwal posting otomatis untuk maksimalkan engagement.</p>
                                </div>
                                <Link
                                    href="/plan"
                                    className="w-full sm:w-auto bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    Buka Planner
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

export default function GeneratePage() {
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
                        <h1 className="text-xl md:text-3xl font-bold text-secondary">Magic Content</h1>
                        <p className="text-xs md:text-base text-emerald-600">Buat iklan instan dari foto mentah.</p>
                    </div>
                </header>

                <Suspense fallback={<PageLoader message="Memuat Magic Content..." />}>
                    <GenerateContent />
                </Suspense>
            </div>
        </div>
    );
}
