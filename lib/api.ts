import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

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
        action: "offer_poster" | "open_planner" | "consult_more" | "generate_image" | "offer_campaign" | "unknown";
        geminiResponse: string;
    };
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface DbChatSession {
    id: string;
    user_id: string;
    messages: ChatMessage[];
    updated_at: string;
}

// ========== Helper Functions ==========

async function getAuthToken(): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

export async function getCurrentUserId(): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
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

// ========== Content Planning API ==========

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

// ========== Chat Context API (non-streaming) ==========

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

// ========== Streaming Chat API ==========

export async function streamChatMessage(
    userInput: string,
    onChunk: (text: string) => void,
    onComplete: (fullResponse: string, action: "unknown" | "generate_image" | "content_planning") => void,
    onError: (error: Error) => void
): Promise<void> {
    const token = await getAuthToken();

    if (!token) {
        onError(new Error("Authentication required. Please login first."));
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/generateChatStream`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_input: userInput,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Stream failed (Status: ${response.status})`);
        }

        // Get action from header
        const actionIntent = response.headers.get('X-Action-Intent') as "unknown" | "generate_image" | "content_planning" || "unknown";

        // Read the stream
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            onChunk(chunk);
        }

        onComplete(fullText, actionIntent);

    } catch (err) {
        onError(err instanceof Error ? err : new Error("Stream failed"));
    }
}

// ========== Chat Session CRUD ==========

export async function fetchChatSession(): Promise<DbChatSession | null> {
    const supabase = getSupabaseBrowserClient();
    const userId = await getCurrentUserId();

    if (!userId) {
        return null;
    }

    const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching chat session:", error);
        return null;
    }

    if (!data) {
        return null;
    }

    // Cast data to expected shape
    const sessionData = data as { id: string; user_id: string; messages: unknown; updated_at: string };

    // Parse messages if they're a string
    let messages: ChatMessage[] = [];
    if (typeof sessionData.messages === 'string') {
        try {
            messages = JSON.parse(sessionData.messages);
        } catch {
            messages = [];
        }
    } else if (Array.isArray(sessionData.messages)) {
        messages = sessionData.messages as ChatMessage[];
    }

    return {
        id: sessionData.id,
        user_id: sessionData.user_id,
        messages: messages,
        updated_at: sessionData.updated_at,
    };
}

export async function deleteChatSession(): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const userId = await getCurrentUserId();

    if (!userId) {
        throw new Error("Not authenticated");
    }

    const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', userId);

    if (error) {
        console.error("Error deleting chat session:", error);
        throw new Error("Failed to delete session");
    }
}

// ========== Content Plans CRUD ==========

// Actual DB table structure
interface DbContentPlanRow {
    id: string;
    user_id: string;
    business_type: string;
    plan_data: {
        plans: ContentPlan[];
    };
    created_at: string;
}

// Flattened plan item for UI
export interface FlattenedPlanItem {
    id: string; // composite: row_id + index
    rowId: string; // original row ID
    date: Date;
    theme: string;
    content_type: string;
    visual_idea: string;
    caption_hook: string;
    platform: string;
    category: string;
}

export interface ContentPlanInput {
    date: Date;
    theme: string;
    content_type: string;
    visual_idea: string;
    caption_hook: string;
    platform: string;
    category: string;
}

function formatDateYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function parseDateYYYYMMDD(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Flatten all rows into individual plan items for UI
function flattenPlanRows(rows: DbContentPlanRow[]): FlattenedPlanItem[] {
    const items: FlattenedPlanItem[] = [];
    
    for (const row of rows) {
        if (row.plan_data?.plans) {
            row.plan_data.plans.forEach((plan, index) => {
                items.push({
                    id: `${row.id}-${index}`,
                    rowId: row.id,
                    date: parseDateDDMMYYYY(plan.date),
                    theme: plan.theme,
                    content_type: plan.content_type,
                    visual_idea: plan.visual_idea,
                    caption_hook: plan.caption_hook,
                    platform: plan.platform,
                    category: row.business_type || "Promosi", // Use business_type as category
                });
            });
        }
    }
    
    return items;
}

export async function fetchContentPlans(): Promise<FlattenedPlanItem[]> {
    const supabase = getSupabaseBrowserClient();
    const userId = await getCurrentUserId();

    if (!userId) {
        return [];
    }

    const { data, error } = await supabase
        .from('content_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching content plans:", error);
        return [];
    }

    return flattenPlanRows((data || []) as unknown as DbContentPlanRow[]);
}

export async function saveContentPlan(plan: ContentPlanInput, businessType?: string): Promise<FlattenedPlanItem | null> {
    const supabase = getSupabaseBrowserClient();
    const userId = await getCurrentUserId();

    if (!userId) {
        throw new Error("Not authenticated");
    }

    // Format plan for DB
    const planData: ContentPlan = {
        date: formatDateDDMMYYYY(plan.date), // DD-MM-YYYY format for consistency
        theme: plan.theme,
        content_type: plan.content_type,
        visual_idea: plan.visual_idea,
        caption_hook: plan.caption_hook,
        platform: plan.platform,
    };

    const insertRow = {
        user_id: userId,
        business_type: businessType || plan.category || "Manual",
        plan_data: {
            plans: [planData]
        }
    };

    const { data, error } = await supabase
        .from('content_plans')
        .insert(insertRow as never)
        .select()
        .single();

    if (error) {
        console.error("Error saving content plan:", error);
        throw new Error("Failed to save content plan");
    }

    const row = data as unknown as DbContentPlanRow;
    return {
        id: `${row.id}-0`,
        rowId: row.id,
        date: plan.date,
        theme: plan.theme,
        content_type: plan.content_type,
        visual_idea: plan.visual_idea,
        caption_hook: plan.caption_hook,
        platform: plan.platform,
        category: row.business_type,
    };
}

export async function saveMultipleContentPlans(plans: ContentPlanInput[], businessType?: string): Promise<FlattenedPlanItem[]> {
    const supabase = getSupabaseBrowserClient();
    const userId = await getCurrentUserId();

    if (!userId) {
        throw new Error("Not authenticated");
    }

    // Group plans into single row with multiple plans
    const planDataItems: ContentPlan[] = plans.map(plan => ({
        date: formatDateDDMMYYYY(plan.date),
        theme: plan.theme,
        content_type: plan.content_type,
        visual_idea: plan.visual_idea,
        caption_hook: plan.caption_hook,
        platform: plan.platform,
    }));

    const insertRow = {
        user_id: userId,
        business_type: businessType || plans[0]?.category || "Generated",
        plan_data: {
            plans: planDataItems
        }
    };

    const { data, error } = await supabase
        .from('content_plans')
        .insert(insertRow as never)
        .select()
        .single();

    if (error) {
        console.error("Error saving content plans:", error);
        throw new Error("Failed to save content plans");
    }

    const row = data as unknown as DbContentPlanRow;
    return plans.map((plan, index) => ({
        id: `${row.id}-${index}`,
        rowId: row.id,
        date: plan.date,
        theme: plan.theme,
        content_type: plan.content_type,
        visual_idea: plan.visual_idea,
        caption_hook: plan.caption_hook,
        platform: plan.platform,
        category: row.business_type,
    }));
}

export async function deleteContentPlan(compositeId: string): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const userId = await getCurrentUserId();

    if (!userId) {
        throw new Error("Not authenticated");
    }

    // Extract rowId from composite id (format: "uuid-index")
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-index
    // So we need to get everything except the last segment (the index)
    const parts = compositeId.split('-');
    const rowId = parts.slice(0, -1).join('-'); // Get all parts except last (index)

    const { error } = await supabase
        .from('content_plans')
        .delete()
        .eq('id', rowId)
        .eq('user_id', userId);

    if (error) {
        console.error("Error deleting content plan:", error);
        throw new Error("Failed to delete content plan");
    }
}

export async function generateContentPlanningFromDate(
    businessType: string,
    startDate: Date
): Promise<ContentPlanningResponse> {
    const token = await getAuthToken();

    if (!token) {
        throw new Error("Authentication required. Please login first.");
    }

    const formattedDate = formatDateDDMMYYYY(startDate);

    const response = await fetch(`${BASE_URL}/generateContentPlanning`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            startDate: formattedDate,
            businessName: businessType,
            businessType: businessType,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("generateContentPlanningFromDate Error:", { status: response.status, data });
        throw new Error(data.error || `Failed to generate content plan (Status: ${response.status})`);
    }

    return data as ContentPlanningResponse;
}

