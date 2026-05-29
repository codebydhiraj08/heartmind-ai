"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Heart,
  Smile,
  Shield,
  Flame,
  Brain,
  Scale,
  ThumbsUp,
  Wand2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PremiumGate } from "@/components/premium-gate"

const toneOptions = [
  { id: "mature", name: "Mature", icon: Brain, description: "Thoughtful and composed" },
  { id: "calm", name: "Calm", icon: Scale, description: "Peaceful and understanding" },
  { id: "confident", name: "Confident", icon: Shield, description: "Assertive yet respectful" },
  { id: "emotional", name: "Emotional", icon: Heart, description: "Heartfelt and sincere" },
  { id: "funny", name: "Funny", icon: Smile, description: "Light-hearted and witty" },
  { id: "apology", name: "Apology", icon: ThumbsUp, description: "Genuine and accountable" },
  { id: "conflict", name: "Conflict Resolution", icon: Flame, description: "De-escalating and solutions-focused" }
]

const generatedReplies: Record<string, string[]> = {
  mature: [
    "I appreciate you sharing that with me. I'd like to understand your perspective better - could you help me see where you're coming from?",
    "That's an important point you've raised. Let me take some time to consider it properly before I respond.",
    "I hear what you're saying, and I want to be thoughtful about this. Can we discuss it when we both have the space to really talk?"
  ],
  calm: [
    "I understand this matters a lot to you. Let's take our time to work through this together.",
    "I'm here for you. Whatever you're feeling right now is valid, and I'm listening.",
    "There's no rush. We can figure this out at whatever pace feels right for both of us."
  ],
  confident: [
    "I know where I stand on this, and I'd love to share my thoughts with you openly.",
    "I believe we can find a solution that works for both of us. Here's what I'm thinking...",
    "I'm comfortable with who I am and what I bring to this relationship. Let's build on that."
  ],
  emotional: [
    "You mean so much to me, and I want you to know that every word you say matters deeply.",
    "My heart is full when I think about us. Thank you for being you.",
    "I feel so connected to you right now. These moments are what I cherish most."
  ],
  funny: [
    "If overthinking were an Olympic sport, I'd definitely have gold by now. But seriously, let's talk about this!",
    "Okay, plot twist - what if we both just admit we're awkward and go get ice cream?",
    "My brain said be cool, my heart said be honest, and my mouth said something weird. Classic me."
  ],
  apology: [
    "I'm truly sorry for how I made you feel. That wasn't my intention, but I understand why you're hurt.",
    "I take full responsibility for what happened. You deserved better, and I'm committed to doing better.",
    "I was wrong, and I'm sorry. Your feelings are valid, and I want to make things right."
  ],
  conflict: [
    "I can see we both have strong feelings about this. Can we pause and make sure we're both feeling heard?",
    "I don't want to argue - I want to understand. What would help you feel better about this situation?",
    "Let's step back from who's right or wrong and focus on what we both actually need here."
  ]
}

export default function RepliesPage() {
  const [inputMessage, setInputMessage] = useState("")
  const [selectedTone, setSelectedTone] = useState("mature")
  const [isGenerating, setIsGenerating] = useState(false)
  const [replies, setReplies] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = async (toneOverride?: string | React.MouseEvent | any) => {
    if (!inputMessage.trim()) return
    
    const targetTone = (typeof toneOverride === "string" && toneOverride) ? toneOverride : selectedTone
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: inputMessage,
          tone: targetTone
        })
      })

      const data = await response.json()
      if (data.success && Array.isArray(data.replies)) {
        setReplies(data.replies)
      } else {
        // Fallback to local default replies if response success is false
        setReplies(generatedReplies[targetTone] || generatedReplies.mature)
      }
    } catch (err) {
      console.error("Failed to generate replies dynamically:", err)
      // Fallback
      setReplies(generatedReplies[targetTone] || generatedReplies.mature)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async () => {
    await handleGenerate()
  }

  const copyReply = (index: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <PremiumGate allowedTiers={["pro", "premium"]} featureName="Smart AI Replies">
      <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">Smart AI Replies</h1>
        <p className="text-muted-foreground">Generate contextual, emotionally intelligent responses</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Message Input */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Message to Respond To
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Paste the message you want to respond to...

Example: 'I feel like you never have time for me anymore. It seems like work is always more important.'"
                className="w-full h-40 p-4 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-sm"
              />
            </CardContent>
          </Card>

          {/* Tone Selector */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-accent" />
                Select Response Tone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {toneOptions.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => {
                      setSelectedTone(tone.id)
                      if (replies.length > 0 && inputMessage.trim()) {
                        handleGenerate(tone.id)
                      }
                    }}
                    className={`p-3 rounded-xl text-left transition-all ${
                      selectedTone === tone.id
                        ? "bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary"
                        : "bg-secondary hover:bg-secondary/80 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <tone.icon className={`w-4 h-4 ${selectedTone === tone.id ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium text-sm">{tone.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{tone.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={() => handleGenerate()}
            disabled={!inputMessage.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-primary to-accent text-white py-6 text-lg neon-glow-pink"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Generating Replies...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 w-5 h-5" />
                Generate AI Replies
              </>
            )}
          </Button>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-96 glass rounded-xl border border-border"
              >
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                </div>
                <p className="mt-6 text-lg font-medium">Crafting your replies...</p>
                <p className="text-muted-foreground">Analyzing tone and context</p>
              </motion.div>
            ) : replies.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Generated Replies</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                </div>

                {replies.map((reply, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass border-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <span className="inline-block px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-2">
                              Option {index + 1}
                            </span>
                            <p className="text-sm leading-relaxed">{reply}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyReply(index, reply)}
                            className="flex-shrink-0"
                          >
                            {copiedIndex === index ? (
                              <Check className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                <p className="text-xs text-muted-foreground text-center">
                  Click the copy icon to copy any reply to your clipboard
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-96 glass rounded-xl border border-border"
              >
                <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Your AI replies will appear here</p>
                <p className="text-muted-foreground text-center max-w-xs">
                  Enter a message and select a tone to generate intelligent, contextual responses
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg">Communication Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Be Authentic",
                  description: "Use these replies as inspiration, but add your personal touch to make them genuine."
                },
                {
                  title: "Consider Timing",
                  description: "The best response at the wrong time can feel insincere. Wait for the right moment."
                },
                {
                  title: "Listen First",
                  description: "Before responding, make sure you fully understand what the other person is expressing."
                }
              ].map((tip, index) => (
                <div key={index} className="p-4 rounded-xl bg-secondary/50">
                  <h4 className="font-medium mb-1">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
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
