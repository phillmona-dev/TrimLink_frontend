/**
 * AI Style Service — Powered by Groq (free tier)
 *
 * Uses Llama 3.2 Vision via Groq's OpenAI-compatible API.
 * Free tier: 30 req/min, 14,400 req/day — no credit card needed.
 *
 * Get a free key at https://console.groq.com → API Keys
 * Add to .env.development: NEXT_PUBLIC_GROQ_API_KEY=gsk_...
 */

export interface StyleItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  tags: string[];
  description: string;
}

export interface StyleRecommendation {
  id: string;
  reason: string;
}

export interface AIRecommendationResult {
  faceShape: string;
  faceShapeDescription: string;
  recommendations: StyleRecommendation[];
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

/** Max image dimension — keeps tokens low */
const MAX_IMAGE_PX = 480;

/**
 * Resizes the image to at most MAX_IMAGE_PX on the longest side,
 * then returns a JPEG base64 data-URI string.
 */
async function resizeToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(MAX_IMAGE_PX / img.width, MAX_IMAGE_PX / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Image resize failed")); return; }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.82
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Compact catalogue to minimise tokens */
function buildPrompt(styles: StyleItem[]): string {
  const catalogue = styles
    .map((s) => `${s.id}|${s.name}|${s.category}`)
    .join("\n");

  return `You are a professional barber AI. Analyse the face in the image.

Tasks:
1. Identify the face shape (Oval/Round/Square/Heart/Oblong/Diamond/Triangle).
2. Write one short sentence describing this face shape.
3. From the catalogue below, pick exactly 3 hairstyle IDs that best suit this face shape. Write a short reason for each.

CATALOGUE (format: id|name|category):
${catalogue}

IMPORTANT: Return ONLY a valid JSON object — no markdown, no code fences, nothing else:
{"faceShape":"...","faceShapeDescription":"...","recommendations":[{"id":"...","reason":"..."},{"id":"...","reason":"..."},{"id":"...","reason":"..."}]}`;
}

/**
 * Main export: sends the image to Groq Llama Vision and returns 3 hairstyle recommendations.
 */
export async function analyzeAndRecommend(
  imageFile: File | Blob,
  styles: StyleItem[]
): Promise<AIRecommendationResult> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Groq API key not found. Add NEXT_PUBLIC_GROQ_API_KEY=gsk_... to your .env.development file. Get a free key at https://console.groq.com"
    );
  }

  const dataUrl = await resizeToDataUrl(imageFile);

  const body = {
    model: GROQ_MODEL,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: dataUrl },
          },
          {
            type: "text",
            text: buildPrompt(styles),
          },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 512,
  };

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const raw: string = (err as any)?.error?.message ?? `HTTP ${response.status}`;

    if (response.status === 429) {
      throw new Error(
        "Rate limit reached. Please wait 30 seconds and try again."
      );
    }
    if (response.status === 401) {
      throw new Error(
        "Invalid Groq API key. Please check your NEXT_PUBLIC_GROQ_API_KEY in .env.development."
      );
    }
    throw new Error(`AI error: ${raw}`);
  }

  const data = await response.json();
  const rawText: string =
    data?.choices?.[0]?.message?.content ?? "";

  // Strip potential markdown code fences
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Extract JSON if wrapped in other text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : cleaned;

  let parsed: AIRecommendationResult;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("AI returned an unexpected format. Please try again.");
  }

  if (
    !parsed.faceShape ||
    !Array.isArray(parsed.recommendations) ||
    parsed.recommendations.length === 0
  ) {
    throw new Error("AI response is incomplete. Please try again.");
  }

  // Filter to only valid catalogue IDs
  const validIds = new Set(styles.map((s) => s.id));
  parsed.recommendations = parsed.recommendations.filter((r) =>
    validIds.has(r.id)
  );

  if (parsed.recommendations.length === 0) {
    throw new Error(
      "AI could not match styles to your face. Please try with a clearer front-facing photo."
    );
  }

  return parsed;
}
