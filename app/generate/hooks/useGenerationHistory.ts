import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type GenerationHistoryItem = {
    id: string;
    generated_image_url: string;
    caption: string;
    description: string;
    status: string;
    created_at: string;
};

export function useGenerationHistory() {
    const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const fetchHistory = useCallback(async () => {
        try {
            setIsLoadingHistory(true);
            const supabase = getSupabaseBrowserClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
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
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, isLoadingHistory, refreshHistory: fetchHistory };
}
