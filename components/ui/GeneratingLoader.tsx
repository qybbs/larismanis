"use client";

import { motion } from "framer-motion";
import { Sparkles, Wand2, ImageIcon, Palette, Type } from "lucide-react";

interface GeneratingLoaderProps {
    imageStyle: string;
    captionStyle: string;
}

const steps = [
    { icon: ImageIcon, label: "Menganalisis gambar...", delay: 0 },
    { icon: Palette, label: "Menerapkan gaya visual...", delay: 1 },
    { icon: Type, label: "Membuat caption...", delay: 2 },
    { icon: Wand2, label: "Menyempurnakan hasil...", delay: 2.5 },
];

export default function GeneratingLoader({ imageStyle, captionStyle }: GeneratingLoaderProps) {
    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100 p-8 md:p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-8">
                {/* Animated Icon */}
                <motion.div
                    className="relative"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="w-12 h-12 text-white" />
                        </motion.div>
                    </div>

                    {/* Pulsing rings */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/30"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/30"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    />
                </motion.div>

                {/* Title */}
                <div>
                    <h3 className="text-2xl font-bold text-secondary mb-2">Meracik Magic...</h3>
                    <p className="text-gray-500">
                        Gaya <span className="font-semibold text-primary">{imageStyle}</span> +
                        Nada <span className="font-semibold text-primary">{captionStyle}</span>
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="w-full max-w-sm space-y-3">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.label}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: step.delay, duration: 0.5 }}
                        >
                            <motion.div
                                className="p-2 rounded-lg bg-emerald-100 text-primary"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ delay: step.delay + 0.5, duration: 0.5 }}
                            >
                                <step.icon className="w-4 h-4" />
                            </motion.div>
                            <span className="text-sm text-gray-600">{step.label}</span>
                            <motion.div
                                className="ml-auto w-4 h-4 rounded-full border-2 border-primary border-t-transparent"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: step.delay }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Skeleton Preview */}
                <div className="w-full max-w-md">
                    <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-video relative">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
