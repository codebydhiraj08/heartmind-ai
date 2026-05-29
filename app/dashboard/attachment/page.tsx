"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  Target,
  Heart,
  Shield,
  AlertTriangle,
  Check,
  ChevronRight,
  Brain,
  Users,
  MessageCircle,
  Sparkles,
  ArrowRight,
  MessageSquareText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PremiumGate } from "@/components/premium-gate"
import Link from "next/link"

const attachmentStyles = [
  {
    id: "secure",
    name: "Secure Attachment",
    description: "Comfortable with intimacy and independence. Trusts others and feels worthy of love.",
    color: "from-success to-accent",
    icon: Heart,
    traits: [
      "Comfortable with closeness",
      "Trusts partners easily",
      "Communicates needs clearly",
      "Handles conflict well"
    ],
    percentage: 35
  },
  {
    id: "anxious",
    name: "Anxious Attachment",
    description: "Craves closeness but fears abandonment. May seek constant reassurance.",
    color: "from-warning to-primary",
    icon: AlertTriangle,
    traits: [
      "Needs frequent reassurance",
      "Fear of abandonment",
      "Highly sensitive to changes",
      "May appear clingy"
    ],
    percentage: 45
  },
  {
    id: "avoidant",
    name: "Avoidant Attachment",
    description: "Values independence highly. May struggle with emotional intimacy.",
    color: "from-accent to-neon-cyan",
    icon: Shield,
    traits: [
      "Values independence",
      "Difficulty with vulnerability",
      "May seem emotionally distant",
      "Needs personal space"
    ],
    percentage: 15
  },
  {
    id: "fearful",
    name: "Fearful-Avoidant",
    description: "Desires closeness but fears getting hurt. Mixed feelings about intimacy.",
    color: "from-danger to-warning",
    icon: Brain,
    traits: [
      "Conflicted about closeness",
      "Trust issues",
      "Emotional volatility",
      "Push-pull behavior"
    ],
    percentage: 5
  }
]

const improvementTips = [
  {
    title: "Practice Secure Communication",
    description: "Express your needs directly without fear. Use \"I feel\" statements."
  },
  {
    title: "Build Self-Awareness",
    description: "Notice when anxiety rises and what triggers it. Journal your patterns."
  },
  {
    title: "Challenge Negative Thoughts",
    description: "Question assumptions about rejection. Look for evidence that contradicts fears."
  },
  {
    title: "Create Healthy Boundaries",
    description: "Balance togetherness with independence. Give yourself and your partner space."
  }
]

