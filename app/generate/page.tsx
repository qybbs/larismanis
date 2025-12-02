"use client";

import { useState, useEffect, Suspense } from "react";
import UploadZone from "@/components/magic/UploadZone";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function GenerateContent() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{ image: string; caption: string } | null>(
        null
    );

    const searchParams = useSearchParams();
    const promptParam = searchParams.get("prompt");

    useEffect(() => {
        if (promptParam) {
            // In a real app, we might use this prompt to guide the generation
            console.log("Auto-filling prompt:", promptParam);
        }
    }, [promptParam]);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsProcessing(true);

        // Simulate AI Processing
        setTimeout(() => {
            setIsProcessing(false);
            setResult({
                image: URL.createObjectURL(selectedFile), // Echo back the image for now
                caption: promptParam
                    ? `(Based on: ${promptParam}) 🔥 PROMO SPESIAL! Nikmati kelezatan tiada tara. Pesan sekarang! #LarisManis`
                    : "🔥 PROMO SPESIAL! Nikmati kelezatan tiada tara dengan harga terjangkau. Pesan sekarang sebelum kehabisan! #KulinerEnak #Promo",
            });
        }, 3000);
    };

    return (
        <main>
            {!result ? (
                <div className="space-y-6">
                    {promptParam && (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-sm">
                            <strong>Mode Konsultasi:</strong> Membuat poster berdasarkan saran: "{promptParam}"
                        </div>
                    )}
                    <UploadZone
                        onFileSelect={handleFileSelect}
                        isProcessing={isProcessing}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100">
                    <div className="grid md:grid-cols-2">
                        <div className="bg-gray-100 p-8 flex items-center justify-center">
                            {/* Placeholder for Generated Image */}
                            <img
                                src={result.image}
                                alt="Generated Ad"
                                className="max-w-full max-h-[500px] rounded-lg shadow-md object-cover"
                            />
                        </div>
                        <div className="p-8 space-y-6 flex flex-col justify-center">
                            <div>
                                <h3 className="text-lg font-semibold text-secondary mb-2">
                                    Caption Iklan
                                </h3>
                                <div className="bg-emerald-50 p-4 rounded-xl text-gray-700 leading-relaxed border border-emerald-100">
                                    {result.caption}
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => navigator.clipboard.writeText(result.caption)}
                                    className="flex-1 bg-white border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors"
                                >
                                    Copy Caption
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-emerald-600 shadow-lg hover:shadow-xl transition-all"
                                >
                                    Buat Lagi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function GeneratePage() {
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
                        <h1 className="text-2xl md:text-3xl font-bold text-secondary">Magic Content</h1>
                        <p className="text-sm md:text-base text-emerald-600">Buat iklan instan dari foto mentah.</p>
                    </div>
                </header>

                <Suspense fallback={<div>Loading...</div>}>
                    <GenerateContent />
                </Suspense>
            </div>
        </div>
    );
}
