"use client";

import ChatWindow from "@/components/chat/ChatWindow";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ConsultPage() {
    return (
        <div className="min-h-screen bg-background container-mobile flex flex-col h-screen">
            <div className="space-y-4 md:space-y-8 flex-shrink-0">
                <header className="flex items-center gap-3 md:gap-4 pt-2">
                    <Link
                        href="/"
                        className="p-2 -ml-2 hover:bg-emerald-100 active:bg-emerald-200 rounded-full transition-colors text-secondary"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-secondary">Marketing Consultant</h1>
                        <p className="text-sm md:text-base text-emerald-600">Teman curhat bisnis, siap kasih solusi.</p>
                    </div>
                </header>
            </div>

            <main className="flex-1 mt-4 overflow-hidden">
                <ChatWindow />
            </main>
        </div>
    );
}
