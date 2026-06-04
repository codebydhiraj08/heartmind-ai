import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logApiKeyUsage } from "@/lib/api-key-tracker";

export const dynamic = "force-dynamic";

function loadApiKeys(): string[] {
  const multiKeys = process.env.GEMINI_API_KEYS;
  if (multiKeys) {
    return multiKeys
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0 && !k.includes("<") && !k.includes("placeholder"));
  }
  const singleKey = process.env.GEMINI_API_KEY;
  if (singleKey && !singleKey.includes("<") && !singleKey.includes("placeholder")) {
    return [singleKey];
  }
  return [];
}

let keyRotationIndex = 0;

function getNextApiKey(keys: string[]): string {
  const key = keys[keyRotationIndex % keys.length];
  keyRotationIndex = (keyRotationIndex + 1) % keys.length;
  return key;
}

export async function POST(req: NextRequest) {
  let start = Date.now();
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "Image data is required. Please upload a valid screenshot." },
        { status: 400 }
      );
    }

    const apiKeys = loadApiKeys();
    if (apiKeys.length === 0) {
      return NextResponse.json(
        { success: false, error: "AI API key is not configured on the server." },
        { status: 500 }
      );
    }

    // Clean base64 string
    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    const mimeType = imageBase64.includes(";") ? imageBase64.split(";")[0].split(":")[1] : "image/png";

    const prompt = `
You are a specialized chat transcriber for HeartMind AI.
Analyze this mobile chat conversation screenshot (which could be from WhatsApp, Instagram, Telegram, iMessage, etc.) and extract the message logs in chronological order.

Identify the senders based on the layout and header:
1. **Me / You (The user who took the screenshot)**: All message bubbles aligned on the RIGHT side of the screen are sent by "Me". Use "Me" as the sender name.
2. **The Other Person (Partner)**: Identify the name/emoji of the other person shown in the top header bar of the screenshot (next to the back arrow/profile picture). If you can identify this name (e.g., "👰🏻‍♀️", "Priya", "Rahul"), use it as their sender name. If no clear name is found in the header, default to "Partner".
3. **Left-aligned messages**: All message bubbles aligned on the LEFT side of the screen are sent by the other person (use their header name or "Partner").

Rules:
- **Chronological Order**: Output the conversation from top to bottom.
- **Handling Reply Quotes (Quoted Messages)**: If a message bubble contains a nested preview box (representing a reply to a previous message, often marked with "You" or a contact name and a vertical line indicating a quote), DO NOT transcribe the quoted message text. Ignore the quote completely and only transcribe the actual new reply message text at the bottom of the bubble.
- **Ignore Timestamps & Statuses**: DO NOT include any timestamps (e.g. "11:41 pm", "11:42 pm"), checkmarks/ticks, read receipts, or date dividers.
- **No System Messages**: Ignore messages like "Messages are end-to-end encrypted", "Security code changed", etc.
- **Format**: Output ONLY the plain text conversation log, with each line in the format:
  SenderName: message content
  (Where SenderName is "Me" for right-side messages, and the header name/Partner for left-side messages).
  Do not wrap in markdown code blocks (\`\`\`), do not add intros or extra descriptions.
`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType || "image/png"
      }
    };

    let transcriptionText = "";
    let success = false;
    let lastError = null;

    for (let attempt = 0; attempt < apiKeys.length; attempt++) {
      const currentKey = getNextApiKey(apiKeys);
      const keyLabel = `Key #${(attempt + 1)}`;
      start = Date.now();

      try {
        const ai = new GoogleGenerativeAI(currentKey);
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        const duration = Date.now() - start;

        if (responseText && responseText.trim()) {
          transcriptionText = responseText.trim();
          success = true;
          logApiKeyUsage("/api/analyze-image (Screenshot Transcribe)", currentKey, "success", duration);
          break;
        } else {
          throw new Error("The image parser returned an empty response.");
        }
      } catch (error: any) {
        const duration = Date.now() - start;
        lastError = error;
        const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("quota");
        
        logApiKeyUsage("/api/analyze-image (Screenshot Transcribe)", currentKey, "failed", duration, error.message);
        
        if (isRateLimit && attempt < apiKeys.length - 1) {
          console.warn(`⚠️ [API Route] ${keyLabel} hit rate limit (429). Rotating to next key...`);
          continue;
        }
        break; // Stop and fail if it's not a rate limit, or if we have no more keys
      }
    }

    if (!success) {
      throw lastError || new Error("Failed to transcribe screenshot.");
    }

    return NextResponse.json({
      success: true,
      text: transcriptionText
    });
  } catch (error: any) {
    console.error("❌ [API Route] Error transcribing image:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to transcribe chat screenshot." },
      { status: 500 }
    );
  }
}
