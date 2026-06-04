import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

function loadApiKeys(): string[] {
  const multiKeys = process.env.GEMINI_API_KEYS;
  let keys: string[] = [];
  if (multiKeys) {
    keys = multiKeys
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0 && !k.includes("<") && !k.includes("placeholder"));
  }
  const singleKey = process.env.GEMINI_API_KEY;
  if (singleKey && !singleKey.includes("<") && !singleKey.includes("placeholder")) {
    if (!keys.includes(singleKey)) {
      keys.push(singleKey);
    }
  }
  return keys;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminEmails = ["official.heartmindai@gmail.com", "dhirajwarangane@gmail.com"];
    if (!session || !session.user || !adminEmails.includes(session.user.email || "")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access only." },
        { status: 403 }
      );
    }

    const apiKeys = loadApiKeys();
    const results = [];

    for (let i = 0; i < apiKeys.length; i++) {
      const key = apiKeys[i];
      const maskedKey = key.slice(0, 8) + "..." + key.slice(-4);
      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
        const start = Date.now();
        const result = await model.generateContent("Hello, write exactly the word 'OK'.");
        const text = result.response.text().trim();
        const duration = Date.now() - start;
        results.push({
          index: i + 1,
          key: maskedKey,
          status: "valid",
          response: text,
          durationMs: duration,
          error: null
        });
      } catch (err: any) {
        results.push({
          index: i + 1,
          key: maskedKey,
          status: "invalid",
          response: null,
          durationMs: null,
          error: err.message || "Unknown error"
        });
      }
    }

    const validCount = results.filter(r => r.status === "valid").length;
    const invalidCount = results.filter(r => r.status === "invalid").length;

    return NextResponse.json({
      success: true,
      summary: {
        totalTested: results.length,
        valid: validCount,
        invalid: invalidCount
      },
      results
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to test API keys." },
      { status: 500 }
    );
  }
}
