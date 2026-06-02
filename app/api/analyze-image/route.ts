import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

function getApiKey(): string {
  const multiKeys = process.env.GEMINI_API_KEYS;
  if (multiKeys) {
    const keys = multiKeys.split(",").map(k => k.trim()).filter(k => k.length > 0 && !k.includes("<") && !k.includes("placeholder"));
    if (keys.length > 0) return keys[0];
  }
  const singleKey = process.env.GEMINI_API_KEY;
  if (singleKey && !singleKey.includes("<") && !singleKey.includes("placeholder")) {
    return singleKey;
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "Image data is required. Please upload a valid screenshot." },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Gemini API key is not configured on the server." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Clean base64 string
    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    const mimeType = imageBase64.includes(";") ? imageBase64.split(";")[0].split(":")[1] : "image/png";

    const prompt = `
You are a specialized chat transcriber for HeartMind AI.
Analyze this chat conversation screenshot and extract the message text exactly as it appears.
Format the output as a clean, chronological plain text conversation log using sender names, like:
Sender A: Message text
Sender B: Message text

Rules:
1. Identify the different senders in the image. Use their exact names if visible, or "Sender A" / "Sender B" consistently.
2. DO NOT include timestamp headers, date bubbles, status badges (e.g. read, typing), or UI text. Keep only the raw sender name and message content.
3. If the screenshot contains system messages (e.g., "Messages are encrypted"), ignore them.
4. Output only the plain text log. Do not add markdown backticks, intros, or summaries.
`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType || "image/png"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    if (!responseText || !responseText.trim()) {
      throw new Error("Gemini was unable to read text from this image. Please ensure the chat log is clearly visible.");
    }

    return NextResponse.json({
      success: true,
      text: responseText.trim()
    });
  } catch (error: any) {
    console.error("❌ [API Route] Error transcribing image:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to transcribe chat screenshot." },
      { status: 500 }
    );
  }
}
