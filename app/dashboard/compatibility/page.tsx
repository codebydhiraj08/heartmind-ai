"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  Users,
  Heart,
  MessageSquare,
  Zap,
  Brain,
  Target,
  Check,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  MessageSquareText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PremiumGate } from "@/components/premium-gate"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from "recharts"
import Link from "next/link"

export default function CompatibilityPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      setLoading(true);
      setLatestAnalysis(null);
      fetch("/api/latest-analysis?_t=" + Date.now(), { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.analysis) {
            setLatestAnalysis(data.analysis)
          }
        })
        .catch((err) => console.error("Error fetching compatibility metrics:", err))
        .finally(() => setLoading(false))
    } else if (sessionStatus === "unauthenticated") {
      setLoading(false)
    }
  }, [sessionStatus])

  if (loading || sessionStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium tracking-wide animate-pulse">
          Computing your couple compatibility profile...
        </p>
      </div>
    )
  }

  // Handle empty state
  if (!latestAnalysis) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 20 }}
          animate={isMobile ? false : { opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold">Couple Compatibility Analysis</h1>
          <p className="text-muted-foreground">Understand your relationship dynamics and compatibility</p>
        </motion.div>

        <motion.div
          initial={isMobile ? false : { opacity: 0, scale: 0.98 }}
          animate={isMobile ? false : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="premium-card spotlight-glow rounded-3xl border border-white/[0.05] bg-zinc-950/60 p-8 md:p-12 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden glass-strong"
        >
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="hidden md:block absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl relative">
                <Users className="w-9 h-9 text-pink-400" />
                <Sparkles className="w-4.5 h-4.5 text-accent absolute -top-1 -right-1 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            <div className="space-y-2.5 max-w-xl mx-auto">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                Map Your Couple Compatibility Dynamics
              </h2>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                Run a conversation chat log analysis first to unlock comprehensive radar charts, values alignment indicators, and detailed joint communication strengths.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/dashboard/analyzer">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white text-xs font-semibold h-11 px-6 rounded-xl border border-white/5 shadow-md shadow-primary/10 transition-all duration-300 flex items-center justify-center gap-2">
                  <MessageSquareText className="w-4 h-4" />
                  Analyze a conversation first
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Calculate dynamic compatibility metrics from the live database document
  const positivity = latestAnalysis.positivityScore || 70
  const stress = latestAnalysis.stressScore || 30
  const balance = latestAnalysis.communicationBalance || 50
  const style = latestAnalysis.attachmentStyle || "secure"
  const redFlagsCount = latestAnalysis.redFlags?.length || 0

  const overallScore = positivity

  const compatibilityValues = latestAnalysis.compatibility || {
    overallScore: positivity,
    valuesAlignment: Math.max(40, Math.min(98, 100 - stress * 0.15 - redFlagsCount * 4)),
    conflictStyle: Math.max(30, Math.min(95, 100 - stress)),
    intimacy: style === 'secure' ? 92 : style === 'anxious' ? 78 : style === 'avoidant' ? 62 : 55,
    independence: style === 'avoidant' ? 95 : style === 'secure' ? 82 : style === 'anxious' ? 68 : 58
  }

  const valuesAlignment = compatibilityValues.valuesAlignment
  const conflictStyle = compatibilityValues.conflictStyle
  const intimacy = compatibilityValues.intimacy
  const independence = compatibilityValues.independence

  const compatibilityData = [
    { trait: "Communication", person1: balance, person2: Math.max(40, Math.min(95, balance - 5)) },
    { trait: "Emotional", person1: positivity, person2: Math.max(40, Math.min(95, positivity - 4)) },
    { trait: "Values", person1: valuesAlignment, person2: Math.max(40, Math.min(95, valuesAlignment - 2)) },
    { trait: "Conflict Style", person1: conflictStyle, person2: Math.max(30, Math.min(95, conflictStyle - 8)) },
    { trait: "Intimacy", person1: intimacy, person2: Math.max(30, Math.min(95, intimacy - 6)) },
    { trait: "Autonomy", person1: independence, person2: Math.max(30, Math.min(95, independence - 5)) }
  ]

  const compatibilityMetrics = [
    { name: "Emotional Compatibility", score: positivity, icon: Heart, color: "from-primary to-accent" },
    { name: "Communication Match", score: balance, icon: MessageSquare, color: "from-accent to-neon-cyan" },
    { name: "Values Alignment", score: Math.round(valuesAlignment), icon: Target, color: "from-success to-accent" },
    { name: "Conflict Probability", score: stress, icon: Zap, color: "from-warning to-danger", inverse: true },
    { name: "Intimacy Alignment", score: Math.round(intimacy), icon: Sparkles, color: "from-primary to-neon-purple" },
    { name: "Autonomy Balance", score: Math.round(independence), icon: Brain, color: "from-neon-cyan to-primary" }
  ]

  // Dynamically derive strengths and challenges based on database document
  const strengths: string[] = []
  if (positivity >= 70) {
    strengths.push("Strong positive resonance and emotional safety in active dialogue.")
  } else {
    strengths.push("Resilient base with potential for building emotional warmth.")
  }

  if (balance >= 40 && balance <= 60) {
    strengths.push("Exceptional conversational balance and equal verbal engagement.")
  } else {
    strengths.push("Active listening loops are present but invite minor adjustments.")
  }

  if (style === "secure") {
    strengths.push("Secure attachment style matches relationship alignment goals.")
  } else {
    strengths.push("Awareness of emotional patterns provides a foundation for growth.")
  }
  strengths.push("Shared effort to maintain connection benchmarks.")

  const challenges: string[] = []
  if (stress > 50) {
    challenges.push("Elevated tonal stress and defensive conflict loop risk.")
  } else {
    challenges.push("Slight tonal friction during sensitive subject discussions.")
  }

  if (redFlagsCount > 0) {
    challenges.push(`Communication warnings: ${latestAnalysis.redFlags[0].title || "Defensive behavior style"}.`)
  } else {
    challenges.push("Varying structural needs for verbal and emotional expressions.")
  }
  challenges.push("Potential differences in individual boundary-setting pacing.")

  return (
    <PremiumGate allowedTiers={["premium"]} featureName="Couple Compatibility Analysis" fallbackMode="blur">
      <div className="space-y-6 force-gpu">
        {/* Header */}
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 20 }}
          animate={isMobile ? false : { opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold">Couple Compatibility Analysis</h1>
          <p className="text-muted-foreground">Understand your relationship dynamics and compatibility</p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 20 }}
          animate={isMobile ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-border overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6 flex items-center gap-6">
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="none" className="text-secondary" />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="oklch(0.7 0.25 330)"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${overallScore * 3.01} 301`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{overallScore}%</span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      {overallScore >= 75 ? "High Compatibility" : overallScore >= 55 ? "Moderate Alignment" : "Reflective Space Required"}
                    </h2>
                    <p className="text-muted-foreground mb-3">
                      Your relationship shows dynamic database-driven compatibility based on your latest analysis
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      overallScore >= 75 ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                    }`}>
                      {overallScore >= 75 ? "Strong Match" : "Growth Opportunity"}
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-80 h-80 p-4 border-t md:border-t-0 md:border-l border-border flex items-center justify-center overflow-hidden">
                  {isMobile ? (
                    <RadarChart cx="50%" cy="50%" width={280} height={280} outerRadius="55%" margin={{ top: 10, right: 35, bottom: 10, left: 35 }} data={compatibilityData}>
                      <PolarGrid stroke="oklch(0.25 0.02 280)" />
                      <PolarAngleAxis dataKey="trait" tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Partner 1" dataKey="person1" stroke="oklch(0.7 0.25 330)" fill="oklch(0.7 0.25 330)" fillOpacity={0.3} />
                      <Radar name="Partner 2" dataKey="person2" stroke="oklch(0.65 0.2 200)" fill="oklch(0.65 0.2 200)" fillOpacity={0.3} />
                    </RadarChart>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="55%" margin={{ top: 10, right: 35, bottom: 10, left: 35 }} data={compatibilityData}>
                        <PolarGrid stroke="oklch(0.25 0.02 280)" />
                        <PolarAngleAxis dataKey="trait" tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Partner 1" dataKey="person1" stroke="oklch(0.7 0.25 330)" fill="oklch(0.7 0.25 330)" fillOpacity={0.3} />
                        <Radar name="Partner 2" dataKey="person2" stroke="oklch(0.65 0.2 200)" fill="oklch(0.65 0.2 200)" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {compatibilityMetrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={isMobile ? false : { opacity: 0, y: 20 }}
              animate={isMobile ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="glass border-border hover:neon-glow-pink transition-all duration-300">
                <CardContent className="p-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{metric.score}%</span>
                    {metric.inverse && (
                      <span className="text-xs text-success">(Low is good)</span>
                    )}
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
                      <motion.div
                        initial={isMobile ? false : { width: 0 }}
                        animate={isMobile ? false : { width: `${metric.score}%` }}
                        style={isMobile ? { width: `${metric.score}%` } : undefined}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                      />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Strengths & Challenges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={isMobile ? false : { opacity: 0, y: 20 }}
            animate={isMobile ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass border-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <Check className="w-5 h-5" />
                  Relationship Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/30"
                  >
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={isMobile ? false : { opacity: 0, y: 20 }}
            animate={isMobile ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass border-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-5 h-5" />
                  Growth Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {challenges.map((challenge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/30"
                  >
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                    <span className="text-sm">{challenge}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Recommendation */}
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 20 }}
          animate={isMobile ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass border-border bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI Recommendation</h3>
                  <p className="text-muted-foreground">
                    {latestAnalysis.suggestions[0] || "Active listening is key to deeper connections. Try reflecting back what your partner says before responding."}
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
