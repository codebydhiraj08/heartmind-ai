import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getUserAccess } from "@/lib/subscription-service";
import { trackEvent } from "@/lib/analytics";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json().catch(() => ({}));
    const { fingerprint } = body;

    await connectToDatabase();
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return NextResponse.json({ success: false, error: "User profile not found" }, { status: 404 });
    }

    // 2. Verify hasUsedTrial === false
    if (user.hasUsedTrial) {
      return NextResponse.json(
        { 
          success: false, 
          error: "You have already activated your Premium Trial. Explore HeartMind paid membership plans to lock in lifetime emotional visibility." 
        }, 
        { status: 400 }
      );
    }

    // 3. Security: Hash device fingerprint server-side before storing to prevent trial farming
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";
    
    // Hash combination server-side using SHA-256
    const combinedHash = crypto
      .createHash("sha256")
      .update((fingerprint || "no-client-fingerprint") + clientIp + userAgent)
      .digest("hex");

    // 4. Update Database: Activate 24h Premium Trial
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // exactly 24 hours

    user.trialStartedAt = now;
    user.trialActivatedAt = now;
    user.trialExpiresAt = expires;
    user.hasUsedTrial = true;
    user.currentPlan = "trial";
    user.premiumAccessSource = "trial";
    
    // PRIVACY: Raw fingerprint payloads are NEVER persisted.
    // Only the irreversible SHA-256 hash is stored for anti-abuse detection.
    // Device fingerprinting and IP heuristics are treated as SECONDARY risk signals only.
    // Primary anti-abuse enforcement relies on: verified email, OAuth identity uniqueness,
    // server-side rate limiting, and trial activation tracking.
    user.signupIp = user.signupIp || clientIp;
    user.lastKnownIp = clientIp;
    user.signupDeviceFingerprint = combinedHash; // SHA-256 hash only, never raw data

    await user.save();

    // Calculate updated access tier
    const access = getUserAccess(user);

    // Track trial activation event
    trackEvent("trial_started", userId, {
      activatedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Premium Trial activated successfully!",
      subscription: {
        tier: access.tier,
        status: user.subscriptionStatus || "none",
        paymentProvider: user.paymentProvider || "none",
        billingRegion: user.billingRegion || "US",
        currency: user.currency || "USD",
        expiresAt: user.subscriptionExpiresAt || null,
        isTrialActive: access.isTrialActive,
        trialExpiresAt: access.trialExpiresAt,
        trialActivatedAt: access.trialActivatedAt,
        hasUsedTrial: access.hasUsedTrial,
        premiumAccessSource: access.premiumAccessSource,
      }
    });
  } catch (error: any) {
    console.error("Trial Activation Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
