import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const BASE_URL = "https://tybpzzlopbmayxqxghte.supabase.co/functions/v1";

// ========== Types ==========

export interface ContentPlan {
    date: string; // DD-MM-YYYY format from backend
    theme: string;
    content_type: string;
    visual_idea: string;
    caption_hook: string;
    platform: string;
}

export interface ContentPlanningResponse {
    success: boolean;
    data: {
        id: string;
        businessType: string;
        contentPlans: {
            plans: ContentPlan[];
        };
    };
}

export interface ChatResponse {
    success: boolean;
    data: {
        action: "unknown" | "generate_image" | "content_planning";
        geminiResponse: string;
    };
}

// ========== Helper Functions ==========

async function getAuthToken(): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

function formatDateDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
}

export function parseDateDDMMYYYY(dateStr: string): Date {
    // Parse DD-MM-YYYY format
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    // Fallback to today if parse fails
    return new Date();
}

// ========== API Functions ==========

export async function generateContentPlanning(
    businessName: string,
    businessType: string
): Promise<ContentPlanningResponse> {
    const token = await getAuthToken();

    if (!token) {
        throw new Error("Authentication required. Please login first.");
    }

    const startDate = formatDateDDMMYYYY(new Date());

    const response = await fetch(`${BASE_URL}/generateContentPlanning`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            startDate,
            businessName,
            businessType,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("generateContentPlanning Error:", { status: response.status, data });
        throw new Error(data.error || `Failed to generate content plan (Status: ${response.status})`);
    }

    return data as ContentPlanningResponse;
}

export async function getContextChatUser(userInput: string): Promise<ChatResponse> {
    const token = await getAuthToken();

    if (!token) {
        throw new Error("Authentication required. Please login first.");
    }

    const response = await fetch(`${BASE_URL}/getContextChatUser`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_input: userInput,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("getContextChatUser Error:", { status: response.status, data });
        throw new Error(data.error || `Failed to get chat response (Status: ${response.status})`);
    }

    return data as ChatResponse;
}
