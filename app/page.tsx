"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import {
  Brain,
  MessageSquareText,
  Shield,
  Heart,
  Sparkles,
  TrendingUp,
  Mic,
  Users,
  Calendar,
  ChevronRight,
  Menu,
  X,
  Check,
  ArrowRight,
  Zap,
  Lock,
  BarChart3,
  AlertTriangle,
  MessageCircle,
  Activity,
  Target,
  Lightbulb,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background animated-gradient relative overflow-x-hidden">
      {/* Ambient Floating Background Glow Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{
            x: [0, 80, -60, 0],
            y: [0, -100, 60, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[10%] left-[15%] w-[450px] h-[450px] bg-[#ea409b]/12 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{
            x: [0, -90, 70, 0],
            y: [0, 80, -90, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] bg-[#04c7f0]/12 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.1, 0.95, 1]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[40%] left-[45%] w-[400px] h-[400px] bg-[#8b5cf6]/10 rounded-full blur-[155px]"
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong"
      >
        <div className="w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                HeartMind <span className="bg-gradient-to-r from-[#ea409b] to-[#04c7f0] bg-clip-text text-transparent">AI</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-zinc-400 hover:text-white text-sm transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-zinc-400 hover:text-white text-sm transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="text-zinc-400 hover:text-white text-sm transition-colors">
                FAQ
              </Link>
              <Link href="/login" className="text-zinc-400 hover:text-white text-sm transition-colors">
                Sign In
              </Link>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-[#9f60f6] to-[#04c7f0] hover:opacity-95 text-white text-xs font-bold rounded-full px-5 py-2.5 flex items-center gap-1.5 shadow-md shadow-purple-500/10 transition-all hover:scale-105 active:scale-95">
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden glass-strong border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="#features" className="block py-2 text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="#pricing" className="block py-2 text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link href="#faq" className="block py-2 text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="w-full justify-start">Sign In</Button>
              </Link>
              <Link href="/dashboard">
                <Button className="w-full bg-gradient-to-r from-primary to-accent">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-4 sm:px-8 lg:px-12 overflow-hidden hero-container z-10">
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-7xl mx-auto relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Hero Left Side: Copy */}
          <div className="lg:col-span-5 text-left flex flex-col items-start">
            <motion.div 
              variants={fadeInUp} 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800/80 mb-6 select-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ea409b] animate-pulse" />
              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">AI Relationship Intelligence</span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp} 
              className="text-4xl sm:text-5xl md:text-[62px] font-extrabold leading-[1.08] tracking-tight mb-6 text-white"
            >
              Understand What <br className="hidden sm:inline" />
              Your <br />
              <span className="bg-gradient-to-r from-[#ea409b] via-[#9f60f6] to-[#04c7f0] bg-clip-text text-transparent">Conversations</span> <br />
              <span className="text-[#04c7f0]">Really Reveal.</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp} 
              className="text-base sm:text-[17px] text-zinc-400 mb-8 max-w-lg leading-relaxed text-pretty"
            >
              AI-powered relationship intelligence that analyzes conversations, uncovers emotional patterns, and helps you understand communication on a deeper level.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/dashboard/analyzer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#ea409b] via-[#9f60f6] to-[#04c7f0] hover:opacity-95 text-white rounded-full font-bold px-8 py-5 h-auto shadow-lg shadow-purple-500/10 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                  Analyze a Conversation
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-800 bg-transparent hover:bg-zinc-900/50 text-white rounded-full font-bold px-8 py-5 h-auto transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-white border-b-[3px] border-b-transparent ml-0.5" />
                  </div>
                  See How It Works
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              variants={fadeInUp} 
              className="mt-6 flex items-center justify-start gap-2 text-zinc-500 text-xs select-none"
            >
              <Check className="w-4 h-4 text-[#ea409b]" />
              <span>Analyze your first conversation free</span>
            </motion.div>
          </div>

          {/* Hero Right Side: High-Fidelity Mockup Dashboard (Refined & Larger) */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end relative pr-0 lg:pr-4">
            <motion.div 
              animate={{
                y: [0, -8, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-full max-w-[650px] aspect-[1.22] rounded-[24px] bg-[#0b0c10]/95 border border-[#161b26] p-6 shadow-2xl select-none"
            >
              {/* Header inside mockup */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-3 bg-indigo-500 rounded-full animate-pulse" />
                    <div className="w-1.5 h-5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-3 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">Conversation Intelligence</span>
                </div>
                
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] text-zinc-400 font-medium">AI analyzing communication patterns...</span>
                </div>
              </div>

              {/* Conversation log */}
              <div className="space-y-4 mb-6">
                {/* Message A */}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="flex items-start gap-3 max-w-[85%]"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shadow-md shadow-indigo-600/20">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-zinc-300">Person A</span>
                      <span className="text-[9px] text-zinc-600">10:24 AM</span>
                    </div>
                    <div className="px-4 py-2 rounded-2xl rounded-tl-none bg-[#121620] border border-[#1d2433] text-xs text-zinc-200">
                      Are you okay? You seem a little distant.
                    </div>
                  </div>
                </motion.div>

                {/* Message B */}
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                  className="flex items-start gap-3 max-w-[85%] ml-auto flex-row-reverse"
                >
                  <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white text-[11px] font-bold shadow-md shadow-pink-600/20">
                    B
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-baseline gap-2 mb-1 justify-end flex-row-reverse">
                      <span className="text-[11px] font-semibold text-zinc-300">Person B</span>
                      <span className="text-[9px] text-zinc-600">10:25 AM</span>
                    </div>
                    <div className="px-4 py-2 rounded-2xl rounded-tr-none bg-[#18121f] border border-[#2b1d38] text-xs text-zinc-200 text-left inline-block">
                      I'm fine, just tired.
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Glowing visualizer line */}
              <div className="relative h-12 flex items-center justify-center mb-6 overflow-hidden select-none">
                <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#04c7f0] to-transparent opacity-25" />
                <svg className="w-full h-8 stroke-[#04c7f0] fill-none opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M 0,5 Q 5,1 10,5 T 20,5 T 30,5 T 40,1 T 50,9 T 60,3 T 70,7 T 80,5 T 90,5 T 100,5" strokeWidth="0.5" className="animate-pulse" />
                  <path d="M 0,5 Q 7,3 15,5 T 30,5 T 45,7 T 60,3 T 75,5 T 90,5 T 100,5" strokeWidth="0.25" strokeDasharray="1 1" />
                </svg>
              </div>

              {/* AI Insight Card (Refined with interactive circular loader and mini trend charts) */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.4 }}
                className="absolute bottom-6 left-6 right-[240px] bg-[#0c0d12]/95 border border-[#1d2331] rounded-2xl p-4 shadow-xl select-none"
              >
                <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold mb-2.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>AI Insight</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-zinc-500 mb-0.5">Emotional tone detected</p>
                    <p className="text-xs font-bold text-white">
                      <span className="text-zinc-400">Calm</span>
                      <span className="mx-1.5 text-zinc-600">→</span>
                      <span className="text-pink-400 font-semibold">Slightly Distant</span>
                    </p>
                  </div>

                  {/* High-tech animated circular chart & mini trend graph */}
                  <div className="flex items-center gap-4">
                    {/* Mini trend chart */}
                    <div className="w-14 h-8 flex items-end gap-[3px] select-none bg-zinc-950/40 p-1 rounded border border-zinc-900/50">
                      <motion.div initial={{ height: 0 }} animate={{ height: '40%' }} transition={{ delay: 1.2, duration: 0.6 }} className="w-[4px] bg-zinc-800 rounded-t" />
                      <motion.div initial={{ height: 0 }} animate={{ height: '60%' }} transition={{ delay: 1.3, duration: 0.6 }} className="w-[4px] bg-zinc-700 rounded-t" />
                      <motion.div initial={{ height: 0 }} animate={{ height: '35%' }} transition={{ delay: 1.4, duration: 0.6 }} className="w-[4px] bg-[#ea409b]/60 rounded-t" />
                      <motion.div initial={{ height: 0 }} animate={{ height: '80%' }} transition={{ delay: 1.5, duration: 0.6 }} className="w-[4px] bg-[#8b5cf6] rounded-t" />
                      <motion.div initial={{ height: 0 }} animate={{ height: '70%' }} transition={{ delay: 1.6, duration: 0.6 }} className="w-[4px] bg-[#04c7f0] rounded-t" />
                    </div>

                    <div className="relative w-11 h-11 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-[#8b5cf6]/10 animate-ping" style={{ animationDuration: '3s' }} />
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.03)" strokeWidth="3" fill="none" />
                        <motion.circle 
                          cx="22" 
                          cy="22" 
                          r="18" 
                          stroke="url(#insightGradient)" 
                          strokeWidth="3" 
                          fill="none" 
                          strokeDasharray="113" 
                          initial={{ strokeDashoffset: 113 }}
                          animate={{ strokeDashoffset: 14.7 }} // 87% progress
                          transition={{ delay: 1.7, duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round" 
                        />
                        <defs>
                          <linearGradient id="insightGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ea409b" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[9px] font-extrabold text-white leading-none">
                        <span>87%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Small tags */}
                <div className="flex flex-wrap items-center gap-1 mt-3">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/30">Communication Shift</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-400 border border-purple-900/30">Emotional Distance</span>
                </div>
              </motion.div>

              {/* Relationship Signals Floating Card (Bottom Right overlap & Floating micro-animation) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, 8, 0]
                }}
                transition={{ 
                  opacity: { delay: 1.8, duration: 0.5 },
                  scale: { delay: 1.8, duration: 0.5 },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.03 }}
                className="absolute bottom-8 -right-4 w-[210px] bg-[#0c0d12]/95 border border-[#1d2331] rounded-2xl p-4 shadow-2xl z-10 select-none backdrop-blur-md transition-shadow hover:shadow-[#ea409b]/5"
              >
                <div className="flex items-center gap-1.5 text-zinc-300 text-[10px] font-bold mb-3.5">
                  <Activity className="w-3 h-3 text-pink-400" />
                  <span>Relationship Signals</span>
                </div>

                <div className="space-y-3">
                  {/* Connection bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-500/10" /> Emotional Connection
                      </span>
                      <span className="font-bold text-white">82%</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "82%" }}
                        transition={{ delay: 2.0, duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-pink-500 rounded-full" 
                      />
                    </div>
                  </div>

                  {/* Balance bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <MessageCircle className="w-2.5 h-2.5 text-purple-400" /> Comm. Balance
                      </span>
                      <span className="font-bold text-white">76%</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "76%" }}
                        transition={{ delay: 2.2, duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-purple-500 rounded-full" 
                      />
                    </div>
                  </div>

                  {/* Positive bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Positive Tone
                      </span>
                      <span className="font-bold text-white">71%</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "71%" }}
                        transition={{ delay: 2.4, duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-cyan-400 rounded-full" 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Centered Horizontal Trust Badges Capsule Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="mt-20 max-w-5xl mx-auto border border-zinc-800/60 bg-zinc-950/40 rounded-2xl py-5 px-8 backdrop-blur-sm select-none"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-zinc-800/60">
            {/* Privacy-first */}
            <div className="flex items-center gap-4 px-4 py-3 md:py-0 justify-center md:justify-start">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 shadow-inner">
                <Shield className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Privacy-first</p>
                <p className="text-[11px] text-zinc-500">Your conversations stay private</p>
              </div>
            </div>

            {/* End-to-end encrypted */}
            <div className="flex items-center gap-4 px-4 md:pl-8 py-3 md:py-0 justify-center md:justify-start">
              <div className="w-11 h-11 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0 text-pink-400 shadow-inner">
                <Lock className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">End-to-end encrypted</p>
                <p className="text-[11px] text-zinc-500">Military-grade data protection</p>
              </div>
            </div>

            {/* AI-powered insights */}
            <div className="flex items-center gap-4 px-4 md:pl-8 py-3 md:py-0 justify-center md:justify-start">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400 shadow-inner">
                <Zap className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">AI-powered insights</p>
                <p className="text-[11px] text-zinc-500">Advanced emotional analysis</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-primary font-medium mb-4">
              POWERFUL FEATURES
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Everything You Need for
              <span className="block gradient-text">Emotional Intelligence</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Advanced AI tools to analyze, understand, and improve your relationships
            </p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: MessageSquareText,
                title: "AI Chat Analyzer",
                description: "Paste any conversation from WhatsApp, Instagram, or text. Get instant emotional analysis, communication quality scores, and relationship insights.",
                gradient: "from-[#ea409b] to-[#04c7f0]"
              },
              {
                icon: Shield,
                title: "Red Flag Detection",
                description: "Identify gaslighting, love bombing, manipulation, and toxic patterns. Get a toxicity meter and emotional safety score.",
                gradient: "from-danger to-warning"
              },
              {
                icon: MessageCircle,
                title: "Smart AI Replies",
                description: "Generate contextual responses in multiple tones: mature, calm, confident, funny, or conflict-resolution focused.",
                gradient: "from-[#04c7f0] to-[#ea409b]"
              },
              {
                icon: Activity,
                title: "Emotional Intelligence",
                description: "Track emotional states like sadness, anxiety, anger, and affection. Visualize your emotional timeline over time.",
                gradient: "from-neon-purple to-primary"
              },
              {
                icon: BarChart3,
                title: "Relationship Dashboard",
                description: "Monitor communication scores, mood analytics, relationship trends, and effort balance in one beautiful dashboard.",
                gradient: "from-success to-accent"
              },
              {
                icon: Target,
                title: "Attachment Analysis",
                description: "Discover your attachment style: secure, anxious, avoidant, or fearful-avoidant. Get personalized improvement tips.",
                gradient: "from-primary to-neon-purple"
              },
              {
                icon: Lightbulb,
                title: "Conflict Resolution AI",
                description: "Analyze arguments and get healthier response suggestions, emotional trigger identification, and calmer alternatives.",
                gradient: "from-warning to-success"
              },
              {
                icon: Mic,
                title: "Voice Emotion Analyzer",
                description: "Upload voice messages to detect stress, hesitation, anger, excitement, and hidden emotional cues.",
                gradient: "from-accent to-[#ea409b]"
              },
              {
                icon: Users,
                title: "Compatibility Analysis",
                description: "Analyze couple compatibility including emotional alignment, communication patterns, and conflict probability.",
                gradient: "from-primary to-danger"
              },
              {
                icon: Clock,
                title: "Timeline Memory",
                description: "Track relationship milestones, emotional changes, communication improvements, and recurring patterns.",
                gradient: "from-[#04c7f0] to-success"
              },
              {
                icon: Heart,
                title: "AI Relationship Coach",
                description: "Daily emotional intelligence tips, healthy relationship guidance, and personalized growth recommendations.",
                gradient: "from-danger to-primary"
              },
              {
                icon: Zap,
                title: "Dating Profile Optimizer",
                description: "Generate better bios, conversation starters, first message ideas, and profile improvement suggestions.",
                gradient: "from-warning to-[#ea409b]"
              }
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.03 }}
                className="group glass rounded-xl p-6 hover:neon-glow-pink transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-primary font-medium mb-4">
              HOW IT WORKS
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Three Simple Steps to
              <span className="block gradient-text">Better Relationships</span>
            </h2>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "01",
                title: "Paste Your Chat",
                description: "Copy any conversation from WhatsApp, Instagram, Telegram, or text messages."
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our advanced AI processes emotional tones, patterns, and communication dynamics."
              },
              {
                step: "03",
                title: "Get Insights",
                description: "Receive detailed reports, red flag alerts, and actionable suggestions."
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                className="relative"
              >
                <div className="glass rounded-xl p-8 text-center h-full">
                  <div className="text-6xl font-bold gradient-text mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-primary font-medium mb-4">
              PRICING
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground text-lg">
              Start free, upgrade when you need more
            </p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {[
              {
                name: "HeartMind Free",
                price: "Free",
                period: "",
                description: "Begin exploring your relationship dynamics and understanding core communication patterns.",
                features: [
                  { text: "1 initial relationship insight session", locked: false },
                  { text: "Basic communication tone detection", locked: false },
                  { text: "Baseline attachment pattern outline", locked: false },
                  { text: "Partial dashboard visibility preview", locked: false },
                  { text: "Voice emotional sentiment decoding", locked: true },
                  { text: "Shared relationship timeline mapping", locked: true },
                  { text: "Live AI coaching & compatibility charts", locked: true }
                ],
                cta: "Get Started",
                popular: false,
                pill: ""
              },
              {
                name: "HeartMind Pro",
                price: "$29",
                period: "MONTH",
                description: "Step into profound clarity. Uncover underlying communication trends, map subtle emotional patterns, and receive naturally aligned AI guidance for everyday connections.",
                features: [
                  { text: "Continuous relationship insight sessions", locked: false },
                  { text: "Sub-surface emotional behavior & pattern detection", locked: false },
                  { text: "Subtle voice sentiment & tone stress decoding", locked: false },
                  { text: "Naturally aligned, empathetic AI communication reframing", locked: false },
                  { text: "Meaningful long-term communication trends & visibility", locked: false }
                ],
                cta: "Start Pro Trial",
                popular: true,
                pill: "COMPLETE EXPERIENCE"
              },
              {
                name: "HeartMind Premium 👑",
                price: "$49",
                period: "MONTH",
                description: "For conscious couples seeking ultimate alignment. Map your shared emotional timeline, engage with your personal AI Relationship Coach, and chart deep relationship dynamics.",
                features: [
                  { text: "Expanded relationship coaching sessions", locked: false },
                  { text: "Live, emotionally intelligent guidance with your AI Relationship Coach", locked: false },
                  { text: "Full relationship picture compatibility & alignment charting", locked: false },
                  { text: "Shared emotional growth timeline & memory logs", locked: false },
                  { text: "Advanced behavioral mapping & interaction style analysis", locked: false },
                  { text: "Expanded long-term relationship insights", locked: false }
                ],
                cta: "Go Premium",
                popular: false,
                pill: "DEEPEST UNDERSTANDING"
              }
            ].map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: plan.popular ? 1.05 : 1.03 }}
                className={`relative glass rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 ${plan.popular ? 'neon-glow-pink border-2 border-primary md:scale-105 z-10' : 'border border-white/[0.04]'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div>
                  {/* Card Header (Matches Dashboard Upgrade Cards) */}
                  <div className="flex items-center justify-between mb-4 text-[9px] font-extrabold uppercase tracking-wider text-zinc-500 select-none">
                    <span>SUBSCRIPTION PLAN</span>
                    {plan.pill && (
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400 font-semibold tracking-normal text-[8.5px] uppercase">
                        {plan.pill}
                      </span>
                    )}
                  </div>

                  <div className="text-left mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6 h-12 overflow-hidden text-pretty">{plan.description}</p>
                    <div className="flex items-baseline gap-1 border-t border-white/[0.04] pt-6 mb-6">
                      <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                      {plan.period && (
                        <span className="text-xs font-semibold text-zinc-500">/ {plan.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.text}
                        className={`flex items-start gap-2.5 text-[11px] leading-relaxed ${feature.locked ? 'text-zinc-600' : 'text-zinc-300'}`}
                      >
                        {feature.locked ? (
                          <Lock className="w-3.5 h-3.5 text-zinc-700 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                        )}
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/dashboard">
                  <Button
                    className={`w-full text-xs font-semibold h-9 rounded-lg transition-transform hover:scale-105 active:scale-95 ${plan.popular ? 'bg-gradient-to-r from-primary to-accent text-white border-none shadow-md shadow-primary/10 hover:opacity-90' : 'bg-transparent hover:bg-white/[0.02] text-white border border-white/[0.08]'}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-primary font-medium mb-4">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {[
              {
                question: "Is my conversation data private and secure?",
                answer: "Absolutely. All conversations are processed with end-to-end encryption and are never stored on our servers after analysis. We take privacy extremely seriously."
              },
              {
                question: "How accurate is the AI analysis?",
                answer: "Our AI has been trained on millions of anonymized conversation patterns and achieves over 90% accuracy in detecting emotional tones and communication patterns. However, we always recommend using insights as guidance, not absolute truth."
              },
              {
                question: "Can HeartMind AI detect if someone is cheating?",
                answer: "We never claim certainty about cheating or infidelity. Our AI can identify possible indicators of avoidant behavior or emotional distance, but we encourage healthy communication over speculation."
              },
              {
                question: "Is this suitable for teenagers?",
                answer: "Yes, HeartMind AI is designed to be teen-safe. We promote healthy communication, emotional awareness, and never provide manipulative or inappropriate advice."
              },
              {
                question: "Can I use this for professional relationships?",
                answer: "While designed primarily for personal relationships, many users find value in analyzing professional communications for emotional tone and communication quality."
              },
              {
                question: "What platforms are supported for chat import?",
                answer: "You can paste conversations from WhatsApp, Instagram, Telegram, Snapchat, iMessage, and any standard text format. We also support voice message analysis."
              }
            ].map((faq) => (
              <motion.div
                key={faq.question}
                variants={fadeInUp}
                whileHover={{ scale: 1.01 }}
                className="glass rounded-xl p-6 cursor-pointer transition-all duration-200"
              >
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-8 md:p-12 text-center neon-glow-pink"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Ready to Understand Your
              <span className="block gradient-text">Relationships Better?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join 500,000+ users who are building healthier, more meaningful connections with HeartMind AI.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white text-lg px-8 py-6 transition-transform hover:scale-105 active:scale-95">
                Start Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">No credit card required. Start analyzing in seconds.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">HeartMind AI</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered relationship intelligence for healthier connections.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#faq" className="hover:text-foreground">FAQ</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
