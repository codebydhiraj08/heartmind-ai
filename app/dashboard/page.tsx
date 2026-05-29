"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSubscription } from "@/hooks/use-subscription"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  MessageSquareText,
  Shield,
  Heart,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Activity,
  Sparkles,
  Target,
  Mic,
  CheckCircle,
  Users,
  Crown,
  Lock,
  Search,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PremiumGate } from "@/components/premium-gate"
import { cn } from "@/lib/utils"
import { sendClientEvent } from "@/lib/analytics"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Line
} from "recharts"

const timeAgo = (dateStr: string) => {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  } catch (e) {
    return "Recently";
  }
};

const getGrade = (score: number) => {
  if (score >= 90) return { grade: "A+", label: "Excellent Resonance" };
  if (score >= 80) return { grade: "A", label: "Healthy Flow" };
  if (score >= 70) return { grade: "B", label: "Good Dynamics" };
  if (score >= 60) return { grade: "C", label: "Steady Flow" };
  return { grade: "D", label: "Reflective Space" };
};

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession()
  const userName = session?.user?.name || "Guest"
  const { subscription, usage, loading: subscriptionLoading, refreshSubscription } = useSubscription()

  const [analyses, setAnalyses] = useState<any[]>([])
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null)
  const [loadingAnalyses, setLoadingAnalyses] = useState(true)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      setLoadingAnalyses(true);
      setLatestAnalysis(null);
      setAnalyses([]);
      
      Promise.all([
        fetch("/api/latest-analysis?_t=" + Date.now(), { cache: "no-store" }).then(res => res.json()),
        fetch("/api/analyze-chat?_t=" + Date.now(), { cache: "no-store" }).then(res => res.json())
      ])
        .then(([latestData, listData]) => {
          if (latestData.success && latestData.analysis) {
            setLatestAnalysis(latestData.analysis);
          }
          if (listData.success) {
            setAnalyses(listData.analyses || []);
          }
        })
        .catch((err) => console.error("Error fetching dashboard data:", err))
        .finally(() => setLoadingAnalyses(false));
    } else if (sessionStatus === "unauthenticated") {
      setLoadingAnalyses(false);
    }
  }, [sessionStatus])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 24
      }
    }
  };

  const pageLoading = subscriptionLoading || loadingAnalyses || sessionStatus === "loading"

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium tracking-wide animate-pulse">
          Opening your connection workspace...
        </p>
      </div>
    );
  }

  const isNewUser = !latestAnalysis;

  if (isNewUser) {
    return (
      <div className="space-y-10 pb-12">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Welcome, {userName}</h1>
            <p className="text-sm text-zinc-400 mt-1">Ready to explore your relationship dynamics</p>
          </div>
        </motion.div>

        {/* Cinematic Empty State Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="premium-card spotlight-glow rounded-3xl border border-white/[0.05] bg-zinc-950/60 p-8 md:p-12 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden glass-strong"
          onMouseMove={handleMouseMove}
        >
          {/* Top glowing radial flare */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Animated Dynamic Icon */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl relative">
                <Heart className="w-9 h-9 text-primary fill-primary/10" />
                <Sparkles className="w-4.5 h-4.5 text-accent absolute -top-1 -right-1 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            <div className="space-y-2.5 max-w-xl mx-auto">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                Your connection dynamics are ready to be charted
              </h2>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                You haven&apos;t analyzed any conversations yet. Step into reflective relationship intelligence by analyzing your first chat log to uncover supportive communication patterns, attachment dynamics, and emotional synchronization baseline metrics.
              </p>
            </div>

            {/* Aspirational Action Journey */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/dashboard/analyzer">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white text-xs font-semibold h-11 px-6 rounded-xl border border-white/5 shadow-md shadow-primary/10 transition-all duration-300 flex items-center justify-center gap-2">
                  <MessageSquareText className="w-4 h-4" />
                  Analyze your first conversation
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/upgrade">
                <Button variant="outline" className="w-full sm:w-auto text-xs font-semibold h-11 px-6 rounded-xl border-white/[0.06] hover:bg-white/[0.02]">
                  Explore clarity benefits
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Sleek Blurred Live Teaser Outline */}
        <div className="relative mt-12 rounded-3xl overflow-hidden border border-white/[0.03] p-1 bg-zinc-950/20 select-none pointer-events-none">
          {/* Transparent Dark overlay */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="w-5 h-5 text-zinc-500 mb-2 animate-pulse" />
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Workspace Dashboard Preview</p>
            <p className="text-xs text-zinc-350 mt-2 max-w-md leading-relaxed font-semibold">
              Your relationship insights will begin appearing here after your first conversation analysis.
            </p>
            <p className="text-[10px] text-zinc-500 mt-1 max-w-xs leading-normal">
              Your reflective analytics dashboard, daily patterns, behavioral alerts, and memory lines will populate automatically.
            </p>
          </div>

          {/* Locked Dashboard Representation in background */}
          <div className="opacity-15 filter blur-[1px] space-y-6 p-6">
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
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">Stress Pattern Insights</span>
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
                    <linearGradient id="primaryGlowObscured" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="accentGlowObscured" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 50 Q 80 10 160 35 T 320 20 T 480 35 L 480 112 L 0 112 Z"
                    fill="url(#primaryGlowObscured)"
                  />
                  <path
                    d="M 0 50 Q 80 10 160 35 T 320 20 T 480 35"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                  />
                  <path
                    d="M 0 65 Q 90 30 180 15 T 360 35 T 480 10 L 480 112 L 0 112 Z"
                    fill="url(#accentGlowObscured)"
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
          </div>
        </div>
      </div>
    );
  }

  // Calculate dynamic dashboard stats using strict MongoDB document mappings
  const currentHealth = latestAnalysis?.positivityScore || 80;
  let healthChange = "New";
  let healthTrend = "stable";
  if (analyses.length >= 2) {
    const prevScore = analyses[1].analysisResult?.positivityScore ?? analyses[1].score ?? 70;
    const diff = currentHealth - prevScore;
    healthChange = diff >= 0 ? `+${diff}%` : `${diff}%`;
    healthTrend = diff >= 0 ? "up" : "down";
  }

  // 2. Communication Card calculations
  const commInfo = getGrade(currentHealth);
  let commChange = "New";
  let commTrend = "stable";
  if (analyses.length >= 2) {
    const prevScore = analyses[1].analysisResult?.positivityScore ?? analyses[1].score ?? 70;
    const diff = currentHealth - prevScore;
    commChange = diff >= 0 ? `+${diff}%` : `${diff}%`;
    commTrend = diff >= 0 ? "up" : "down";
  }

  // 3. Communication Balance Card calculations
  const currentBalance = latestAnalysis?.communicationBalance || 50;
  let balanceChange = "New";
  let balanceTrend = "stable";
  if (analyses.length >= 2) {
    const prevBalance = analyses[1].analysisResult?.communicationBalance || 50;
    const diff = currentBalance - prevBalance;
    balanceChange = diff >= 0 ? `+${diff}%` : `${diff}%`;
    balanceTrend = diff >= 0 ? "up" : "down";
  }

  // 4. Emotional Stress Signals Card calculations
  const redFlagsCount = latestAnalysis?.redFlags?.length || 0;
  const stressSignalsLabel = 
    redFlagsCount === 0 ? "All Clear" : 
    redFlagsCount <= 1 ? "Low Risk" : 
    redFlagsCount <= 2 ? "Medium Risk" : "High Risk";
  
  let stressSignalsChange = "New";
  let stressSignalsTrend = "stable";
  if (analyses.length >= 2) {
    const prevFlagsCount = analyses[1].analysisResult?.redFlags?.length || 0;
    const diff = redFlagsCount - prevFlagsCount;
    stressSignalsChange = diff >= 0 ? `+${diff}` : `${diff}`;
    stressSignalsTrend = diff > 0 ? "down" : diff < 0 ? "up" : "stable"; // More flags = down trend in relationship health terms
  }

  // Area Chart Data Extraction (chronological order)
  const computedChartData = [...analyses].slice(0, 7).reverse().map((a, index) => {
    const dateObj = new Date(a.createdAt);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    
    const positivity = a.analysisResult?.positivityScore ?? a.score ?? 70;
    const connection = a.analysisResult?.communicationBalance ?? 50;
    const stress = a.analysisResult?.stressScore ?? 30;
    
    return {
      day: dayName,
      positivity,
      stress,
      connection,
      name: a.name
    };
  });

  if (computedChartData.length === 1) {
    computedChartData.unshift({
      day: "Baseline",
      positivity: Math.max(10, Math.min(98, computedChartData[0].positivity - 5)),
      stress: Math.max(10, Math.min(98, computedChartData[0].stress + 5)),
      connection: Math.max(10, Math.min(98, computedChartData[0].connection - 3)),
      name: "Baseline"
    });
  }

  // Recent Analyses Data Extraction
  const computedRecentAnalyses = analyses.slice(0, 3).map((a) => {
    return {
      id: a._id || a.id,
      name: a.name,
      platform: a.platform,
      sentiment: a.sentiment,
      score: a.score,
      date: timeAgo(a.createdAt)
    };
  });

  const filteredAnalyses = analyses.filter((a) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = a.name?.toLowerCase().includes(query);
    const platformMatch = a.platform?.toLowerCase().includes(query);
    return nameMatch || platformMatch;
  });

  // Dynamic Pattern Alerts (Red Flags mapping)
  const latestRedFlags: any[] = latestAnalysis?.redFlags || [];
  const computedRedFlagAlerts = latestRedFlags.map((flag: any, index: number) => {
    return {
      id: `flag-${index}`,
      type: flag.title || "Communication Signal",
      severity: flag.severity || "low",
      description: flag.description || "",
      date: "Latest analysis"
    };
  });

  // Dynamic suggestion
  const latestSuggestions = latestAnalysis?.suggestions || [];
  const dynamicCoachTip = latestSuggestions[0] || "Active listening is key to deeper connections. Try reflecting back what your partner says before responding with your own thoughts. This builds trust and shows genuine interest.";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Welcome back, {userName}</h1>
          <p className="text-sm text-zinc-400 mt-1">Relationship intelligence and assistive insights</p>
        </div>
        <Link href="/dashboard/analyzer">
          <Button className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-4 h-9 rounded-lg border border-white/5 shadow-md shadow-primary/10 transition-all duration-300">
            <MessageSquareText className="mr-2 w-4 h-4" />
            New Analysis
          </Button>
        </Link>
      </motion.div>

      {/* Dynamic Lifecycle & Trial Promotion Banners */}
      {(() => {
        const isTrialActive = subscription?.isTrialActive || false
        const hasUsedTrial = subscription?.hasUsedTrial || false
        const activeTier = subscription?.tier || "free"
        const trialExpiresAt = subscription?.trialExpiresAt
        
        let remainingHours = 0
        let trialLifecycleState: "active" | "near_expiry" | "nearing_completion" | "none" = "none"

        if (isTrialActive && trialExpiresAt) {
          const expiryTime = new Date(trialExpiresAt).getTime()
          const diffMs = expiryTime - Date.now()
          const diffHours = diffMs / (1000 * 60 * 60)
          remainingHours = Math.max(0, Math.ceil(diffHours))
          if (diffHours > 12) {
            trialLifecycleState = "active"
          } else if (diffHours > 2) {
            trialLifecycleState = "near_expiry"
          } else {
            trialLifecycleState = "nearing_completion"
          }
        }

        // Onboarding Banner: Not Yet Activated Trial
        if (!hasUsedTrial && activeTier === "free") {
          return (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent relative overflow-hidden shadow-lg shadow-primary/5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary flex-shrink-0 animate-pulse">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Unlock Full Emotional Visibility
                    <span className="text-[9px] font-extrabold uppercase tracking-widest bg-primary/20 border border-primary/30 text-primary py-0.5 px-1.5 rounded-full">New Flow</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-normal">
                    Manual activation gives you a focused 24 hours of complete HeartMind Premium access on your terms. No credit card required. Explore coach dialogues, compatibility mapping, and emotional pattern analytics completely unlocked.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/trial" className="relative z-10 flex-shrink-0 w-full md:w-auto">
                <Button
                  onClick={() => sendClientEvent("upgrade_cta_clicked", { from: "onboarding_banner" })}
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white text-xs font-bold h-9 px-5 rounded-lg border border-white/5 shadow-md shadow-primary/10 transition-all duration-300"
                >
                  Explore Full Relationship Intelligence
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </motion.div>
          )
        }

        // Active Trial Banners with smooth messaging
        if (isTrialActive && trialLifecycleState !== "none") {
          let badgeText = "Premium Trial Active"
          let bannerText = "Your relationship intelligence journey is active. Full emotional visibility is currently unlocked."
          let glowClass = "border-primary/20 bg-primary/5 text-primary"
          
          if (trialLifecycleState === "near_expiry") {
            badgeText = "Trial Expiring Soon"
            bannerText = `Your premium relationship insights remain active for ${remainingHours} more hours.`
            glowClass = "border-amber-500/25 bg-amber-500/5 text-amber-400"
          } else if (trialLifecycleState === "nearing_completion") {
            badgeText = "Trial Closing"
            bannerText = "Your premium emotional insights experience is nearing its close. Your core data and analysis history will remain accessible."
            glowClass = "border-rose-500/20 bg-rose-500/5 text-rose-400"
          }

          return (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md relative overflow-hidden",
                glowClass.split(" ")[0],
                glowClass.split(" ")[1]
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-350">
                      {badgeText}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{remainingHours}h left</span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 font-medium leading-relaxed">{bannerText}</p>
                </div>
              </div>
              <Link href="/dashboard/upgrade" className="relative z-10 flex-shrink-0 w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto text-xs font-semibold h-8 px-4 rounded-lg border-white/[0.06] hover:bg-white/[0.02]">
                  Lock In Premium Access
                </Button>
              </Link>
            </motion.div>
          )
        }

        // Expired Banner
        if (hasUsedTrial && !isTrialActive && activeTier === "free") {
          return (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-white/[0.04] bg-zinc-950/40 relative overflow-hidden shadow-inner flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-500 flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-350 flex items-center gap-1.5">
                    Your Premium Trial has ended
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-zinc-800 border border-zinc-700 text-zinc-400 py-0.5 px-1.5 rounded-full">Expired</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-normal">
                    Your previous insights remain available. Continue exploring deeper relationship intelligence anytime to chart your emotional growth and attachment pathways.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/upgrade" className="relative z-10 flex-shrink-0 w-full md:w-auto">
                <Button
                  onClick={() => sendClientEvent("upgrade_cta_clicked", { from: "expired_banner" })}
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white text-xs font-bold h-9 px-5 rounded-lg border border-white/5 shadow-md shadow-primary/10 transition-all duration-300"
                >
                  Explore deeper relationship intelligence
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </motion.div>
          )
        }

        return null
      })()}

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            title: "Relationship Health",
            value: currentHealth,
            suffix: "/100",
            change: healthChange,
            trend: healthTrend,
            icon: Heart,
            iconColor: "text-rose-400"
          },
          {
            title: "Communication Score",
            value: commInfo.grade,
            subtitle: commInfo.label,
            change: commChange,
            trend: commTrend,
            icon: MessageSquareText,
            iconColor: "text-indigo-400"
          },
          {
            title: "Emotional Balance",
            value: currentBalance,
            suffix: "%",
            change: balanceChange,
            trend: balanceTrend,
            icon: Activity,
            iconColor: "text-sky-400"
          },
          {
            title: "Stress Pattern Insights",
            value: redFlagsCount,
            subtitle: stressSignalsLabel,
            change: stressSignalsChange,
            trend: stressSignalsTrend,
            icon: Shield,
            iconColor: "text-amber-400"
          }
        ].map((stat) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
          >
            <div
              onMouseMove={handleMouseMove}
              className="premium-card spotlight-glow rounded-2xl p-5 border border-white/[0.04] shadow-xl relative overflow-hidden group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center">
                  <stat.icon className={`w-4.5 h-4.5 ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold py-0.5 px-2 rounded-full border ${
                  stat.trend === "up" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : stat.trend === "down" 
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                    : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
                }`}>
                  {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : 
                   stat.trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-semibold text-zinc-400 tracking-wide uppercase mb-1">{stat.title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-white">{stat.value}</span>
                  {stat.suffix && <span className="text-xs text-zinc-500 font-medium">{stat.suffix}</span>}
                  {stat.subtitle && <span className="text-[10px] font-semibold text-zinc-500 uppercase ml-2">{stat.subtitle}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Emotional Trends Chart */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
          className="lg:col-span-2"
        >
          <PremiumGate allowedTiers={["pro", "premium"]} featureName="Emotional Intelligence Dashboard" fallbackMode="blur">
            <div
              onMouseMove={handleMouseMove}
              className="premium-card spotlight-glow rounded-2xl border border-white/[0.04] shadow-xl h-full flex flex-col justify-between"
            >
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <div>
                <CardTitle className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">Emotional Pattern Analytics</CardTitle>
                <p className="text-[11px] text-zinc-400 mt-0.5">Assistive tracking of emotional resonance indicators</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/20" />
                  <span className="text-zinc-400">Positivity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-sm shadow-accent/20" />
                  <span className="text-zinc-400">Connection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-dashed border border-dashed border-danger w-2.5 h-2.5 bg-danger/10" />
                  <span className="text-zinc-400">Stress Signals</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 relative z-10">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={computedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="positivityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.06} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="connectionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.06} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="rgba(255,255,255,0.15)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.15)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      dx={-5}
                    />
                    <Tooltip
                      cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 1 }}
                      contentStyle={{
                        backgroundColor: "rgba(9, 9, 11, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "8px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                        padding: "8px 12px"
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: "11px", marginBottom: "4px" }}
                      itemStyle={{ fontSize: "11px", padding: "2px 0" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="positivity"
                      stroke="var(--primary)"
                      fill="url(#positivityGradient)"
                      strokeWidth={1.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="connection"
                      stroke="var(--accent)"
                      fill="url(#connectionGradient)"
                      strokeWidth={1.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="stress"
                      stroke="var(--danger)"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </div>
          </PremiumGate>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
        >
          <div
            onMouseMove={handleMouseMove}
            className="premium-card spotlight-glow rounded-2xl border border-white/[0.04] shadow-xl h-full flex flex-col"
          >
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">Relationship Growth Utilities</CardTitle>
              <p className="text-[11px] text-zinc-400 mt-0.5">Quick access tool suite</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-1.5 pb-5 relative z-10">
              {[
                { name: "Analyze New Chat", icon: MessageSquareText, href: "/dashboard/analyzer", accent: "group-hover:text-primary group-hover:bg-primary/5 group-hover:border-primary/20" },
                { name: "Check Red Flags", icon: Shield, href: "/dashboard/red-flags", accent: "group-hover:text-danger group-hover:bg-danger/5 group-hover:border-danger/20" },
                { name: "Generate AI Reply", icon: Sparkles, href: "/dashboard/replies", accent: "group-hover:text-accent group-hover:bg-accent/5 group-hover:border-accent/20" },
                { name: "Voice Analysis", icon: Mic, href: "/dashboard/voice", accent: "group-hover:text-primary group-hover:bg-primary/5 group-hover:border-primary/20" },
                { name: "Attachment Style", icon: Target, href: "/dashboard/attachment", accent: "group-hover:text-emerald-400 group-hover:bg-emerald-500/5 group-hover:border-emerald-500/20" },
                { name: "Compatibility Test", icon: Users, href: "/dashboard/compatibility", accent: "group-hover:text-accent group-hover:bg-accent/5 group-hover:border-accent/20" }
              ].map((action) => (
                <Link key={action.name} href={action.href}>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.02] transition-all duration-300 group">
                    <div className={`w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 transition-all duration-300 ${action.accent}`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors flex-1">{action.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Analyses */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
        >
          <div
            onMouseMove={handleMouseMove}
            className="premium-card spotlight-glow rounded-2xl border border-white/[0.04] shadow-xl p-5"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.04] mb-4 relative z-10">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">Recent Assistive Insights</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Latest conversation logs analyzed</p>
              </div>
              <Button 
                onClick={() => setIsHistoryModalOpen(true)}
                variant="ghost" 
                size="sm" 
                className="text-xs font-semibold text-primary hover:text-primary/90 hover:bg-primary/5 px-2.5 h-7 rounded-md"
              >
                View All
              </Button>
            </div>
            <div className="space-y-2.5 relative z-10">
              {computedRecentAnalyses.map((analysis: any) => (
                <Link
                  key={analysis.id}
                  href={`/dashboard/analyzer?id=${analysis.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/30 border border-white/[0.02] hover:bg-white/[0.02] hover:border-white/[0.04] transition-all duration-300 cursor-pointer block"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    analysis.sentiment === "positive" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" :
                    analysis.sentiment === "neutral" ? "bg-amber-500/10 text-amber-400 border-amber-500/10" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/10"
                  }`}>
                    {analysis.sentiment === "positive" ? <CheckCircle className="w-4.5 h-4.5" /> :
                     analysis.sentiment === "neutral" ? <Activity className="w-4.5 h-4.5" /> :
                     <AlertTriangle className="w-4.5 h-4.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{analysis.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{analysis.platform} • {analysis.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      analysis.score >= 80 ? "text-emerald-400" :
                      analysis.score >= 60 ? "text-amber-400" :
                      "text-rose-400"
                    }`}>{analysis.score}</p>
                    <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Score</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Red Flag Alerts (Stress Pattern Insights) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
        >
          <PremiumGate allowedTiers={["pro", "premium"]} featureName="Red Flag Detection" fallbackMode="blur">
            <div
              onMouseMove={handleMouseMove}
              className="premium-card spotlight-glow rounded-2xl border border-white/[0.04] shadow-xl p-5"
            >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.04] mb-4 relative z-10">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">Stress Pattern Insights</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Identified communication indicators</p>
              </div>
              <Link href="/dashboard/red-flags">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary/90 hover:bg-primary/5 px-2.5 h-7 rounded-md">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3 relative z-10">
              {computedRedFlagAlerts.length > 0 ? (
                computedRedFlagAlerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border relative overflow-hidden transition-all duration-300 hover:bg-white/[0.01] ${
                      alert.severity === "high" ? "bg-rose-500/[0.02] border-rose-500/20" :
                      alert.severity === "medium" ? "bg-amber-500/[0.02] border-amber-500/20" :
                      "bg-primary/[0.02] border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertTriangle className={`w-3.5 h-3.5 ${
                        alert.severity === "high" ? "text-rose-400" :
                        alert.severity === "medium" ? "text-amber-400" :
                        "text-primary"
                      }`} />
                      <span className="text-xs font-bold text-zinc-200">{alert.type}</span>
                      <span className={`ml-auto text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full border ${
                        alert.severity === "high" ? "bg-rose-500/15 text-rose-400 border-rose-500/20" :
                        alert.severity === "medium" ? "bg-amber-500/15 text-amber-400 border-amber-500/20" :
                        "bg-primary/15 text-primary border-primary/20"
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal">{alert.description}</p>
                    <p className="text-[10px] text-zinc-500 mt-2 font-medium">{alert.date}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-10 h-10 mx-auto text-emerald-400/80 mb-2" />
                  <p className="text-sm font-semibold text-zinc-200">All Patterns Supportive</p>
                  <p className="text-xs text-zinc-400 mt-0.5">No negative patterns indicators detected</p>
                </div>
              )}
            </div>
          </div>
          </PremiumGate>
        </motion.div>
      </motion.div>

      {/* AI Coach Tip */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="show"
        whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      >
        <PremiumGate allowedTiers={["pro", "premium"]} featureName="AI Relationship Coach" fallbackMode="blur">
          <div
            onMouseMove={handleMouseMove}
            className="premium-card spotlight-glow rounded-2xl border border-white/[0.04] shadow-xl p-5 relative overflow-hidden bg-gradient-to-r from-zinc-950 to-zinc-900/40"
          >
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary to-accent rounded-l-full" />
          <div className="flex flex-col md:flex-row md:items-center gap-4 pl-2 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/10 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-zinc-200 tracking-wide uppercase mb-1">Daily Reflective Suggestion</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
                {dynamicCoachTip}
              </p>
            </div>
            <Link href="/dashboard/coach">
              <Button variant="outline" className="flex-shrink-0 border-white/[0.06] hover:bg-white/[0.02] text-xs font-semibold px-4 h-8 rounded-lg transition-colors">
                More Tips
                <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
        </PremiumGate>
      </motion.div>

      {/* All Past Analyses History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            {/* Backdrop Closer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute inset-0 cursor-default"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-2xl bg-zinc-950/95 border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden glass-strong flex flex-col max-h-[85vh] relative z-10"
            >
              {/* Top gradient glowing accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary" />

              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.05] relative z-10">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
                    <Activity className="w-4 h-4 text-primary" />
                    All Analyzed Conversations
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Browse, filter, and review all your past assistive connection insights ({analyses.length} total)
                  </p>
                </div>
                <Button 
                  onClick={() => setIsHistoryModalOpen(false)}
                  variant="ghost" 
                  size="icon" 
                  className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-white/[0.05] bg-zinc-900/10 relative z-10">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by conversation name or platform..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/40 border border-white/[0.04] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none text-xs text-zinc-200 placeholder-zinc-500 transition-all duration-300"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Body - List of Chats */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[400px]">
                {filteredAnalyses.length > 0 ? (
                  filteredAnalyses.map((analysis) => {
                    const mappedItem = {
                      id: analysis._id || analysis.id,
                      name: analysis.name,
                      platform: analysis.platform,
                      sentiment: analysis.sentiment,
                      score: analysis.score,
                      date: timeAgo(analysis.createdAt)
                    };
                    const { grade, label } = getGrade(mappedItem.score);

                    return (
                      <Link
                        key={mappedItem.id}
                        href={`/dashboard/analyzer?id=${mappedItem.id}`}
                        onClick={() => setIsHistoryModalOpen(false)}
                        className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-900/30 border border-white/[0.02] hover:bg-white/[0.02] hover:border-white/[0.04] transition-all duration-300 cursor-pointer block group"
                      >
                        {/* Sentiment Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          mappedItem.sentiment === "positive" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 group-hover:bg-emerald-500/15" :
                          mappedItem.sentiment === "neutral" ? "bg-amber-500/10 text-amber-400 border border-amber-500/10 group-hover:bg-amber-500/15" :
                          "bg-rose-500/10 text-rose-400 border border-rose-500/10 group-hover:bg-rose-500/15"
                        }`}>
                          {mappedItem.sentiment === "positive" ? <CheckCircle className="w-4 h-4" /> :
                           mappedItem.sentiment === "neutral" ? <Activity className="w-4 h-4" /> :
                           <AlertTriangle className="w-4 h-4" />}
                        </div>

                        {/* Title and platform info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">{mappedItem.name}</p>
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-white/[0.05]">
                              {mappedItem.platform}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5 font-medium">
                            <span>{mappedItem.date}</span>
                            <span>•</span>
                            <span className={
                              mappedItem.score >= 80 ? "text-emerald-500/70" :
                              mappedItem.score >= 60 ? "text-amber-500/70" :
                              "text-rose-500/70"
                            }>{label}</span>
                          </p>
                        </div>

                        {/* Grade and Score Info */}
                        <div className="text-right flex items-center gap-3">
                          <div className="hidden sm:block">
                            <span className="text-[10px] font-bold text-zinc-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                              Grade {grade}
                            </span>
                          </div>
                          <div className="flex flex-col items-end justify-center">
                            <p className={`text-base font-extrabold leading-none ${
                              mappedItem.score >= 80 ? "text-emerald-400" :
                              mappedItem.score >= 60 ? "text-amber-400" :
                              "text-rose-400"
                            }`}>{mappedItem.score}</p>
                            <span className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Score</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="w-8 h-8 text-zinc-700 mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-zinc-300">No matching analyses found</p>
                    <p className="text-[10px] text-zinc-500 max-w-xs mt-1">
                      No past logs matched your search &quot;{searchQuery}&quot;.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/[0.05] bg-zinc-950/40 flex items-center justify-between text-[9px] text-zinc-500 font-semibold uppercase tracking-wider relative z-10">
                <span>Select any chat to load its deep analytics</span>
                <span className="text-primary hover:underline cursor-pointer" onClick={() => setIsHistoryModalOpen(false)}>
                  Close Window
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