export default function AttachmentPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null)
  const [loadingAnalyses, setLoadingAnalyses] = useState(true)

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      setLoadingAnalyses(true);
      setLatestAnalysis(null);
      fetch("/api/latest-analysis?_t=" + Date.now(), { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.analysis) {
            setLatestAnalysis(data.analysis)
          }
        })
        .catch((err) => console.error("Error fetching attachment data:", err))
        .finally(() => setLoadingAnalyses(false))
    } else if (sessionStatus === "unauthenticated") {
      setLoadingAnalyses(false)
    }
  }, [sessionStatus])

  if (loadingAnalyses || sessionStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium tracking-wide animate-pulse">
          Retrieving your connection blueprint...
        </p>
      </div>
    )
  }

  // Handle empty state
  if (!latestAnalysis) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold">Attachment Style Analysis</h1>
          <p className="text-muted-foreground">Understand your attachment patterns and improve connections</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="premium-card spotlight-glow rounded-3xl border border-white/[0.05] bg-zinc-950/60 p-8 md:p-12 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden glass-strong"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
            e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl relative">
                <Target className="w-9 h-9 text-emerald-400" />
                <Sparkles className="w-4.5 h-4.5 text-accent absolute -top-1 -right-1 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            <div className="space-y-2.5 max-w-xl mx-auto">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                Unveil Your Relational Attachment Blueprint
              </h2>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                Attachment styles are not static; they are live blueprints of how you seek closeness and hold independence. Step into deep relationship alignment by running your first chat conversation analysis.
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

  // Calculate dynamic primary attachment style strictly from latest saved MongoDB document
  const computedStyleId = latestAnalysis.attachmentStyle || "secure"
  const computedPercentage = latestAnalysis.positivityScore || 80

  const remaining = 100 - computedPercentage

  const attachmentBreakdown = latestAnalysis.attachmentBreakdown || (() => {
    let secure = 0, anxious = 0, avoidant = 0, fearful = 0;
    if (computedStyleId === "secure") {
      secure = computedPercentage
      anxious = Math.round(remaining * 0.5)
      avoidant = Math.round(remaining * 0.35)
      fearful = remaining - anxious - avoidant
    } else if (computedStyleId === "anxious") {
      anxious = computedPercentage
      secure = Math.round(remaining * 0.3)
      avoidant = Math.round(remaining * 0.5)
      fearful = remaining - secure - avoidant
    } else if (computedStyleId === "avoidant") {
      avoidant = computedPercentage
      secure = Math.round(remaining * 0.35)
      anxious = Math.round(remaining * 0.45)
      fearful = remaining - secure - anxious
    } else {
      fearful = computedPercentage
      secure = Math.round(remaining * 0.2)
      anxious = Math.round(remaining * 0.5)
      avoidant = remaining - secure - anxious
    }
    return { secure, anxious, avoidant, fearful };
  })()

  const dynamicStyles = attachmentStyles.map((style) => {
    let percentage = 0
    if (style.id === "secure") percentage = attachmentBreakdown.secure
    else if (style.id === "anxious") percentage = attachmentBreakdown.anxious
    else if (style.id === "avoidant") percentage = attachmentBreakdown.avoidant
    else if (style.id === "fearful") percentage = attachmentBreakdown.fearful

    return {
      ...style,
      percentage
    }
  })

  const primaryStyle = dynamicStyles.find((s) => s.id === computedStyleId) || dynamicStyles[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">Attachment Style Analysis</h1>
        <p className="text-muted-foreground">Understand your attachment patterns and improve connections</p>
      </motion.div>

      {/* Primary Style Result */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`glass border-2 border-primary neon-glow-pink`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${primaryStyle.color} flex items-center justify-center flex-shrink-0`}>
                <primaryStyle.icon className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{primaryStyle.name}</h2>
                  <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                    {primaryStyle.percentage}% Match
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">{primaryStyle.description}</p>
                <div className="flex flex-wrap gap-2">
                  {primaryStyle.traits.map((trait) => (
                    <span key={trait} className="px-3 py-1 rounded-full bg-secondary text-sm">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Premium wall for deeper analysis breakdown and recommendations */}
      <PremiumGate allowedTiers={["pro", "premium"]} featureName="Attachment Style Analysis" fallbackMode="blur">
        <div className="space-y-6">
          {/* All Attachment Styles Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Attachment Style Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dynamicStyles.map((style, index) => (
                  <div key={style.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${style.color} flex items-center justify-center`}>
                          <style.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium">{style.name}</span>
                      </div>
                      <span className="font-bold">{style.percentage}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${style.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${style.color}`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Improvement Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {improvementTips.map((tip, index) => (
                    <motion.div
                      key={tip.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">{tip.title}</h4>
                          <p className="text-sm text-muted-foreground">{tip.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Learn More */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass border-border bg-gradient-to-r from-primary/10 to-accent/10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Understanding Attachment Theory</h3>
                    <p className="text-muted-foreground text-sm">
                      Attachment styles are formed in early childhood but can evolve with awareness and practice. Moving toward secure attachment is possible through self-work and healthy relationships.
                    </p>
                  </div>
                  <Button variant="outline" className="flex-shrink-0">
                    Learn More
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PremiumGate>
    </div>
  )
}
