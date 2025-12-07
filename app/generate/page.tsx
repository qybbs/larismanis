"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import { useState, useEffect, Suspense } from "react";
import UploadZone from "@/components/magic/UploadZone";
import GeneratingLoader from "@/components/ui/GeneratingLoader";
import PageLoader from "@/components/ui/PageLoader";
import { ArrowLeft, Copy, Check, CalendarDays, Download, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function GenerateContent() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{ image: string; caption: string; description: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [history, setHistory] = useState<Array<{ id: string; generated_image_url: string; caption: string; description: string; status: string; created_at: string }>>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [selectedGeneration, setSelectedGeneration] = useState<typeof history[0] | null>(null);
    const router = useRouter();

    const searchParams = useSearchParams();
    const promptParam = searchParams.get("prompt");

    useEffect(() => {
        if (promptParam) {
            console.log("Auto-filling prompt:", promptParam);
        }
    }, [promptParam]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoadingHistory(true);
                const supabase = getSupabaseBrowserClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const { data, error } = await supabase
                    .from("generations")
                    .select("id, generated_image_url, caption, description, status, created_at")
                    .eq("user_id", session.user.id)
                    .order("created_at", { ascending: false })
                    .limit(6);

                if (error) throw error;
                setHistory(data || []);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchHistory();
    }, []);

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

    // --- 1. LOGIC UNTUK IMAGE PROMPT ---
    const getFinalImagePrompt = (styleId: string) => {
        const baseInstruction = "Create a high-end commercial advertisement photography. 8k resolution, highly detailed, professional studio lighting.";
        
        const styles: Record<string, string> = {
            Modern: "Aesthetic: Modern. Use a clean, sleek layout with geometric shapes, contemporary lighting, and a cool color palette.",
            Vintage: "Aesthetic: Vintage. Use a retro charm style, warm nostalgic color tones, subtle film grain, and classic textures.",
            Futuristic: "Aesthetic: Futuristic. Use neon lighting accents (cyan, magenta), metallic textures, and a cyber-themed background.",
            Minimalist: "Aesthetic: Minimalist. Use plenty of negative space, soft pastel colors, diffuse natural lighting, and a simple elegant background.",
            Luxury: "Aesthetic: Luxury. Use dramatic high-contrast lighting, rich textures like marble or velvet, and gold accents.",
            Playful: "Aesthetic: Playful. Use bright pop-art colors, dynamic patterns, and high-key cheerful lighting."
        };

        return `${baseInstruction} ${(styles[styleId] || styles["Modern"])}`;
    };

    // --- 2. LOGIC UNTUK CAPTION PROMPT ---
    const getFinalCaptionPrompt = (styleId: string) => {
        const styles: Record<string, string> = {
            Professional: "Professional and Trustworthy. Use formal but elegant language. Focus on credibility and quality. No slang.",
            Friendly: "Friendly and Warm. Use casual language like talking to a best friend. Use warm emojis (🥰, ✨).",
            Enthusiastic: "Enthusiastic and Bold! Use high energy, exclamation marks, and power words. Express excitement about the taste.",
            Witty: "Witty and Humorous. Use puns, rhymes, or light jokes. Make the reader smile.",
            Urgent: "Urgent/FOMO. Emphasize limited stock or time. Use words like 'Now', 'Hurry', 'Today only'.",
            Storytelling: "Storytelling. Start with a short narrative scenario to build mood before introducin the product."
        };

        return `${styles[styleId] || styles["Friendly"]} Buat caption dalam Bahasa Indonesia yang natural dan menarik.`;
    };

    // --- 3. IMAGE COMPRESSION HELPER ---
    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                
                // Max dimension rule
                const MAX_SIZE = 1024;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(new File([blob], file.name, {
                                    type: "image/jpeg",
                                    lastModified: Date.now(),
                                }));
                            } else {
                                reject(new Error("Canvas to Blob failed"));
                            }
                        },
                        "image/jpeg",
                        0.8 // Quality compression
                    );
                } else {
                    reject(new Error("Canvas context failed"));
                }
            };
            img.onerror = (error) => reject(error);
        });
    };

    const handleGenerate = async () => {
        if (!file) return;
        setIsProcessing(true);
        setResult(null);

        try {
            const supabase = getSupabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                alert("Please login first.");
                router.push("/login");
                return;
            }

            // Compress image before sending
            console.log("Compressing image...");
            const compressedFile = await compressImage(file);
            console.log(`Original size: ${file.size}, Compressed size: ${compressedFile.size}`);

            const formData = new FormData();
            formData.append("image", compressedFile);
            formData.append("imageStylePrompt", getFinalImagePrompt(imageStyle));
            formData.append("captionStylePrompt", getFinalCaptionPrompt(captionStyle));

            console.log("Sending request to Edge Function...");

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/generateMarketingContent`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Edge Function Error:", { status: response.status, data });
                throw new Error(data.error || `Failed to generate content (Status: ${response.status})`);
            }

            if (data.success && data.data) {
                setResult({
                    image: data.data.imageUrl,
                    caption: data.data.caption,
                    description: data.data.description
                });
            } else {
                throw new Error("Invalid response format");
            }

        } catch (error) {
            console.error("Error generating content:", error);
            alert(error instanceof Error ? error.message : "Failed to generate content. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result.caption);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = async () => {
        if (!result?.image) return;
        try {
            setIsDownloading(true);
            const response = await fetch(result.image);
            if (!response.ok) throw new Error(`Download failed (HTTP ${response.status})`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "larismanis-poster.jpg";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading image:", error);
            alert("Gagal mengunduh gambar. Silakan coba lagi.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadHistory = async (imageUrl: string, filename: string = "larismanis-poster.jpg") => {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Download failed (HTTP ${response.status})`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading image:", error);
            alert("Gagal mengunduh gambar. Silakan coba lagi.");
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
                                <strong>Mode Konsultasi:</strong> Membuat poster berdasarkan saran: &quot;{promptParam}&quot;
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
                                            onClick={handleDownload}
                                            disabled={isDownloading}
                                            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-emerald-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <Download className="w-5 h-5" />
                                            {isDownloading ? "Mengunduh..." : "Unduh Gambar"}
                                        </button>
                                        <button
                                            onClick={handleCopy}
                                            className="flex-1 bg-white border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            {copied ? "Tersalin!" : "Copy Caption"}
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="flex-1 bg-white border-2 border-gray-200 text-secondary font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
                                    href={`/plan`}
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

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedGeneration && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedGeneration(null)}
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        />
                        
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-2xl mx-auto max-h-[90vh] overflow-y-auto"
                        >
                            <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedGeneration(null)}
                                    className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-500 p-2 rounded-full shadow-sm transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                {/* Image */}
                                <div className="bg-gray-100 flex items-center justify-center h-64 md:h-96">
                                    <img
                                        src={selectedGeneration.generated_image_url}
                                        alt="Generated content"
                                        className="max-w-full max-h-full object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-6 md:p-8 space-y-6">
                                    <div>
                                        <p className="text-xs uppercase text-gray-400 font-semibold mb-2">
                                            {new Date(selectedGeneration.created_at).toLocaleString()}
                                        </p>
                                        <h3 className="text-lg font-bold text-secondary mb-3">Caption</h3>
                                        <div className="bg-emerald-50 p-4 rounded-xl text-gray-700 leading-relaxed border border-emerald-100">
                                            {selectedGeneration.caption}
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-sm font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                                            Status: {selectedGeneration.status}
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedGeneration.caption);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="flex-1 bg-white border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            {copied ? "Tersalin!" : "Copy Caption"}
                                        </button>
                                        <button
                                            onClick={() => handleDownloadHistory(selectedGeneration.generated_image_url, "larismanis-poster.jpg")}
                                            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-emerald-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Unduh Gambar
                                        </button>
                                    </div>

                                    {/* Transition to Planner CTA */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100"
                                        >
                                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                                    <CalendarDays className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="flex-1 text-center sm:text-left">
                                                    <h4 className="font-bold text-secondary text-sm md:text-base">Jadwalkan Kontenmu!</h4>
                                                    <p className="text-xs text-gray-600">Buat jadwal posting otomatis untuk maksimalkan engagement.</p>
                                                </div>
                                                <Link
                                                    href={`/plan`}
                                                    className="w-full sm:w-auto bg-primary text-white font-bold px-5 py-2.5 rounded-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
                                                >
                                                    Buka Planner
                                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Riwayat Generasi - Always Visible */}
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-4 md:p-6 space-y-4 mt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-secondary">Riwayat Generasi</h3>
                        <p className="text-sm text-gray-500">Lihat poster yang pernah kamu buat.</p>
                    </div>
                    {isLoadingHistory && (
                        <span className="text-xs text-gray-400">Memuat...</span>
                    )}
                </div>

                {history.length === 0 && !isLoadingHistory ? (
                    <div className="text-center text-gray-400 text-sm py-6 border border-dashed border-gray-200 rounded-2xl">
                        Belum ada riwayat generasi.
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {history.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedGeneration(item)}
                                className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left"
                            >
                                <div className="aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
                                    <img src={item.generated_image_url} alt={item.caption.slice(0, 40)} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-3 space-y-2">
                                    <p className="text-xs uppercase text-gray-400 font-semibold">{new Date(item.created_at).toLocaleString()}</p>
                                    <p className="text-sm text-secondary line-clamp-2">{item.caption}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold">{item.status}</span>
                                        <span className="text-primary font-semibold">Lihat Detail →</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
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
