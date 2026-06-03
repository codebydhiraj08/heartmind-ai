import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import VoiceAnalysis from "@/models/VoiceAnalysis";
import User from "@/models/User";
import { getUserAccess, FREE_PLAN } from "@/lib/subscription-service";
import { trackEvent } from "@/lib/analytics";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to analyze voice logs." },
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
    const { name, duration, emotions, insights } = body;

    if (!emotions || !Array.isArray(emotions)) {
      return NextResponse.json(
        { success: false, error: "Emotions spectrum array is required." },
        { status: 400 }
      );
    }

    const analysisName = (name || "Voice Log Analysis").trim();
    const voiceDuration = duration || 0;

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

    // 4. Extract scores and map sentiment
    const stressObj = emotions.find((e: any) => e.name === "Stress Level") || { value: 30 };
    const excitementObj = emotions.find((e: any) => e.name === "Excitement") || { value: 50 };
    const hesitationObj = emotions.find((e: any) => e.name === "Hesitation") || { value: 20 };
    const sadnessObj = emotions.find((e: any) => e.name === "Sadness") || { value: 10 };
    const angerObj = emotions.find((e: any) => e.name === "Anger") || { value: 5 };
    
    // Overall positivity score based on voice excitement and lower stress
    const overallScore = Math.min(100, Math.max(0, Math.round((excitementObj.value + (100 - stressObj.value)) / 2)));

    let sentimentBucket = "neutral";
    if (overallScore >= 70) {
      sentimentBucket = "positive";
    } else if (overallScore < 45) {
      sentimentBucket = "negative";
    }

    // Define dynamic thresholds based on overallScore
    let stressThreshold = 55;
    let hesitationThreshold = 50;
    let sadnessThreshold = 35;
    let angerThreshold = 20;
    let excitementThreshold = 30;

    if (overallScore < 85) {
      // Moderate concerns: scale down thresholds to capture subtle signals
      stressThreshold = 30;
      hesitationThreshold = 30;
      sadnessThreshold = 12;
      angerThreshold = 5;
      excitementThreshold = 45;
    }
    
    if (overallScore < 55) {
      // High concerns: scale down thresholds further
      stressThreshold = 20;
      hesitationThreshold = 20;
      sadnessThreshold = 8;
      angerThreshold = 3;
      excitementThreshold = 60;
    }

    // Construct dynamic red flags array
    const redFlagsList = [];

    if (stressObj.value > stressThreshold) {
      redFlagsList.push({
        type: "stress_escalation",
        severity: stressObj.value > 70 ? ("high" as const) : ("medium" as const),
        title: "Acoustic Stress Escalation",
        description: `Voice analysis detected elevated acoustic stress indicators at ${stressObj.value}% intensity.`,
        confidence: Math.round(stressObj.value * 0.9),
        evidence: `Micro-tremor amplitude shifts in vocal harmonics indicate heightened emotional arousal.`
      });
    }

    if (hesitationObj.value > hesitationThreshold) {
      redFlagsList.push({
        type: "avoidance_pattern",
        severity: "medium" as const,
        title: "Acoustic Evasion & Hesitation",
        description: `High hesitation rates (${hesitationObj.value}%) hint at emotional guarding or active topic evasion.`,
        confidence: Math.round(hesitationObj.value * 0.95),
        evidence: `Processing delays and silent interval clusters measured at ${hesitationObj.value}% severity.`
      });
    }

    if (sadnessObj.value > sadnessThreshold) {
      redFlagsList.push({
        type: "emotional_withdrawal",
        severity: "medium" as const,
        title: "Vocal Tone Flattening",
        description: `Subtle vocal energy flattening suggests emotional withdrawal or fatigue (${sadnessObj.value}% sadness).`,
        confidence: Math.round(sadnessObj.value * 0.9),
        evidence: `Loss of pitch resonance and flattened frequency contour lines observed.`
      });
    }

    if (angerObj.value > angerThreshold) {
      redFlagsList.push({
        type: "defensive_behavior",
        severity: "high" as const,
        title: "Acoustic Defense Posture",
        description: `Sharp syllabic energy spikes suggest defensive tone adjustments during verbal sharing (${angerObj.value}% anger).`,
        confidence: Math.round(angerObj.value * 0.9),
        evidence: `Sudden bursts in acoustic volume and compression of pitch ranges.`
      });
    }

    if (excitementObj.value < excitementThreshold) {
      redFlagsList.push({
        type: "emotional_distance",
        severity: "medium" as const,
        title: "Emotional Distance Detected",
        description: `Low vocal excitement and low acoustic involvement (${excitementObj.value}%) suggest potential emotional distance.`,
        confidence: Math.round((100 - excitementObj.value) * 0.85),
        evidence: `Subtle dampening of voice dynamics and lack of verbal excitement resonance.`
      });
    }

    if (overallScore < 50 && redFlagsList.length === 0) {
      redFlagsList.push({
        type: "communication_breakdown",
        severity: "high" as const,
        title: "Communication Asymmetry",
        description: "The overall acoustic scoring indicates low voice resonance alignment and poor connection parameters.",
        confidence: 80,
        evidence: "Cumulative acoustic cues suggest high tension and low emotional safety."
      });
    }

    const fullResult = {
      positivityScore: overallScore,
      stressScore: stressObj.value,
      communicationBalance: 50,
      attachmentStyle: "secure" as const,
      redFlags: redFlagsList,
      suggestions: Array.isArray(insights) ? insights.map((ins: any) => ins.description || ins.title) : [
        "Maintain a steady, relaxed pacing when communicating high-emotion topics.",
        "Practice deep breathing exercises before sharing vulnerable thoughts."
      ],
      timelineInsights: [
        "Logged relationship voice alignment session.",
        "Monitored dynamic acoustic harmony peaks."
      ],
      voiceInsights: Array.isArray(insights) ? insights.map((ins: any) => ins.title) : ["Warm tone detected"]
    };

    // 5. Save the analysis block directly to the database
    const savedRecord = await VoiceAnalysis.create({
      userId,
      name: analysisName,
      sentiment: sentimentBucket,
      score: overallScore,
      duration: voiceDuration,
      analysisResult: fullResult,
    });

    // Update usage counters
    dbUser.monthlyAnalysisCount = (dbUser.monthlyAnalysisCount || 0) + 1;
    dbUser.freeAnalysisUsed = true;
    
    if (access.isTrialActive) {
      dbUser.trialAnalysesCount = (dbUser.trialAnalysesCount || 0) + 1;
    }
    await dbUser.save();

    // Track analysis completion event
    trackEvent("voice_analysis_completed", userId, {
      tier: activeTier,
      score: overallScore,
      duration: voiceDuration,
      monthlyCount: dbUser.monthlyAnalysisCount,
    });

    // Revalidate relevant pages
    try {
      revalidatePath("/dashboard");
      revalidatePath("/api/analyze-voice");
    } catch (e) {
      console.error("Failed to revalidate paths:", e);
    }

    // 6. Return response
    return NextResponse.json({
      success: true,
      message: "Voice log analyzed and saved successfully!",
      recordId: savedRecord._id,
      analysis: fullResult,
    });
  } catch (error: any) {
    console.error("❌ [API Route] Error analyzing voice log:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze voice log." },
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
      const analysisRecord = await VoiceAnalysis.findOne({ _id: id, userId });
      if (!analysisRecord) {
        return NextResponse.json(
          { success: false, error: "Analysis record not found." },
          { status: 404 }
        );
      }
      
      const recordObj = typeof (analysisRecord as any).toObject === "function"
        ? (analysisRecord as any).toObject()
        : analysisRecord;

      return NextResponse.json({
        success: true,
        analysis: {
          ...recordObj.analysisResult,
          name: recordObj.name,
          duration: recordObj.duration,
          createdAt: recordObj.createdAt,
          score: recordObj.score,
          sentiment: recordObj.sentiment
        }
      });
    }

    const analyses = await VoiceAnalysis.find({ userId }).sort({ createdAt: -1 });

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
    console.error("❌ [API Route] Error fetching voice analyses:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch voice analyses." },
      { status: 500 }
    );
  }
}
