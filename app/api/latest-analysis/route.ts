import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import ChatAnalysis from "@/models/ChatAnalysis";
import VoiceAnalysis from "@/models/VoiceAnalysis";
import { calculateEmotions, calculateCompatibility, calculateAttachmentBreakdown } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User mapping ID not found" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Query latest chat and voice analysis documents
    const [latestChat, latestVoice] = await Promise.all([
      ChatAnalysis.findOne({ userId }).sort({ createdAt: -1 }),
      VoiceAnalysis.findOne({ userId }).sort({ createdAt: -1 })
    ]);

    let latest: any = null;
    let type: "chat" | "voice" | null = null;

    if (latestChat && latestVoice) {
      if (new Date(latestChat.createdAt).getTime() >= new Date(latestVoice.createdAt).getTime()) {
        latest = latestChat;
        type = "chat";
      } else {
        latest = latestVoice;
        type = "voice";
      }
    } else if (latestChat) {
      latest = latestChat;
      type = "chat";
    } else if (latestVoice) {
      latest = latestVoice;
      type = "voice";
    }

    if (!latest) {
      return NextResponse.json({
        success: true,
        analysis: null
      }, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });
    }

    const doc = typeof latest.toObject === "function" ? latest.toObject() : latest;

    // Filter redFlags to only include valid object-format entries (not old string format)
    const rawRedFlags = doc.analysisResult?.redFlags ?? [];
    const validRedFlags = Array.isArray(rawRedFlags)
      ? rawRedFlags.filter((f: any) => f && typeof f === "object" && typeof f.type === "string" && typeof f.title === "string")
      : [];

    const normalizedRedFlags = validRedFlags.map((f: any) => ({
      ...f,
      confidence: typeof f.confidence === "number" ? f.confidence : (f.severity === "high" ? 82 : f.severity === "medium" ? 72 : 62),
      evidence: typeof f.evidence === "string" ? f.evidence : ""
    }));

    const pos = doc.analysisResult?.positivityScore ?? doc.score ?? 70;
    const str = doc.analysisResult?.stressScore ?? 30;
    const style = doc.analysisResult?.attachmentStyle ?? "secure";
    const rfCount = normalizedRedFlags.length;

    // Standardize representation matching the strict schema pattern
    const analysisResponse = {
      analysisId: doc._id.toString(),
      positivityScore: pos,
      stressScore: str,
      communicationBalance: typeof doc.analysisResult?.communicationBalance === "number" ? doc.analysisResult.communicationBalance : 50,
      attachmentStyle: style,
      redFlags: normalizedRedFlags,
      suggestions: doc.analysisResult?.suggestions ?? [],
      timelineInsights: doc.analysisResult?.timelineInsights ?? [],
      voiceInsights: doc.analysisResult?.voiceInsights ?? [],
      createdAt: doc.createdAt,
      name: doc.name || (type === "chat" ? "Chat Analysis" : "Voice Analysis"),
      type,
      schemaVersion: doc.schemaVersion ?? doc.analysisResult?.schemaVersion ?? 1,
      emotions: calculateEmotions(pos, rfCount),
      compatibility: calculateCompatibility(pos, str, style, rfCount),
      attachmentBreakdown: calculateAttachmentBreakdown(style, pos)
    };

    return NextResponse.json({
      success: true,
      analysis: analysisResponse
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (err: any) {
    console.error("Error fetching latest analysis:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch latest analysis" },
      { status: 500 }
    );
  }
}
