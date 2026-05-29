import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { isSubscriptionActive, PLANS, FREE_PLAN, getUserAccess } from "@/lib/subscription-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Auto-reset monthly counter if 30 days have passed
    let monthlyCount = user.monthlyAnalysisCount || 0;
    const now = new Date();
    const lastReset = user.lastUsageResetAt ? new Date(user.lastUsageResetAt) : new Date(user.createdAt || now);
    const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceReset >= 30) {
      user.monthlyAnalysisCount = 0;
      user.lastUsageResetAt = now;
      await user.save();
      monthlyCount = 0;
    }

    const access = getUserAccess(user);

    return NextResponse.json({
      success: true,
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
      },
      usage: {
        freeAnalysisUsed: user.freeAnalysisUsed || false,
        monthlyAnalysisCount: monthlyCount,
        monthlyLimit: access.tier === "free" ? FREE_PLAN.monthlyLimit : PLANS[access.tier].monthlyLimit,
      }
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { region } = await req.json();

    if (!region || typeof region !== "string") {
      return NextResponse.json({ success: false, error: "Invalid region parameter" }, { status: 400 });
    }

    const validRegions = ["IN", "US", "GL"]; // GL is global/US
    const uppercaseRegion = region.toUpperCase();
    if (!validRegions.includes(uppercaseRegion)) {
      return NextResponse.json({ success: false, error: "Unsupported billing region" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    user.billingRegion = uppercaseRegion;
    user.currency = uppercaseRegion === "IN" ? "INR" : "USD";
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Region updated successfully",
      billingRegion: user.billingRegion,
      currency: user.currency
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
