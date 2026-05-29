import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import ChatAnalysis from "@/models/ChatAnalysis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();
    const user = await User.findOne({ _id: userId }) as any;

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Build dynamic contextual notifications based on user state
    const notifications = [];

    // 1. Voice Analyzer update notification (System announcement)
    notifications.push({
      id: "update-voice",
      title: "📢 New Feature: Voice Tone Analyzer",
      message: "You can now upload or record voice notes in the Voice Analyzer tab to measure emotional resonance, tempo, and stress markers.",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      type: "system",
      link: "/dashboard/voice"
    });

    // 2. Email verification status
    if (user.emailVerified) {
      notifications.push({
        id: "msg-verified",
        title: "✅ Email Verified Successfully",
        message: "Your email has been successfully verified! You now have full access to standard features.",
        timestamp: user.emailVerified instanceof Date ? user.emailVerified.toISOString() : new Date(user.emailVerified).toISOString(),
        type: "user"
      });
    } else {
      notifications.push({
        id: "msg-unverified",
        title: "⚠️ Verify Your Email",
        message: "Please click the link sent to your email to verify your account and enable full platform features.",
        timestamp: user.createdAt instanceof Date ? user.createdAt.toISOString() : new Date(user.createdAt).toISOString(),
        type: "system"
      });
    }

    // 3. Subscription status notification
    if (user.subscriptionTier === "free") {
      notifications.push({
        id: "promo-trial",
        title: "🎁 Unlock Premium Trial",
        message: "Get 24 hours of completely unlocked Premium relationship intelligence (AI Coach, compatibility, memory timeline) for free.",
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        type: "promo",
        link: "/dashboard/trial"
      });
    } else {
      notifications.push({
        id: "msg-premium-active",
        title: "👑 Premium Active",
        message: "Your premium relationship intelligence suite is active! Enjoy unlimited chat analyses and advanced insights.",
        timestamp: user.trialActivatedAt 
          ? (user.trialActivatedAt instanceof Date ? user.trialActivatedAt.toISOString() : new Date(user.trialActivatedAt).toISOString())
          : user.updatedAt 
          ? (user.updatedAt instanceof Date ? user.updatedAt.toISOString() : new Date(user.updatedAt).toISOString())
          : new Date().toISOString(),
        type: "user"
      });
    }

    // 4. Latest Chat Analysis notification (querying from ChatAnalysis model for 100% type safety)
    const chatAnalyses = await ChatAnalysis.find({ userId });
    if (chatAnalyses && chatAnalyses.length > 0) {
      const sortedAnalyses = [...chatAnalyses].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latest = sortedAnalyses[0];
      notifications.push({
        id: `analysis-${latest._id}`,
        title: `📊 Analysis Complete: ${latest.name}`,
        message: `Your chat has been successfully parsed. Positivity Score: ${latest.score}%. Sentiment: ${latest.sentiment}.`,
        timestamp: latest.createdAt instanceof Date ? latest.createdAt.toISOString() : new Date(latest.createdAt).toISOString(),
        type: "user",
        link: "/dashboard"
      });
    }

    // 5. Daily relationship tip
    notifications.push({
      id: "tip-active-listening",
      title: "💡 Relationship Tip of the Day",
      message: "Practice the 'Reflective Listening' technique: repeat back what your partner says in your own words before you respond.",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
      type: "tip"
    });

    // Sort by timestamp descending
    notifications.sort(
      (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      notifications
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
