import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import ChatAnalysis from "@/models/ChatAnalysis";
import { analyzeChatText, sampleChatTextIfTooLong } from "@/lib/ai-engine";
import User from "@/models/User";
import { isSubscriptionActive, getUserAccess, FREE_PLAN } from "@/lib/subscription-service";
import { trackEvent } from "@/lib/analytics";
import { revalidatePath } from "next/cache";
import { calculateEmotions, calculateCompatibility, calculateAttachmentBreakdown } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to analyze chats." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User session ID mapping not found." },
        { status: 400 }
      );
    }

    // 2. Extract request body fields
    const body = await req.json();
    const { text, name, platform } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Chat conversation text content is required." },
        { status: 400 }
      );
    }

    const analysisName = (name || "WhatsApp Chat Upload").trim();
    const analysisPlatform = (platform || "WhatsApp").trim();

    // 3. Connect to database
    await connectToDatabase();

    const dbUser = await User.findOne({ _id: userId });
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User profile not found in database." },
        { status: 404 }
      );
    }

    const access = getUserAccess(dbUser);
    const activeTier = access.tier;

    // Reset usage counter if 30 days have passed
    const now = new Date();
    const lastReset = dbUser.lastUsageResetAt ? new Date(dbUser.lastUsageResetAt) : new Date(dbUser.createdAt || now);
    const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceReset >= 30) {
      dbUser.monthlyAnalysisCount = 0;
      dbUser.lastUsageResetAt = now;
      await dbUser.save();
    }

    // Rate Limit Gating
    if (activeTier === "free") {
      if ((dbUser.monthlyAnalysisCount || 0) >= FREE_PLAN.monthlyLimit) {
        return NextResponse.json(
          {
            success: false,
            error: `You have used your ${FREE_PLAN.monthlyLimit} free analyses for this month. Explore your Premium Trial or upgrade to continue your relationship intelligence sessions.`,
            code: "UPGRADE_REQUIRED",
            limitExceeded: true
          },
          { status: 403 }
        );
      }
    } else {
      const limit = activeTier === "pro" ? 100 : 500;
      if ((dbUser.monthlyAnalysisCount || 0) >= limit) {
        return NextResponse.json(
          {
            success: false,
            error: `You have reached your monthly limit of ${limit} analyses for the ${activeTier} tier. Next reset: ${new Date(lastReset.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
            code: "LIMIT_EXCEEDED",
            limitExceeded: true
          },
          { status: 429 }
        );
      }
    }

    // Fetch last 3 past analyses to feed as historical sequence context to detect growth/repair trends over time
    const pastAnalyses = await ChatAnalysis.find({ userId }).sort({ createdAt: -1 }).limit(3);
    const pastSummary = pastAnalyses
      .map(
        (a) =>
          `Date: ${new Date(a.createdAt).toLocaleDateString()}, Score: ${a.score}, Sentiment: ${a.sentiment}, Flagged Patterns: ${
            a.analysisResult?.redFlags?.map((f: any) => f.type).join(", ") || "none"
          }`
      )
      .join("\n");

    // 4. Run the high-fidelity AI Analysis pipeline with calibration preferences & past trends
    const safeText = sampleChatTextIfTooLong(text);
    const result = await analyzeChatText(safeText, {
      coachTone: dbUser.coachTone,
      banterLevel: (dbUser as any).banterLevel,
      conflictBaseline: (dbUser as any).conflictBaseline,
      pastSummary,
    });

    // Map Positivity Score to general sentiment bucket
    let sentimentBucket = "neutral";
    if (result.positivityScore >= 75) {
      sentimentBucket = "positive";
    } else if (result.positivityScore < 50) {
      sentimentBucket = "negative";
    }

    // 5. Save the analysis block directly to the database
    const savedRecord = await ChatAnalysis.create({
      userId,
      name: analysisName,
      platform: analysisPlatform,
      sentiment: sentimentBucket,
      score: result.positivityScore,
      dateText: "Just now",
      analysisResult: result,
      schemaVersion: 2,
    });

    // Update usage counters
    dbUser.monthlyAnalysisCount = (dbUser.monthlyAnalysisCount || 0) + 1;
    dbUser.freeAnalysisUsed = true;
    
    // Analytics: increment trial analyses if currently active on trial
    if (access.isTrialActive) {
      dbUser.trialAnalysesCount = (dbUser.trialAnalysesCount || 0) + 1;
    }
    await dbUser.save();

    // Track analysis completion event
    trackEvent("analysis_completed", userId, {
      tier: activeTier,
      score: result.positivityScore,
      platform: analysisPlatform,
      monthlyCount: dbUser.monthlyAnalysisCount,
    });

    // Revalidate relevant pages
    try {
      revalidatePath("/dashboard");
      revalidatePath("/api/analyze-chat");
    } catch (e) {
      console.error("Failed to revalidate paths:", e);
    }

    // 6. Return response
    return NextResponse.json({
      success: true,
      message: "Chat conversation analyzed successfully!",
      recordId: savedRecord._id,
      analysis: result,
    });
  } catch (error: any) {
    console.error("❌ [API Route] Error analyzing chat conversation:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze chat log." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User session ID mapping not found." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Check if a specific ID is requested
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const analysisRecord = await ChatAnalysis.findOne({ _id: id, userId });
      if (!analysisRecord) {
        return NextResponse.json(
          { success: false, error: "Analysis record not found." },
          { status: 404 }
        );
      }
      
      const doc = typeof (analysisRecord as any).toObject === "function"
        ? (analysisRecord as any).toObject()
        : analysisRecord;

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

      return NextResponse.json({
        success: true,
        analysis: {
          ...doc.analysisResult,
          analysisId: doc._id.toString(),
          redFlags: normalizedRedFlags,
          communicationBalance: typeof doc.analysisResult?.communicationBalance === "number" ? doc.analysisResult.communicationBalance : 50,
          name: doc.name,
          platform: doc.platform,
          createdAt: doc.createdAt,
          score: doc.score,
          sentiment: doc.sentiment,
          schemaVersion: doc.schemaVersion ?? doc.analysisResult?.schemaVersion ?? 1,
          emotions: calculateEmotions(pos, rfCount),
          compatibility: calculateCompatibility(pos, str, style, rfCount),
          attachmentBreakdown: calculateAttachmentBreakdown(style, pos)
        }
      });
    }

    const analyses = await ChatAnalysis.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      analyses
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }
    });
  } catch (error: any) {
    console.error("❌ [API Route] Error fetching chat analyses:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch chat analyses." },
      { status: 500 }
    );
  }
}
