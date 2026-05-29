"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Lightbulb,
  MessageSquare,
  ArrowRight,
  Check,
  X,
  RefreshCw,
  Copy,
  Sparkles,
  AlertTriangle,
  Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PremiumGate } from "@/components/premium-gate"

const conflictScenarios = [
  {
    original: "You never listen to me! You always do whatever you want!",
    triggers: ["Absolutist language (never/always)", "Accusatory tone", "Generalizing behavior"],
    alternatives: [
      "I feel unheard when my opinions aren't considered in our decisions.",
      "I'd appreciate if we could discuss things before making choices that affect both of us.",
      "Can we talk about how we make decisions together? I want to feel more included."
    ]
  }
]

const healthyResponses = [
  {
    situation: "When you feel angry",
    unhealthy: "Yelling, name-calling, or giving silent treatment",
    healthy: "\"I need a moment to collect my thoughts. Can we continue this in 10 minutes?\""
  },
  {
    situation: "When you disagree",
    unhealthy: "\"You're wrong and you always are!\"",
    healthy: "\"I see it differently. Can you help me understand your perspective?\""
  },
  {
    situation: "When feeling hurt",
    unhealthy: "\"You don't care about my feelings at all!\"",
    healthy: "\"When you said X, I felt hurt because I interpreted it as Y.\""
  }
]

export default function ConflictPage() {
  const [inputText, setInputText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [triggers, setTriggers] = useState<string[]>([])
  const [alternatives, setAlternatives] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState("")

  const handleAnalyze = async () => {
    if (!inputText.trim()) return
    setIsAnalyzing(true)
    setErrorMsg("")
    try {
      const response = await fetch("/api/conflict-resolution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: inputText })
      });
      const data = await response.json();
      if (data.success && data.result) {
        setTriggers(data.result.triggers || []);
        setAlternatives(data.result.alternatives || []);
        setShowResults(true);
      } else {
        setErrorMsg(data.error || "Failed to analyze the conflict sentence. Please try again.");
      }
    } catch (err) {
      console.error("Conflict analysis failed:", err);
      setErrorMsg("A connection error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const copyText = (index: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <PremiumGate allowedTiers={["pro", "premium"]} featureName="Conflict Resolution AI">
      <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">Conflict Resolution AI</h1>
        <p className="text-muted-foreground">Transform arguments into healthy conversations</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-border h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Enter Conflict Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter something said during a conflict...

Example: 'You never listen to me! You always do whatever you want!'"
                className="w-full h-48 p-4 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-sm"
              />

              {errorMsg && (
                <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isAnalyzing}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-6 neon-glow-pink"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-5 h-5" />
                    Get Healthier Alternatives
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
 
        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {showResults ? (
            <div className="space-y-4">
              {/* Triggers Detected */}
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="w-5 h-5" />
                    Emotional Triggers Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {triggers.map((trigger: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-full bg-warning/20 text-warning text-sm"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
 
              {/* Healthier Alternatives */}
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <Heart className="w-5 h-5" />
                    Healthier Alternatives
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alternatives.map((alt: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-xl bg-success/10 border border-success/30"
                    >
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <p className="flex-1 text-sm">{alt}</p>
                      <button
                        onClick={() => copyText(index, alt)}
                        className="p-2 rounded-lg hover:bg-success/20 transition-colors"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="glass border-border h-full flex items-center justify-center">
              <CardContent className="text-center py-16">
                <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Transform your words</p>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Enter a conflict message to get healthier alternatives and identify emotional triggers
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Communication Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Healthy vs Unhealthy Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthyResponses.map((response, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-secondary/50">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Situation</p>
                    <p className="font-medium">{response.situation}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-danger/10 border border-danger/30">
                    <div className="flex items-center gap-2 mb-1">
                      <X className="w-4 h-4 text-danger" />
                      <span className="text-xs text-danger font-medium">Unhealthy</span>
                    </div>
                    <p className="text-sm">{response.unhealthy}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-xs text-success font-medium">Healthy</span>
                    </div>
                    <p className="text-sm">{response.healthy}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </PremiumGate>
  )
}
