"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface ActionSuggestionProps {
    action: {
        type: "create_poster";
        label: string;
        prompt: string;
    };
}

export default function ActionSuggestion({ action }: ActionSuggestionProps) {
    if (action.type === "create_poster") {
        return (
            <Link
                href={`/generate?prompt=${encodeURIComponent(action.prompt)}`}
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md hover:bg-emerald-600 hover:shadow-lg transition-all mt-2"
            >
                <Sparkles className="w-4 h-4" />
                {action.label}
                <ArrowRight className="w-4 h-4" />
            </Link>
        );
    }
    return null;
}
