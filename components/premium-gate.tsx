"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { sendClientEvent } from "@/lib/analytics";

// Psychologically safe, suggestive & reflective preview snippets
const PREVIEW_SNIPPETS: Record<string, string> = {
  "Couple Compatibility Analysis": "Possible communication distancing patterns may be emerging in late-night logs. Map these subtle interaction styles.",
  "AI Relationship Coach": "A gentle reframe suggestion is available for sensitive discussions to help reduce defensiveness. Continue exploring constructive dialogues.",
  "Red Flag Detection": "A subtle rise in defensive conversational loops has been noted in recent logs. Explore emotional de-escalation guidance.",
  "Voice Emotion Analysis": "Subtle vocal strain nuances may have occurred during boundaries discussions. Reflect on acoustic sentiment.",
  "Smart AI Replies": "Reframing suggestions are compiled for this conversation to help build closeness and reduce distance. Explore alignment strategies.",
  "Emotional Intelligence Dashboard": "Late-night conversations indicate a slight divergence in emotional sync. Deepen your understanding of these trends.",
  "Timeline Memory System": "Key relational inflection points and shared growth moments have been identified. Document your shared journey.",
  "Conflict Resolution AI": "A constructive response pattern is recommended for the recent scheduling debate. Access active listening paths.",
  "Attachment Style Analysis": "Subtle changes in attachment security profiles may be forming based on recent messaging trends. Continue mapping attachment styles.",
};

interface PremiumGateProps {
  allowedTiers: ("pro" | "premium")[];
  featureName: string;
  children: React.ReactNode;
  fallbackMode?: "lock" | "blur";
}

// A beautiful, highly aesthetic representation of locked dashboards to stimulate curiosity
// A beautiful, highly aesthetic representation of locked dashboards to stimulate curiosity
const MockDashboardSkeleton = () => (
  <div className="w-full space-y-6 p-6 select-none pointer-events-none relative">
    {/* Glowing live sync top header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Connection Workspace</span>
      </div>
      <div className="h-4 bg-zinc-800/40 rounded w-24 animate-pulse" />
    </div>

    {/* Realistic Stat Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1 */}
      <div className="premium-card rounded-2xl border border-white/[0.04] bg-zinc-950/40 p-4 space-y-3 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">Attachment Style Profile</span>
          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">94% Sec</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-extrabold text-zinc-300">Secure / Aligned</span>
        </div>
        {/* Sparkle micro-line */}
        <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden">
          <div className="w-4/5 h-full bg-gradient-to-r from-primary to-accent animate-pulse" />
        </div>
      </div>

      {/* Card 2 */}
      <div className="premium-card rounded-2xl border border-white/[0.04] bg-zinc-950/40 p-4 space-y-3 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">Conversational Rhythm</span>
          <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">Balanced</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-extrabold text-zinc-300">Equitable Effort</span>
        </div>
        <div className="flex gap-1 items-end h-3 pt-1">
          <div className="w-full bg-zinc-800/50 h-[30%] rounded-sm" />
          <div className="w-full bg-primary/40 h-[60%] rounded-sm animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-full bg-accent/40 h-[80%] rounded-sm animate-pulse" style={{ animationDelay: "0.4s" }} />
          <div className="w-full bg-zinc-800/50 h-[45%] rounded-sm" />
        </div>
      </div>

      {/* Card 3 */}
      <div className="premium-card rounded-2xl border border-white/[0.04] bg-zinc-950/40 p-4 space-y-3 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">Emotional Stress Signals</span>
          <span className="text-[9px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">12% Low</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-extrabold text-zinc-300">Calm Baseline</span>
        </div>
        {/* Shimmer wave representation */}
        <div className="relative h-2 flex items-center justify-between gap-0.5 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="bg-rose-500/30 w-1 rounded-full animate-pulse" 
              style={{ 
                height: `${Math.sin(i / 1.5) * 4 + 6}px`,
                animationDuration: "1.5s",
                animationDelay: `${i * 0.1}s`
              }} 
            />
          ))}
        </div>
      </div>
    </div>

    {/* Realistic Interactive Chart Box */}
    <div className="premium-card rounded-2xl border border-white/[0.04] bg-zinc-950/40 p-5 space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Dynamic Emotional Synchrony</span>
          <p className="text-[9px] text-zinc-500">Real-time daily resonance index</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[9px] text-zinc-400">Alignment</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[9px] text-zinc-400">Closeness</span>
          </div>
        </div>
      </div>

      {/* Actual SVG line graph that glows beautiful colors! */}
      <div className="relative h-28 w-full border-b border-white/[0.04] border-dashed">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="primaryGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="accentGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 50 Q 80 10 160 35 T 320 20 T 480 35 L 480 112 L 0 112 Z"
            fill="url(#primaryGlow)"
          />
          <path
            d="M 0 50 Q 80 10 160 35 T 320 20 T 480 35"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
          />
          <path
            d="M 0 65 Q 90 30 180 15 T 360 35 T 480 10 L 480 112 L 0 112 Z"
            fill="url(#accentGlow)"
          />
          <path
            d="M 0 65 Q 90 30 180 15 T 360 35 T 480 10"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
          />
        </svg>

        {/* Floating gridlines */}
        <div className="absolute top-1/4 left-0 right-0 border-t border-white/[0.02]" />
        <div className="absolute top-2/4 left-0 right-0 border-t border-white/[0.02]" />
        <div className="absolute top-3/4 left-0 right-0 border-t border-white/[0.02]" />
      </div>
    </div>

    {/* Pattern Alerts list */}
    <div className="premium-card rounded-2xl border border-white/[0.04] bg-zinc-950/40 p-4 space-y-3 relative overflow-hidden">
      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Behavioral Synchronizations</span>
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.01] border border-white/[0.02]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
          <span className="text-[10px] text-zinc-300 font-medium">Empathetic alignment detected in late-night messaging</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.01] border border-white/[0.02]">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
          <span className="text-[10px] text-zinc-300 font-medium">Slight asymmetrical gap in message lengths</span>
        </div>
      </div>
    </div>
  </div>
);

