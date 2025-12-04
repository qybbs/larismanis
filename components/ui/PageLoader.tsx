"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface PageLoaderProps {
    message?: string;
}

export default function PageLoader({ message = "Memuat..." }: PageLoaderProps) {
    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
            <motion.div
                className="relative mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                </div>
            </motion.div>

            <motion.p
                className="text-gray-500 text-sm font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {message}
            </motion.p>

            {/* Loading dots */}
            <div className="flex gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    />
                ))}
            </div>
        </div>
    );
}
