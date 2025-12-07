import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const BASE_IMAGE_PROMPT = "Create a high-end commercial advertisement photography. 8k resolution, highly detailed, professional studio lighting.";

const IMAGE_STYLE_PROMPTS: Record<string, string> = {
    Modern: "Aesthetic: Modern. Use a clean, sleek layout with geometric shapes, contemporary lighting, and a cool color palette.",
    Vintage: "Aesthetic: Vintage. Use a retro charm style, warm nostalgic color tones, subtle film grain, and classic textures.",
    Futuristic: "Aesthetic: Futuristic. Use neon lighting accents (cyan, magenta), metallic textures, and a cyber-themed background.",
    Minimalist: "Aesthetic: Minimalist. Use plenty of negative space, soft pastel colors, diffuse natural lighting, and a simple elegant background.",
    Luxury: "Aesthetic: Luxury. Use dramatic high-contrast lighting, rich textures like marble or velvet, and gold accents.",
    Playful: "Aesthetic: Playful. Use bright pop-art colors, dynamic patterns, and high-key cheerful lighting.",
};

const CAPTION_STYLE_PROMPTS: Record<string, string> = {
    Professional: "Professional and Trustworthy. Use formal but elegant language. Focus on credibility and quality. No slang.",
    Friendly: "Friendly and Warm. Use casual language like talking to a best friend. Use warm emojis (🥰, ✨).",
    Enthusiastic: "Enthusiastic and Bold! Use high energy, exclamation marks, and power words. Express excitement about the taste.",
    Witty: "Witty and Humorous. Use puns, rhymes, or light jokes. Make the reader smile.",
    Urgent: "Urgent/FOMO. Emphasize limited stock or time. Use words like 'Now', 'Hurry', 'Today only'.",
    Storytelling: "Storytelling. Start with a short narrative scenario to build mood before introducin the product.",
};

function buildImagePrompt(styleId: string) {
    return `${BASE_IMAGE_PROMPT} ${IMAGE_STYLE_PROMPTS[styleId] || IMAGE_STYLE_PROMPTS.Modern}`;
}

function buildCaptionPrompt(styleId: string) {
    return `${CAPTION_STYLE_PROMPTS[styleId] || CAPTION_STYLE_PROMPTS.Friendly} Buat caption dalam Bahasa Indonesia yang natural dan menarik.`;
}

async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const MAX_SIZE = 1024;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
            }

            canvas.width = width;
            canvas.height = height;

            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
                        } else {
                            reject(new Error("Canvas to Blob failed"));
                        }
                    },
                    "image/jpeg",
                    0.8
                );
            } else {
                reject(new Error("Canvas context failed"));
            }
        };
        img.onerror = (error) => reject(error);
    });
}

export type GenerationResult = { image: string; caption: string; description: string } | null;

export function useGenerationEngine({
    file,
    imageStyle,
    captionStyle,
}: {
    file: File | null;
    imageStyle: string;
    captionStyle: string;
}) {
    const router = useRouter();
    const [result, setResult] = useState<GenerationResult>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const copyText = useCallback((text?: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const downloadFromUrl = useCallback(async (imageUrl: string, filename: string = "larismanis-poster.jpg") => {
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
    }, []);

    const generate = useCallback(async () => {
        if (!file) return;
        setIsProcessing(true);
        setResult(null);

        try {
            const supabase = getSupabaseBrowserClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                alert("Please login first.");
                router.push("/login");
                return;
            }

            const compressedFile = await compressImage(file);

            const formData = new FormData();
            formData.append("image", compressedFile);
            formData.append("imageStylePrompt", buildImagePrompt(imageStyle));
            formData.append("captionStylePrompt", buildCaptionPrompt(captionStyle));

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/generateMarketingContent`, {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}` },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                console.error("Edge Function Error:", { status: response.status, data });
                throw new Error(data.error || `Failed to generate content (Status: ${response.status})`);
            }

            if (data.success && data.data) {
                setResult({ image: data.data.imageUrl, caption: data.data.caption, description: data.data.description });
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Error generating content:", error);
            alert(error instanceof Error ? error.message : "Failed to generate content. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    }, [file, imageStyle, captionStyle, router]);

    const copyCaption = useCallback(() => copyText(result?.caption), [copyText, result]);

    const downloadResult = useCallback(async () => {
        if (!result?.image) return;
        try {
            setIsDownloading(true);
            await downloadFromUrl(result.image);
        } catch (error) {
            console.error("Error downloading image:", error);
            alert("Gagal mengunduh gambar. Silakan coba lagi.");
        } finally {
            setIsDownloading(false);
        }
    }, [downloadFromUrl, result]);

    const downloadHistory = useCallback(
        async (imageUrl: string, filename: string = "larismanis-poster.jpg") => {
            try {
                await downloadFromUrl(imageUrl, filename);
            } catch (error) {
                console.error("Error downloading image:", error);
                alert("Gagal mengunduh gambar. Silakan coba lagi.");
            }
        },
        [downloadFromUrl]
    );

    const reset = useCallback(() => {
        setResult(null);
        setIsProcessing(false);
    }, []);

    return {
        result,
        isProcessing,
        isDownloading,
        copied,
        setCopied,
        copyText,
        generate,
        copyCaption,
        downloadResult,
        downloadHistory,
        reset,
    };
}
