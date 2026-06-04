import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import ChatAnalysis from "@/models/ChatAnalysis";
import VoiceAnalysis from "@/models/VoiceAnalysis";
import { calculateEmotions, calculateCompatibility, calculateAttachmentBreakdown, calibrateAnalysis } from "@/lib/metrics";

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

    const userBaseline = (session.user as any).reassuranceBaseline || "standard";
    const calibratedResult = calibrateAnalysis({
      ...doc.analysisResult,
      score: doc.score,
    }, userBaseline, type || "chat");

    const analysisResponse = {
      ...calibratedResult,
      analysisId: doc._id.toString(),
      communicationBalance: typeof doc.analysisResult?.communicationBalance === "number" ? doc.analysisResult.communicationBalance : 50,
      name: doc.name || (type === "chat" ? "Chat Analysis" : "Voice Analysis"),
      type,
      createdAt: doc.createdAt,
      schemaVersion: doc.schemaVersion ?? doc.analysisResult?.schemaVersion ?? 1,
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
