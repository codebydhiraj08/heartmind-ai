"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  AlertOctagon,
  Heart,
  Eye,
  MessageSquare,
  Zap,
  Flame,
  Ghost,
  Scale,
  Brain,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PremiumGate } from "@/components/premium-gate"

const redFlagPatterns = [
  {
    id: "defensive_behavior",
    name: "Defensive Behavior",
    description: "Defensiveness, sweeping blame, or denial of issues",
    icon: Shield,
    severity: "medium",
    indicators: ["Deflection of boundary setting", "Guilt attribution phrases", "Sarcastic responses during tense discussions"],
    detected: false,
    confidence: 0,
    examples: 0
  },
  {
    id: "emotional_distance",
    name: "Emotional Distance",
    description: "Stale responses, silent treatment, or lack of emotional reciprocity",
    icon: Ghost,
    severity: "medium",
    indicators: ["One-sided text log length", "Prolonged response intervals", "Lack of validating remarks"],
    detected: false,
    confidence: 0,
    examples: 0
  },
  {
    id: "manipulation_pattern",
    name: "Manipulation Pattern",
    description: "Attempting to guilt, confuse, or assert psychological control",
    icon: Brain,
    severity: "high",
    indicators: ["Guilt-tripping or guilt-trapping", "Reality distortion (gaslighting) keywords", "Deflecting responsibility"],
    detected: false,
    confidence: 0,
    examples: 0
  },
  {
    id: "communication_breakdown",
    name: "Communication Breakdown",
    description: "High rates of ignored queries or conversational asymmetry",
    icon: XCircle,
    severity: "high",
    indicators: ["No response to direct questions", "Drastic response timing mismatches", "Stagnant engagement flow"],
    detected: false,
    confidence: 0,
    examples: 0
  },
  {
    id: "stress_escalation",
    name: "Stress Escalation",
    description: "Rapid increase in negative emotions, panic, or conversational stress",
    icon: Zap,
    severity: "high",
    indicators: ["Clustering of anxious conflict keywords", "Acoustic or textual frustration markers", "Frequent de-escalation failures"],
    detected: false,
    confidence: 0,
    examples: 0
  },
  {
    id: "passive_aggression",
    name: "Passive Aggression",
    description: "Indirect expression of negative feelings or hostile silence",
    icon: Scale,
    severity: "medium",
    indicators: ["Sarcastic affirmations ('fine', 'whatever')", "Withholding normal verbal warmth", "Vague structural evasion"],
    detected: false,
    confidence: 0,
    examples: 0
  },
  {
    id: "avoidance_pattern",
    name: "Avoidance Pattern",
    description: "Actively evading serious topics or physical/emotional closeness",
    icon: Eye,
    severity: "medium",
    indicators: ["Fear of commitments or labels", "Consistently changing subject", "Deflecting vulnerability bids"],
    detected: false,
    confidence: 0,
    examples: 0
  },
  {
    id: "reassurance_dependency",
    name: "Reassurance Dependency",
    description: "Unhealthy reliance on continuous emotional validation",
    icon: Heart,
    severity: "low",
    indicators: ["Constant questions about relationship status", "Fear of minor text changes", "Continuous validation seek loops"],
    detected: false,
    confidence: 0,
    examples: 0
  },
  {
    id: "conflict_loop",
    name: "Conflict Loop",
    description: "Getting stuck in identical repetitive arguments without resolution",
    icon: AlertOctagon,
    severity: "medium",
    indicators: ["Repetitive cyclic topics", "No compromise statements", "Immediate emotional triggers"],
    detected: false,
    confidence: 0,
    examples: 0
  },
  {
    id: "emotional_withdrawal",
    name: "Emotional Withdrawal",
    description: "Slowing or stopping verbal engagement and shut down",
    icon: TrendingDown,
    severity: "high",
    indicators: ["Silent treatment intervals", "Absolute loss of text validation", "Abrupt conversation halts"],
    detected: false,
    confidence: 0,
    examples: 0
  }
]

interface RedFlagPattern {
  id: string
  name: string
  description: string
  icon: any
  severity: string
  indicators: string[]
  detected: boolean
  confidence: number
  examples: number
  realEvidence?: string[]
  displayName?: string
  displayDescription?: string
  displaySeverity?: string
}

