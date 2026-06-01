"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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
  Brain
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
}

function RedFlagsPageInner() {
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
          
          const updatedPatterns = redFlagPatterns.map(p => {
            const matchedFlag = dbRedFlags.find((f: any) => f.type === p.id);
            if (matchedFlag) {
              return {
                ...p,
                detected: true,
                confidence: typeof matchedFlag.confidence === "number" ? matchedFlag.confidence : 85,
                examples: 1,
                realEvidence: matchedFlag.evidence ? [matchedFlag.evidence] : [matchedFlag.description]
              };
            }
            return {
              ...p,
              detected: false,
              confidence: 0,
              examples: 0,
              realEvidence: []
            };
          });

          setPatterns(updatedPatterns);
          setSafetyScore(analysis.positivityScore ?? analysis.score ?? 100);
        } else {
          setActiveLogName(null);
          setPatterns(redFlagPatterns.map(p => ({
            ...p,
            detected: false,
            confidence: 0,
            examples: 0,
            realEvidence: []
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
      case "high": return "text-danger bg-danger/20 border-danger/30"
      case "medium": return "text-warning bg-warning/20 border-warning/30"
      case "low": return "text-accent bg-accent/20 border-accent/30"
      default: return "text-muted-foreground bg-secondary border-border"
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
          className="p-4 rounded-2xl bg-zinc-950/40 border border-white/[0.04] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4"
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
                      stroke={overallSafetyScore >= 70 ? "oklch(0.7 0.2 150)" : overallSafetyScore >= 50 ? "oklch(0.8 0.15 85)" : "oklch(0.6 0.25 25)"}
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
                <div className="w-14 h-14 rounded-xl bg-danger/20 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-danger" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patterns Detected</p>
                  <p className="text-3xl font-bold">{detectedFlags.length}</p>
                  <p className="text-sm text-danger">Require attention</p>
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
                <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Healthy Patterns</p>
                  <p className="text-3xl font-bold">{safePatterns.length}</p>
                  <p className="text-sm text-success">Looking good</p>
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
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-danger" />
            Detected Patterns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detectedFlags.map((pattern, index) => (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card
                  className={`glass border cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedPattern === pattern.id ? "border-primary neon-glow-pink" : "border-border"
                  }`}
                  onClick={() => setSelectedPattern(selectedPattern === pattern.id ? null : pattern.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSeverityColor(pattern.severity)}`}>
                        <pattern.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{pattern.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(pattern.severity)}`}>
                            {pattern.severity}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Confidence:</span>
                            <span className="font-medium">{pattern.confidence}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Examples:</span>
                            <span className="font-medium">{pattern.examples}</span>
                          </div>
                        </div>

                        {selectedPattern === pattern.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 pt-4 border-t border-border space-y-4"
                          >
                            {pattern.realEvidence && pattern.realEvidence.length > 0 ? (
                              <div className="rounded-lg p-3.5 bg-danger/10 border border-danger/20 text-zinc-200 text-sm space-y-3">
                                <p className="font-semibold text-danger flex items-center gap-1.5">
                                  <AlertTriangle className="w-4 h-4" />
                                  Detected Evidence in Your Uploads:
                                </p>
                                <ul className="space-y-3">
                                  {pattern.realEvidence.map((evidence, i) => {
                                    // Parse standard evidence structure: "sentence (from Source Name)"
                                    const sourceMatch = evidence.match(/\(from ([^)]+)\)$/)
                                    const sourceName = sourceMatch ? sourceMatch[1] : null
                                    const cleanText = sourceMatch ? evidence.replace(/\s*\(from [^)]+\)$/, "") : evidence

                                    return (
                                      <li key={i} className="border-l-2 border-danger/40 pl-3 py-0.5">
                                        <p className="text-zinc-200 italic font-medium leading-relaxed">&ldquo;{cleanText}&rdquo;</p>
                                        {sourceName && (
                                          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mt-1 block">
                                            Source: {sourceName}
                                          </span>
                                        )}
                                      </li>
                                    )
                                  })}
                                </ul>
                              </div>
                            ) : null}

                            <div>
                              <p className="text-sm font-medium mb-2 text-zinc-300">Common Indicators:</p>
                              <ul className="space-y-1">
                                {pattern.indicators.map((indicator, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                    <ChevronRight className="w-3 h-3 text-primary" />
                                    {indicator}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Safe Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success" />
          No Signs Detected
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safePatterns.map((pattern, index) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
            >
              <Card className="glass border-border opacity-75 hover:opacity-100 transition-opacity">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{pattern.name}</h3>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    </div>
                    <span className="text-sm text-success">Clear</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="glass border-border bg-accent/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Important Disclaimer</h4>
                <p className="text-sm text-muted-foreground">
                  This analysis shows <strong>possible indicators</strong> based on communication patterns. AI cannot determine intent or context with certainty. Use these insights as conversation starters, not definitive conclusions. If you&apos;re experiencing genuine concerns about your relationship, consider speaking with a licensed therapist or counselor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
