"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Crown,
  Sparkles,
  Zap,
  Activity,
  Heart,
  Shield,
  Mic,
  Users,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Lock
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/use-subscription"
import { sendClientEvent } from "@/lib/analytics"

// Helper to generate screen/browser fingerprint client-side
const getClientDeviceFingerprint = () => {
  if (typeof window === "undefined") return "";
  try {
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const lang = window.navigator.language || "en-US";
    const platform = (window.navigator as any).userAgentData?.platform || window.navigator.platform || "unknown";
    const hardwareConcurrency = window.navigator.hardwareConcurrency || "unknown";
    const deviceMemory = (window.navigator as any).deviceMemory || "unknown";
    return `${screenInfo}|${tz}|${lang}|${platform}|${hardwareConcurrency}|${deviceMemory}`;
  } catch (e) {
    return "fallback-client-fingerprint";
  }
};

export default function PremiumTrialOnboarding() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { subscription, refreshSubscription } = useSubscription()
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Redirect if already used trial or subscription is active
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/signin")
      return
    }
    
    if (subscription) {
      if (subscription.isTrialActive) {
        router.push("/dashboard")
      } else if (subscription.tier !== "free") {
        router.push("/dashboard")
      }
    }
  }, [subscription, sessionStatus, router])

  // Track trial CTA page view
  useEffect(() => {
    if (subscription && !subscription.hasUsedTrial && subscription.tier === "free") {
      sendClientEvent("trial_cta_viewed", { source: "trial_onboarding_page" })
    }
  }, [subscription])

  const handleActivateTrial = async () => {
    setActivating(true)
    setError(null)
    try {
      const fingerprint = getClientDeviceFingerprint()
      const res = await fetch("/api/subscription/start-trial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fingerprint }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to activate your premium trial experience.")
      }

      setSuccess(true)
      await refreshSubscription()
      
      // Short delay for visual feedback before redirecting
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      setActivating(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`)
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`)
  }

  if (sessionStatus === "loading" || !subscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <Loader2 className="w-10 h-10 border-2 text-primary animate-spin" />
        <p className="text-xs text-zinc-500 font-medium tracking-wide">
          Entering exclusive connection preview...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Cinematic Glowing Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-12">
        
        {/* Onboarding Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2"
          >
            <Crown className="w-3.5 h-3.5 text-primary" />
            Limited Trial Experience
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent"
          >
            Refining connection psychology with total visibility
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto"
          >
            Activate your tailored 24-hour premium trial to explore the full depth of AI relationship intelligence, secure conflict analysis, and emotional resonance.
          </motion.p>
        </div>

        {/* Cinematic Previews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "AI Relationship Coach",
              desc: "Deep, emotionally aware reframing dialogue models customized to resolve relationship patterns on demand.",
              icon: Sparkles,
              iconColor: "text-primary",
              snippet: "A gentle reframe suggestion is compiled for late-night logs to help build empathy. Unlock coach dialogue logs.",
              bgGlow: "from-primary/20 to-transparent"
            },
            {
              title: "Voice Emotion Analysis",
              desc: "Acoustic sentiment indicators map tone peaks, pauses, and stress variations to isolate conversational subtext.",
              icon: Mic,
              iconColor: "text-accent",
              snippet: "Subtle vocal strain trends are noted. Unlock audio intelligence timeline metrics.",
              bgGlow: "from-accent/20 to-transparent"
            },
            {
              title: "Compatibility Alignment Chart",
              desc: "Real-time mapping of attachment patterns, conversation volume balance, and emotional resonance thresholds.",
              icon: Users,
              iconColor: "text-emerald-400",
              snippet: "Asymmetrical chat rhythm detected. Unlock full radial compatibility sync maps.",
              bgGlow: "from-emerald-500/20 to-transparent"
            }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 * index }}
              className="relative rounded-2xl border border-white/[0.04] bg-zinc-950/60 p-6 flex flex-col justify-between overflow-hidden group hover:border-white/[0.08] transition-all duration-300 glass-strong"
            >
              {/* Blur Preview Overlay */}
              <div className="hidden md:block absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl rounded-bl-full pointer-events-none opacity-50 blur-xl transition-opacity group-hover:opacity-75" />
              
              <div className="space-y-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center">
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-zinc-100">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>

              {/* Blurred Preview Snippet */}
              <div className="mt-6 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl relative overflow-hidden md:backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 mb-1">
                  <Lock className="w-2.5 h-2.5" />
                  Gated Insight Teaser
                </div>
                <p className="text-[10px] text-zinc-300 italic leading-relaxed filter blur-[1.5px] select-none select-none">
                  {item.snippet}
                </p>
                <div className="absolute inset-0 bg-black/10 md:backdrop-blur-[0.5px] flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-black/60 py-0.5 px-2 rounded border border-white/5">
                    Unlocking on Premium
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Features Comparison & CTA Activation Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="premium-card spotlight-glow rounded-3xl border border-white/[0.05] bg-zinc-950/60 p-6 md:p-10 shadow-2xl relative overflow-hidden glass-strong"
          onMouseMove={handleMouseMove}
        >
          {/* Subtle radial center flare */}
          <div className="absolute top-[-30%] left-[25%] w-[50%] h-[160%] bg-gradient-to-b from-primary/5 via-accent/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Comparisons & Details */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Compare plans side by side</h2>
              
              <div className="space-y-4">
                {[
                  {
                    title: "Monthly Analyses",
                    free: "1 basic analysis per month",
                    trial: "Unlimited analysis during 24h",
                    active: true
                  },
                  {
                    title: "Emotional Mapping",
                    free: "Partial core insights only",
                    trial: "Complete deep emotional suite",
                    active: true
                  },
                  {
                    title: "AI Co-pilot Features",
                    free: "Locked and gated",
                    trial: "AI Coach & Smart Replies open",
                    active: true
                  },
                  {
                    title: "Specialty Analytics",
                    free: "Restricted",
                    trial: "Voice Sentiment & Red Flag detection",
                    active: true
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-white/[0.03] text-xs gap-2"
                  >
                    <span className="font-semibold text-zinc-300 w-1/3">{item.title}</span>
                    <div className="flex flex-1 gap-4 items-center">
                      <span className="text-zinc-500 w-1/2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        {item.free}
                      </span>
                      <span className="text-primary font-bold w-1/2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {item.trial}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Dynamic CTA Card */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl border border-white/[0.06] bg-black/60 p-6 md:p-8 space-y-6 text-center shadow-inner relative overflow-hidden md:backdrop-blur-md">
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">No Credit Card Required</span>
                  <h3 className="text-lg font-bold text-white">Complete Premium Access</h3>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Get exactly 24 hours of unlimited Premium features. Set your own pace, and experience the full depth of relationship intelligence.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-left">
                      <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-rose-400 font-semibold leading-normal">{error}</p>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-emerald-500/15 border border-emerald-500/20 rounded-xl text-center space-y-2"
                      >
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                        <h4 className="text-xs font-bold text-emerald-400">Trial Activated Successfully!</h4>
                        <p className="text-[9px] text-zinc-400">Opening connection dashboard...</p>
                      </motion.div>
                    ) : (
                      <Button
                        onClick={handleActivateTrial}
                        disabled={activating}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white text-xs font-bold h-11 rounded-xl border border-white/5 shadow-lg shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        {activating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            Activating Premium Experience...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-white group-hover:scale-110 transition-transform duration-300" />
                            Explore Full Relationship Intelligence
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                          </>
                        )}
                      </Button>
                    )}
                  </AnimatePresence>

                  <p className="text-[9px] text-zinc-500 font-medium">
                    By clicking above, you activate 24 hours of premium service. Once expired, you seamlessly fallback to the free tier. No commitments.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Supportive Trust Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-[11px] text-zinc-500 font-semibold uppercase tracking-wider text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-zinc-500" />
            Empathetic Data Privacy Guard
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-zinc-800" />
          <div className="flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-zinc-500" />
            Anti-Farming Security Verified
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-zinc-800" />
          <div className="flex items-center gap-2">
            <Heart className="w-4.5 h-4.5 text-zinc-500" />
            Aesthetic Dynamic Experience
          </div>
        </div>

      </div>
    </div>
  )
}
