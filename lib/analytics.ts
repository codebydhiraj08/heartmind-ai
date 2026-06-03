/**
 * HeartMind AI — Behavioral Event Analytics
 *
 * Lightweight, privacy-respecting analytics layer for tracking
 * conversion-critical lifecycle events across the SaaS funnel.
 *
 * Events are logged server-side to the user's profile in the database
 * and can be forwarded to external analytics providers (Mixpanel, PostHog, etc.)
 * in a production deployment.
 *
 * PRIVACY POLICY:
 * - No raw device fingerprints are ever stored.
 * - Only irreversible SHA-256 hashes are persisted for anti-abuse signals.
 * - Event payloads contain only behavioral metadata, never PII.
 */

// ─── Event Type Definitions ───────────────────────────────────────────────────

export type AnalyticsEventName =
  | "trial_started"
  | "trial_expired"
  | "premium_gate_opened"
  | "upgrade_cta_clicked"
  | "checkout_started"
  | "subscription_activated"
  | "feature_preview_viewed"
  | "analysis_completed"
  | "voice_analysis_completed"
  | "onboarding_banner_viewed"
  | "trial_cta_viewed"
  | "profile_updated"
  | "preferences_updated"
  | "support_ticket_submitted";

export interface AnalyticsEvent {
  event: AnalyticsEventName;
  userId?: string;
  timestamp: string;
  properties?: Record<string, string | number | boolean | null>;
}

// ─── Server-Side Event Logger ─────────────────────────────────────────────────

/**
 * Logs an analytics event. In development, events are written to console
 * and appended to the user's analyticsEvents array in the database.
 * In production, this would forward to an external analytics service.
 */
export function trackEvent(
  event: AnalyticsEventName,
  userId?: string,
  properties?: Record<string, string | number | boolean | null>
): AnalyticsEvent {
  const payload: AnalyticsEvent = {
    event,
    userId,
    timestamp: new Date().toISOString(),
    properties: properties || {},
  };

  // Development logging — structured JSON for easy grep/parsing
  console.log(
    `📊 [ANALYTICS] ${event}`,
    JSON.stringify({
      userId: userId?.substring(0, 8) + "...",
      ...payload.properties,
    })
  );

  return payload;
}

// ─── Client-Side Event Dispatcher ─────────────────────────────────────────────

/**
 * Sends a behavioral event from the client to the analytics endpoint.
 * Fire-and-forget pattern — never blocks UI rendering.
 */
export async function sendClientEvent(
  event: AnalyticsEventName,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> {
  try {
    // Use navigator.sendBeacon for non-blocking delivery where available
    const payload = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      properties: properties || {},
    });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/event", blob);
    } else {
      // Fallback for SSR or older browsers
      fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silently fail — analytics should never break UX
      });
    }
  } catch {
    // Analytics failures must NEVER impact user experience
  }
}

// ─── Tier Access Definitions ──────────────────────────────────────────────────

/**
 * Canonical feature access matrix for HeartMind AI.
 *
 * CRITICAL RULE: Premium gates should NEVER hide a user's OWN data.
 * Users can always access their core insights from completed analyses.
 * Only advanced intelligence layers (AI Coach, Compatibility, Voice, etc.)
 * require Pro/Premium access.
 */
export const TIER_ACCESS = {
  free: {
    monthlyAnalyses: 5,
    coreDashboard: true,
    basicTrends: true,
    limitedHistory: true,
    partialCharts: true,
    blurredPremiumPreviews: true,
    ownAnalysisData: true, // NEVER gate user's own data
    aiCoach: false,
    voiceAnalysis: false,
    compatibilitySuite: false,
    memoryTimeline: false,
    deepEmotionalMapping: false,
    advancedTrends: false,
    communicationReframing: false,
  },
  trial: {
    monthlyAnalyses: Infinity,
    coreDashboard: true,
    basicTrends: true,
    limitedHistory: false, // Full history during trial
    partialCharts: false, // Full charts during trial
    blurredPremiumPreviews: false,
    ownAnalysisData: true,
    aiCoach: true,
    voiceAnalysis: true,
    compatibilitySuite: true,
    memoryTimeline: true,
    deepEmotionalMapping: true,
    advancedTrends: true,
    communicationReframing: true,
  },
  pro: {
    monthlyAnalyses: Infinity,
    coreDashboard: true,
    basicTrends: true,
    limitedHistory: false,
    partialCharts: false,
    blurredPremiumPreviews: false,
    ownAnalysisData: true,
    aiCoach: false,
    voiceAnalysis: true,
    compatibilitySuite: false,
    memoryTimeline: false,
    deepEmotionalMapping: false,
    advancedTrends: true,
    communicationReframing: true,
  },
  premium: {
    monthlyAnalyses: Infinity,
    coreDashboard: true,
    basicTrends: true,
    limitedHistory: false,
    partialCharts: false,
    blurredPremiumPreviews: false,
    ownAnalysisData: true,
    aiCoach: true,
    voiceAnalysis: true,
    compatibilitySuite: true,
    memoryTimeline: true,
    deepEmotionalMapping: true,
    advancedTrends: true,
    communicationReframing: true,
  },
} as const;