export function PremiumGate({
  allowedTiers,
  featureName,
  children,
  fallbackMode = "blur",
}: PremiumGateProps) {
  const { subscription, loading } = useSubscription();

  // If subscription is loading, render a beautiful minimal dashboard skeleton/loader
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium tracking-wide animate-pulse">
          Verifying secure access credentials...
        </p>
      </div>
    );
  }

  const activeTier = subscription?.tier || "free";
  const hasAccess = allowedTiers.includes(activeTier as any);

  // If the user has active credentials for this tier, unlock and display
  if (hasAccess) {
    return <>{children}</>;
  }

  // Track premium gate view for conversion analytics
  if (typeof window !== "undefined") {
    sendClientEvent("premium_gate_opened", { feature: featureName, currentTier: activeTier });
  }

  // Determine required tier name for the copy
  const isPremiumRequired = allowedTiers.includes("premium") && !allowedTiers.includes("pro");
  const requiredTierName = isPremiumRequired ? "Premium" : "Pro";

  const LockCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-white/[0.05] bg-zinc-950/90 p-5 shadow-2xl relative glass-strong backdrop-blur-xl text-center"
    >
      {/* Visual glowing border accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="flex flex-col items-center space-y-4 relative z-10">
        {/* Compact lock/crown badge */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/5 flex items-center justify-center shadow-lg">
          {isPremiumRequired ? (
            <Crown className="w-5 h-5 text-primary animate-pulse" />
          ) : (
            <Lock className="w-4 h-4 text-accent" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            HeartMind {requiredTierName} Feature
          </h3>
          <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Upgrade to the **{requiredTierName}** plan to unlock {featureName}.
          </p>
        </div>

        {/* Action Button */}
        <Link href="/dashboard/upgrade" className="w-full">
          <Button
            onClick={() => sendClientEvent("upgrade_cta_clicked", { feature: featureName, from: "premium_gate" })}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white text-xs font-semibold h-9 rounded-lg border border-white/5 shadow-md shadow-primary/10 transition-all duration-300 flex items-center justify-center gap-1"
          >
            Upgrade Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );

  // We always use the beautiful backdrop blurring overlay, even for fallbackMode === "lock"
  // If children is provided, we blur the children. If not, we render MockDashboardSkeleton.
  return (
    <div className="relative min-h-[260px] w-full h-full rounded-2xl overflow-hidden py-6 px-4 flex items-center justify-center">
      {/* Obscured background layer */}
      <div className={`absolute inset-0 filter ${fallbackMode === "blur" ? "blur-md" : "blur-lg"} select-none pointer-events-none opacity-20`}>
        {children ? children : <MockDashboardSkeleton />}
      </div>
      
      {/* Glassmorphic lock card overlay centered */}
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
        <LockCard />
      </div>
    </div>
  );
}
