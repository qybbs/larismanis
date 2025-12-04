"use client";

import { ArrowRight, Sparkles, Calendar, MessageCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ActionSuggestionProps {
    action: {
        type: "create_poster" | "open_planner" | "consult_more";
        label: string;
        prompt?: string;
        description?: string;
    };
}

export default function ActionSuggestion({ action }: ActionSuggestionProps) {
    const getActionConfig = () => {
        switch (action.type) {
            case "create_poster":
                return {
                    href: `/generate?prompt=${encodeURIComponent(action.prompt || "")}`,
                    icon: Sparkles,
                    gradient: "from-primary to-emerald-600",
                    bgColor: "bg-emerald-50",
                    borderColor: "border-emerald-100",
                };
            case "open_planner":
                return {
                    href: "/plan",
                    icon: Calendar,
                    gradient: "from-blue-500 to-indigo-600",
                    bgColor: "bg-blue-50",
                    borderColor: "border-blue-100",
                };
            case "consult_more":
                return {
                    href: "#",
                    icon: MessageCircle,
                    gradient: "from-purple-500 to-pink-600",
                    bgColor: "bg-purple-50",
                    borderColor: "border-purple-100",
                };
            default:
                return {
                    href: "#",
                    icon: ExternalLink,
                    gradient: "from-gray-500 to-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-100",
                };
        }
    };

    const config = getActionConfig();
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${config.bgColor} ${config.borderColor} border rounded-xl p-3 mt-2`}
        >
            {action.description && (
                <p className="text-xs text-gray-600 mb-2">{action.description}</p>
            )}
            <Link
                href={config.href}
                className={`inline-flex items-center gap-2 bg-gradient-to-r ${config.gradient} text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 w-full justify-center`}
            >
                <Icon className="w-4 h-4" />
                {action.label}
                <ArrowRight className="w-4 h-4" />
            </Link>
        </motion.div>
    );
}