function RedFlagsPageInner() {
  const { data: session, update: updateSession } = useSession()
  const searchParams = useSearchParams()
  const chatId = searchParams.get("chatId")
  const voiceId = searchParams.get("voiceId")

  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [patterns, setPatterns] = useState<RedFlagPattern[]>(redFlagPatterns as any)
  const [safetyScore, setSafetyScore] = useState(100)
  const [activeLogName, setActiveLogName] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const fetchData = async () => {
      try {
        setLoading(true);
        let url = "/api/latest-analysis?_t=" + Date.now();
        if (chatId) {
          url = `/api/analyze-chat?id=${chatId}&_t=${Date.now()}`;
        } else if (voiceId) {
          url = `/api/analyze-voice?id=${voiceId}&_t=${Date.now()}`;
        }

        const res = await fetch(url, { cache: "no-store" })
        const data = await res.json()

        if (!active) return

        if (data.success && data.analysis) {
          const analysis = data.analysis;
          setActiveLogName(analysis.name || (chatId ? "Selected Chat Analysis" : voiceId ? "Selected Voice Analysis" : "Latest Analysis"));

          const dbRedFlags = analysis.redFlags || [];
          const userBaseline = (session?.user as any)?.reassuranceBaseline || "standard";
          
          let filteredFlags = dbRedFlags;
          let adjustedScore = analysis.positivityScore ?? analysis.score ?? 100;
          
          if (userBaseline === "vulnerable") {
            const hasReassurance = dbRedFlags.some((f: any) => f.type === "reassurance_dependency");
            if (hasReassurance) {
              // Filter out reassurance dependency completely from display list
              filteredFlags = dbRedFlags.filter((f: any) => f.type !== "reassurance_dependency");
              // Recalculate score (if it was the only one, make it 100, otherwise raise by 12 points)
              if (filteredFlags.length === 0) {
                adjustedScore = 100;
              } else {
                adjustedScore = Math.min(98, adjustedScore + 12);
              }
            }
          }
          
          const updatedPatterns = redFlagPatterns.map(p => {
            const matchedFlag = filteredFlags.find((f: any) => f.type === p.id);
            if (matchedFlag) {
              return {
                ...p,
                detected: true,
                confidence: typeof matchedFlag.confidence === "number" ? matchedFlag.confidence : 85,
                examples: 1,
                realEvidence: matchedFlag.evidence ? [matchedFlag.evidence] : [matchedFlag.description],
                displayName: matchedFlag.title || p.name,
                displayDescription: matchedFlag.description || p.description,
                displaySeverity: matchedFlag.severity || p.severity
              };
            }
            return {
              ...p,
              detected: false,
              confidence: 0,
              examples: 0,
              realEvidence: [],
              displayName: p.name,
              displayDescription: p.description,
              displaySeverity: p.severity
            };
          });

          setPatterns(updatedPatterns);
          setSafetyScore(adjustedScore);
        } else {
          setActiveLogName(null);
          setPatterns(redFlagPatterns.map(p => ({
            ...p,
            detected: false,
            confidence: 0,
            examples: 0,
            realEvidence: [],
            displayName: p.name,
            displayDescription: p.description,
            displaySeverity: p.severity
          })));
          setSafetyScore(100);
        }
      } catch (err) {
        console.error("Error fetching red flags analysis data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData()
    return () => {
      active = false
    }
  }, [chatId, voiceId])

  const detectedFlags = patterns.filter(p => p.detected)
  const safePatterns = patterns.filter(p => !p.detected)
  const overallSafetyScore = safetyScore

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-400 bg-red-500/10 border-red-500/20"
      case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20"
      case "low": return "text-blue-400 bg-blue-500/10 border-blue-500/20"
      default: return "text-muted-foreground bg-zinc-900 border-border"
    }
  }

  if (loading) {
    return (
      <PremiumGate allowedTiers={["free", "pro", "premium"]} featureName="Red Flag Detection">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          </div>
          <p className="text-xs text-zinc-500 font-medium tracking-wide animate-pulse">
            Scanning relationship profiles for emotional safety patterns...
          </p>
        </div>
      </PremiumGate>
    )
  }

  return (
    <PremiumGate allowedTiers={["free", "pro", "premium"]} featureName="Red Flag Detection">
      <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Red Flag Detection</h1>
          <p className="text-muted-foreground">AI-powered pattern analysis for emotional safety</p>
        </div>
        <Link href="/dashboard/analyzer">
          <Button className="bg-gradient-to-r from-primary to-accent text-white">
            <MessageSquare className="mr-2 w-4 h-4" />
            Analyze New Chat
          </Button>
        </Link>
      </motion.div>

      {/* Active Filter Banner */}
      {activeLogName && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-zinc-950/40 border border-white/[0.04] md:backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/15 border border-danger/30 flex items-center justify-center text-danger shrink-0">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Viewing Specific Analysis</p>
              <p className="text-sm font-semibold text-zinc-150">Filtering Red Flags for &quot;{activeLogName}&quot;</p>
            </div>
          </div>
          <Link href="/dashboard/red-flags">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-white/[0.06] hover:bg-white/[0.02] text-zinc-350 font-semibold rounded-lg flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4 text-zinc-450" />
              Clear Filter
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Safety Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-border h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-secondary"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke={overallSafetyScore >= 70 ? "#10b981" : overallSafetyScore >= 50 ? "#eab308" : "#ef4444"}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${overallSafetyScore * 2.2} 220`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                    {overallSafetyScore}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emotional Safety Score</p>
                  <p className={`text-lg font-semibold ${
                    overallSafetyScore >= 70 ? "text-success" :
                    overallSafetyScore >= 50 ? "text-warning" :
                    "text-danger"
                  }`}>
                    {overallSafetyScore >= 70 ? "Generally Safe" :
                     overallSafetyScore >= 50 ? "Some Concerns" :
                     "Needs Attention"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-border h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patterns Detected</p>
                  <p className="text-3xl font-bold">{detectedFlags.length}</p>
                  <p className="text-sm text-red-400">Require attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-border h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Healthy Patterns</p>
                  <p className="text-3xl font-bold">{safePatterns.length}</p>
                  <p className="text-sm text-emerald-400">Looking good</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Toxicity Meter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Toxicity Meter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-success via-warning to-danger"
                style={{ width: "100%" }}
              />
              <motion.div
                initial={{ left: "0%" }}
                animate={{ left: `${100 - overallSafetyScore}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-foreground"
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Safe</span>
              <span>Moderate</span>
              <span>Toxic</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detected Patterns */}
      {detectedFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-3 mb-2 select-none">
            <div className="space-y-1 text-left">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
                Detected Red Flag Patterns
              </h2>
              <p className="text-[11px] text-zinc-500 leading-normal">
                AI has identified patterns that may impact emotional safety in your conversation.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 bg-zinc-950/40 border border-zinc-900 rounded-xl px-3 py-1.5">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Show:</span>
                <span className="text-[9px] font-black text-zinc-200 uppercase tracking-wider">All</span>
              </div>
              <div className="flex items-center gap-0.5 border border-zinc-900 rounded-xl p-0.5 bg-zinc-950/40">
                <div className="w-7 h-7 bg-indigo-600/90 rounded-lg flex items-center justify-center text-white shadow-lg">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                </div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-650 hover:text-zinc-400 cursor-not-allowed">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout of Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detectedFlags.map((pattern, index) => {
              const severity = (pattern.displaySeverity || pattern.severity).toLowerCase();
              const borderClass = 
                severity === "high"
                  ? "border-rose-500/20 hover:border-rose-500/40 shadow-rose-950/5"
                  : severity === "medium"
                  ? "border-amber-500/20 hover:border-amber-500/40 shadow-amber-950/5"
                  : "border-blue-500/20 hover:border-blue-500/40 shadow-blue-950/5";

              const bgClass = 
                severity === "high"
                  ? "bg-[#1c0d15]/90 hover:bg-[#25111c]/95 shadow-[0_4px_30px_rgba(244,63,94,0.03)]"
                  : severity === "medium"
                  ? "bg-[#18110b]/90 hover:bg-[#21170f]/95 shadow-[0_4px_30px_rgba(245,158,11,0.03)]"
                  : "bg-[#0a1122]/90 hover:bg-[#0f1932]/95 shadow-[0_4px_30px_rgba(59,130,246,0.03)]";

              const iconBoxClass =
                severity === "high"
                  ? "bg-rose-500/10 border border-rose-500/20 text-rose-450"
                  : severity === "medium"
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-450"
                  : "bg-blue-500/10 border border-blue-500/20 text-blue-450";

              const badgeClass =
                severity === "high"
                  ? "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                  : severity === "medium"
                  ? "bg-amber-500/10 text-amber-450 border border-amber-500/20"
                  : "bg-blue-500/10 text-blue-450 border border-blue-500/20";

              const impactText =
                severity === "high"
                  ? "text-rose-500"
                  : severity === "medium"
                  ? "text-amber-500"
                  : "text-blue-500";

              const Icon = pattern.icon;

              return (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div
                    className={`border rounded-3xl p-5 relative transition-all duration-300 flex flex-col justify-between min-h-[190px] shadow-xl ${bgClass} ${borderClass}`}
                  >
                    <div>
                      {/* Header Row */}
                      <div className="flex items-center justify-between gap-3 select-none">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBoxClass}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-xs md:text-sm font-bold text-white tracking-wide truncate max-w-[170px]">
                            {pattern.displayName || pattern.name}
                          </h3>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${badgeClass}`}>
                          {pattern.displaySeverity || pattern.severity}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed mt-4 mb-5 font-semibold text-left">
                        {pattern.displayDescription || pattern.description}
                      </p>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-3.5 mt-auto">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-550 select-none">
                          Confidence
                          <span className="text-zinc-200 font-extrabold">{pattern.confidence}%</span>
                          <span title="Statistical confidence rating calculated by LLM model analysis.">
                            <Info className="w-3.5 h-3.5 text-zinc-650 hover:text-zinc-400 transition-colors cursor-help" />
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-550 select-none">
                          Impact
                          <span className={`font-extrabold ${impactText}`}>
                            {severity === "high" ? "High" : severity === "medium" ? "Moderate" : "Positive"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedPattern(selectedPattern === pattern.id ? null : pattern.id)}
                        className="text-[9px] font-black uppercase tracking-wider text-zinc-450 hover:text-white transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0"
                      >
                        View Details <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedPattern === pattern.id ? "rotate-90" : ""}`} />
                      </button>
                    </div>

                    {/* Expanded details list */}
                    {selectedPattern === pattern.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-zinc-900/60 space-y-4"
                      >
                        {pattern.realEvidence && pattern.realEvidence.length > 0 ? (
                          <div className="rounded-2xl p-4 bg-zinc-950/80 border border-zinc-900 text-zinc-300 text-[11px] space-y-3 shadow-inner text-left">
                            <p className="font-extrabold text-rose-450 uppercase tracking-widest text-[8.5px] flex items-center gap-1.5 select-none">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Detected Evidence:
                            </p>
                            <ul className="space-y-3 pl-1">
                              {pattern.realEvidence.map((evidence, i) => {
                                const sourceMatch = evidence.match(/\(from ([^)]+)\)$/)
                                const cleanText = sourceMatch ? evidence.replace(/\s*\(from [^)]+\)$/, "") : evidence

                                return (
                                  <li key={i} className="border-l-2 border-rose-500/40 pl-3 py-0.5">
                                    <p className="text-zinc-200 italic font-medium leading-relaxed">&ldquo;{cleanText}&rdquo;</p>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-[10px] text-zinc-500 italic select-none text-left">No specific text evidence parsed yet.</p>
                        )}

                        {pattern.id === "reassurance_dependency" && (
                          <div className="p-3.5 rounded-2xl border border-zinc-900 bg-zinc-950/80 space-y-2 select-none text-left">
                            <p className="text-[10.5px] font-bold text-zinc-300 flex items-center gap-1.5">
                              <Heart className="w-3.5 h-3.5 text-indigo-400" />
                              Is this a normal expression of vulnerability?
                            </p>
                            <p className="text-[9.5px] text-zinc-500 leading-normal">
                              If you consider this healthy communication rather than reassurance dependency, calibrate the AI to your attachment style.
                            </p>
                          </div>
                        )}

                        <div className="select-none text-left">
                          <p className="text-[10px] font-bold mb-2 text-zinc-300 uppercase tracking-wider">Common Indicators:</p>
                          <ul className="space-y-1 pl-1">
                            {pattern.indicators.map((indicator, i) => (
                              <li key={i} className="text-[10.5px] text-zinc-500 flex items-center gap-1.5">
                                <ChevronRight className="w-3 h-3 text-indigo-500" />
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}

                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* View All Patterns Trigger */}
          {detectedFlags.length > 6 && (
            <div className="flex justify-center mt-6">
              <button className="text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors bg-transparent border-0 cursor-pointer">
                View All Patterns <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Safe Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4 pt-2"
      >
        <div className="space-y-1 text-left select-none">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            No Significant Red Flags Detected
          </h2>
          <p className="text-[11px] text-zinc-500 leading-normal">
            These areas look healthy in your conversation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safePatterns.map((pattern, index) => {
            const getSafePatternIcon = (id: string) => {
              switch (id) {
                case "defensive_behavior": return Shield;
                case "avoidance_pattern": return Eye;
                case "manipulation_pattern": return Brain;
                case "communication_breakdown": return XCircle;
                case "stress_escalation": return Zap;
                case "passive_aggression": return Scale;
                case "reassurance_dependency": return Heart;
                case "conflict_loop": return AlertOctagon;
                case "emotional_withdrawal": return TrendingDown;
                default: return CheckCircle;
              }
            };
            const SafeIcon = getSafePatternIcon(pattern.id);

            return (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
              >
                <div className="bg-zinc-950/40 border border-zinc-900/60 hover:border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3 group transition-all duration-300">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 flex items-center justify-center shrink-0">
                      <SafeIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="text-xs font-bold text-white tracking-wide truncate">{pattern.name}</h3>
                      <p className="text-[10px] text-zinc-500 leading-normal mt-0.5 truncate max-w-[200px] sm:max-w-[320px]">
                        {pattern.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 text-[9px] font-black uppercase tracking-wider">
                      Clear
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-650 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Disclaimer & Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="space-y-6 pt-2"
      >
        <div className="bg-[#0c0a1b]/60 border border-[#1e193c] rounded-3xl p-5 relative overflow-hidden text-left flex items-start gap-4 shadow-xl select-none">
          <div className="w-9 h-9 rounded-xl bg-[#271d47] border border-[#3e2e73]/60 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">Important Disclaimer</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
              This analysis shows <strong>possible indicators</strong> based on communication patterns. AI cannot determine intent or context with certainty. Use these insights as conversation starters, not definitive conclusions. If you&apos;re experiencing genuine concerns about your relationship, consider speaking with a licensed therapist or counselor.
            </p>
          </div>

          {/* Decorative SVG Graphic background */}
          <div className="absolute right-3 bottom-0 opacity-5 pointer-events-none transform translate-y-1">
            <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
              <circle cx="50" cy="30" r="28" stroke="currentColor" strokeWidth="2" className="text-indigo-400" />
              <path d="M50 10 L50 50 M30 30 L70 30" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400" />
            </svg>
          </div>
        </div>

        {/* Footer Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 select-none">
          {[
            { label: "Privacy & Secure", desc: "Your data is encrypted", icon: Shield },
            { label: "AI Powered", desc: "Advanced pattern recognition", icon: Brain },
            { label: "Relationship Insights", desc: "Better understanding", icon: Heart }
          ].map((badge, bIdx) => {
            const BadgeIcon = badge.icon;
            return (
              <div key={bIdx} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3 flex items-center gap-3 transition-colors hover:border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <BadgeIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-zinc-200 leading-tight">{badge.label}</p>
                  <p className="text-[9px] text-zinc-500 leading-none mt-0.5">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
    </PremiumGate>
  )
}

export default function RedFlagsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium tracking-wide animate-pulse">Loading red flags...</p>
      </div>
    }>
      <RedFlagsPageInner />
    </Suspense>
  )
}
