import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { trackEvent, AnalyticsEventName } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const VALID_EVENTS: AnalyticsEventName[] = [
  "trial_started",
  "trial_expired",
  "premium_gate_opened",
  "upgrade_cta_clicked",
  "checkout_started",
  "subscription_activated",
  "feature_preview_viewed",
  "analysis_completed",
  "voice_analysis_completed",
  "onboarding_banner_viewed",
  "trial_cta_viewed",
];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "anonymous";

    const body = await req.json().catch(() => ({}));
    const { event, properties } = body;

    if (!event || !VALID_EVENTS.includes(event as AnalyticsEventName)) {
      return NextResponse.json(
        { success: false, error: "Invalid event type" },
        { status: 400 }
      );
    }

    // Log the event server-side
    trackEvent(event as AnalyticsEventName, userId, properties || {});

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    // Analytics endpoints should never return errors that break UX
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
