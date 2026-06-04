import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import VoiceAnalysis from "@/models/VoiceAnalysis";
import User from "@/models/User";
import { getUserAccess, FREE_PLAN } from "@/lib/subscription-service";
import { trackEvent } from "@/lib/analytics";
import { revalidatePath } from "next/cache";
import { calculateEmotions, calculateCompatibility, calculateAttachmentBreakdown, calibrateAnalysis } from "@/lib/metrics";


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

    const banterLevel = (dbUser as any).banterLevel || "medium";
    const conflictBaseline = (dbUser as any).conflictBaseline || "calm";

    // 4. Extract scores and map sentiment
    const stressObj = emotions.find((e: any) => e.name === "Stress Level") || { value: 30 };
    const excitementObj = emotions.find((e: any) => e.name === "Excitement") || { value: 50 };
    const hesitationObj = emotions.find((e: any) => e.name === "Hesitation") || { value: 20 };
    const sadnessObj = emotions.find((e: any) => e.name === "Sadness") || { value: 10 };
    const angerObj = emotions.find((e: any) => e.name === "Anger") || { value: 5 };

    let stressVal = stressObj.value;
    let excitementVal = excitementObj.value;
    let hesitationVal = hesitationObj.value;
    let sadnessVal = sadnessObj.value;
    let angerVal = angerObj.value;

    const updatedInsights = Array.isArray(insights) ? [...insights] : [];

    // Tonal Calibration based on conflictBaseline
    if (conflictBaseline === "expressive") {
      stressVal = Math.max(10, Math.round(stressVal * 0.85));
      angerVal = Math.max(0, Math.round(angerVal * 0.85));
    } else if (conflictBaseline === "heated") {
      stressVal = Math.max(10, Math.round(stressVal * 0.7));
      angerVal = Math.max(0, Math.round(angerVal * 0.7));
    }

    // Acoustic Nuance Detection
    let isSarcasmDetected = false;
    let isConcernDetected = false;

    // 1. Playful Sarcasm Detection: High playfulness and banter, moderate stress but high excitement
    if ((banterLevel === "high" || banterLevel === "medium") && excitementVal > 50 && stressVal > 40) {
      isSarcasmDetected = true;
      stressVal = Math.max(10, Math.round(stressVal * 0.8)); // Defuse stress score due to playfulness
      angerVal = Math.max(0, Math.round(angerVal * 0.7));
      
      // Inject Playful Sarcasm Insight
      if (!updatedInsights.some(ins => ins.title.includes("Sarcasm"))) {
        updatedInsights.unshift({
          type: "positive",
          title: "Playful Sarcasm Detected 🎭",
          description: "Vocal dynamics indicate lighthearted sarcasm and high excitement resonance, reflecting a playful, secure banter style in line with your calibrated relationship normal."
        });
      }
    }

    // 2. Genuine Concern Detection: Moderate/High stress + sadness, low anger + excitement (vulnerable sharing)
    if (!isSarcasmDetected && stressVal > 45 && sadnessVal > 15 && angerVal < 10 && excitementVal < 40) {
      isConcernDetected = true;
      stressVal = Math.max(10, Math.round(stressVal * 0.85)); // Soften stress since it is empathetic/vulnerable concern
      
      // Inject Genuine Concern Insight
      if (!updatedInsights.some(ins => ins.title.includes("Concern"))) {
        updatedInsights.unshift({
          type: "positive",
          title: "Genuine Concern Detected 🍃",
          description: "Vocal frequency contour lines show soft pitch adjustments and lower volume peaks, indicating deep emotional vulnerability, empathy, and genuine concern."
        });
      }
    }

    // Inject baseline info if settings are calibrated
    if ((conflictBaseline === "expressive" || conflictBaseline === "heated") && !updatedInsights.some(ins => ins.title.includes("Baseline"))) {
      updatedInsights.push({
        type: "neutral",
        title: "Calibrated Tonal Baseline Active",
        description: `Your vocal analysis is calibrated for a ${conflictBaseline} relationship style, adjusting thresholds to prevent false red flags.`
      });
    }

    // Reconstruct updated emotions spectrum
    const updatedEmotions = [
      { name: "Stress Level", value: stressVal, icon: "Zap", color: "text-warning", bgColor: "bg-warning/20" },
      { name: "Hesitation", value: hesitationVal, icon: "AlertCircle", color: "text-accent", bgColor: "bg-accent/20" },
      { name: "Excitement", value: excitementVal, icon: "Smile", color: "text-success", bgColor: "bg-success/20" },
      { name: "Sadness", value: sadnessVal, icon: "Frown", color: "text-muted-foreground", bgColor: "bg-secondary" },
      { name: "Anger", value: angerVal, icon: "Meh", color: "text-danger", bgColor: "bg-danger/20" }
    ];
    
    // Overall positivity score based on calibrated excitement and stress
    const overallScore = Math.min(100, Math.max(0, Math.round((excitementVal + (100 - stressVal)) / 2)));

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

    // Adjust thresholds based on conflictBaseline calibration
    if (conflictBaseline === "expressive") {
      stressThreshold += 10;
      angerThreshold += 10;
    } else if (conflictBaseline === "heated") {
      stressThreshold += 20;
      angerThreshold += 20;
    }

    if (overallScore < 85) {
      // Moderate concerns: scale down thresholds to capture subtle signals
      stressThreshold = Math.max(30, stressThreshold - 15);
      hesitationThreshold = Math.max(30, hesitationThreshold - 15);
      sadnessThreshold = Math.max(12, sadnessThreshold - 15);
      angerThreshold = Math.max(5, angerThreshold - 10);
      excitementThreshold = 45;
    }
    
    if (overallScore < 55) {
      // High concerns: scale down thresholds further
      stressThreshold = Math.max(20, stressThreshold - 25);
      hesitationThreshold = Math.max(20, hesitationThreshold - 25);
      sadnessThreshold = Math.max(8, sadnessThreshold - 20);
      angerThreshold = Math.max(3, angerThreshold - 15);
      excitementThreshold = 60;
    }

    // Construct dynamic red flags array
    const redFlagsList = [];

    if (stressVal > stressThreshold) {
      redFlagsList.push({
        type: "stress_escalation",
        severity: stressVal > 70 ? ("high" as const) : ("medium" as const),
        title: "Acoustic Stress Escalation",
        description: `Voice analysis detected elevated acoustic stress indicators at ${stressVal}% intensity.`,
        confidence: Math.round(stressVal * 0.9),
        evidence: `Micro-tremor amplitude shifts in vocal harmonics indicate heightened emotional arousal.`
      });
    }

    if (hesitationVal > hesitationThreshold) {
      redFlagsList.push({
        type: "avoidance_pattern",
        severity: "medium" as const,
        title: "Acoustic Evasion & Hesitation",
        description: `High hesitation rates (${hesitationVal}%) hint at emotional guarding or active topic evasion.`,
        confidence: Math.round(hesitationVal * 0.95),
        evidence: `Processing delays and silent interval clusters measured at ${hesitationVal}% severity.`
      });
    }

    if (sadnessVal > sadnessThreshold) {
      redFlagsList.push({
        type: "emotional_withdrawal",
        severity: "medium" as const,
        title: "Vocal Tone Flattening",
        description: `Subtle vocal energy flattening suggests emotional withdrawal or fatigue (${sadnessVal}% sadness).`,
        confidence: Math.round(sadnessVal * 0.9),
        evidence: `Loss of pitch resonance and flattened frequency contour lines observed.`
      });
    }

    if (angerVal > angerThreshold) {
      redFlagsList.push({
        type: "defensive_behavior",
        severity: "high" as const,
        title: "Acoustic Defense Posture",
        description: `Sharp syllabic energy spikes suggest defensive tone adjustments during verbal sharing (${angerVal}% anger).`,
        confidence: Math.round(angerVal * 0.9),
        evidence: `Sudden bursts in acoustic volume and compression of pitch ranges.`
      });
    }

    if (excitementVal < excitementThreshold) {
      redFlagsList.push({
        type: "emotional_distance",
        severity: "medium" as const,
        title: "Emotional Distance Detected",
        description: `Low vocal excitement and low acoustic involvement (${excitementVal}%) suggest potential emotional distance.`,
        confidence: Math.round((100 - excitementVal) * 0.85),
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

    // Construct proactive suggestions for voice analysis
    const voiceSuggestions = [
      "Conversation Starter: 'I feel a bit of tension in our vocal tones during deep check-ins. Can we talk about how we can help each other speak more gently?'",
      "Exercise (Vocal Appreciation): Spend 5 minutes recording a voice memo sharing three direct things you appreciated about each other today, focusing on keeping a slow, relaxed pitch.",
      "Practice Conversational Regard: When sharing high-emotion feelings, take a centering breath before speaking to maintain steady acoustic harmony."
    ];

    const fullResult = {
      positivityScore: overallScore,
      stressScore: stressVal,
      communicationBalance: 50,
      attachmentStyle: "secure" as const,
      redFlags: redFlagsList,
      suggestions: voiceSuggestions,
      timelineInsights: [
        "Logged relationship voice alignment session.",
        `Acoustic resonance evaluated against your ${conflictBaseline} conflict baseline.`
      ],
      voiceInsights: Array.isArray(updatedInsights) ? updatedInsights.map((ins: any) => ins.title) : ["Warm tone detected"],
      emotions: updatedEmotions,
      insights: updatedInsights
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
    const userBaseline = dbUser.reassuranceBaseline || "standard";
    const calibratedResult = calibrateAnalysis(fullResult, userBaseline, "voice");

    return NextResponse.json({
      success: true,
      message: "Voice log analyzed and saved successfully!",
      recordId: savedRecord._id,
      analysis: calibratedResult,
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

      const userBaseline = (session.user as any).reassuranceBaseline || "standard";
      const calibratedResult = calibrateAnalysis({
        ...recordObj.analysisResult,
        score: recordObj.score,
      }, userBaseline, "voice");

      return NextResponse.json({
        success: true,
        analysis: {
          ...calibratedResult,
          name: recordObj.name,
          duration: recordObj.duration,
          createdAt: recordObj.createdAt,
        }
      });
    }

    const analyses = await VoiceAnalysis.find({ userId }).sort({ createdAt: -1 });
    const userBaseline = (session.user as any).reassuranceBaseline || "standard";

    const calibratedAnalyses = analyses.map((a) => {
      const doc = typeof (a as any).toObject === "function" ? (a as any).toObject() : a;
      if (doc.analysisResult) {
        doc.analysisResult = calibrateAnalysis({
          ...doc.analysisResult,
          score: doc.score,
        }, userBaseline, "voice");
        doc.score = doc.analysisResult.positivityScore;
        doc.sentiment = doc.analysisResult.sentiment;
      }
      return doc;
    });

    return NextResponse.json({
      success: true,
      analyses: calibratedAnalyses
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
