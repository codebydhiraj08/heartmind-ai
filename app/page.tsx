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
    <div className="min-h-screen bg-background animated-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow-pink">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">HeartMind AI</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white neon-glow-pink">
                  Get Started
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
          <div className="md:hidden glass-strong border-t border-border">
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
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden hero-container">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered Relationship Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
              Understand Your
              <span className="block gradient-text">Relationships Deeper</span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto text-pretty">
              Advanced AI that analyzes conversations, detects emotional patterns, identifies red flags, and helps you build healthier, more meaningful connections.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/dashboard">
                <Button size="lg" className="btn-lg w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white neon-glow-pink">
                  Start Free Analysis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="btn-lg w-full sm:w-auto border-border hover:bg-secondary">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                <span className="text-sm">Privacy-First</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-accent" />
                <span className="text-sm">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm">500K+ Users Trust Us</span>
              </div>
            </div>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="glass rounded-3xl p-8 neon-glow-purple">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Analysis Card */}
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <MessageSquareText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Chat Analysis</p>
                      <p className="font-semibold">Active Session</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Emotional Tone</span>
                      <span className="text-success">Positive 78%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[78%] bg-gradient-to-r from-success to-accent rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Health Score Card */}
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship Health</p>
                      <p className="font-semibold">Strong Bond</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
                        <circle cx="32" cy="32" r="28" stroke="url(#gradient)" strokeWidth="8" fill="none" strokeDasharray="176" strokeDashoffset="35" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="oklch(0.7 0.25 330)" />
                            <stop offset="100%" stopColor="oklch(0.7 0.2 150)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">85</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Communication: A+</p>
                      <p>Trust Level: High</p>
                    </div>
                  </div>
                </div>

                {/* Alert Card */}
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pattern Alert</p>
                      <p className="font-semibold">1 Item Detected</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm text-warning">Possible avoidant pattern detected in recent conversations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquareText,
                title: "AI Chat Analyzer",
                description: "Paste any conversation from WhatsApp, Instagram, or text. Get instant emotional analysis, communication quality scores, and relationship insights.",
                gradient: "from-primary to-accent"
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
                gradient: "from-accent to-neon-cyan"
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
                gradient: "from-accent to-primary"
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
                gradient: "from-neon-cyan to-success"
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
                gradient: "from-warning to-accent"
              }
            ].map((feature) => (
              <div
                key={feature.title}
                className="group glass rounded-xl p-6 hover:neon-glow-pink transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-primary font-medium mb-4">
              HOW IT WORKS
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Three Simple Steps to
              <span className="block gradient-text">Better Relationships</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <div
                key={item.step}
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
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-primary font-medium mb-4">
              PRICING
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground text-lg">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "FREE",
                period: "forever",
                description: "Perfect for trying out HeartMind AI",
                features: [
                  "5 chat analyses per month",
                  "Basic red flag detection",
                  "Simple AI replies",
                  "Email support"
                ],
                cta: "Get Started",
                popular: false
              },
              {
                name: "Pro",
                price: "$29",
                period: "per month",
                description: "For those serious about relationship growth",
                features: [
                  "Unlimited chat analyses",
                  "Advanced red flag detection",
                  "Voice emotion analysis",
                  "Relationship dashboard",
                  "Attachment style analysis",
                  "Priority support"
                ],
                cta: "Start Pro Trial",
                popular: true
              },
              {
                name: "Premium",
                price: "$49",
                period: "per month",
                description: "Complete relationship intelligence suite",
                features: [
                  "Everything in Pro",
                  "Couple compatibility analysis",
                  "AI relationship coach",
                  "Timeline memory system",
                  "Dating profile optimizer",
                  "1-on-1 expert sessions",
                  "API access"
                ],
                cta: "Go Premium",
                popular: false
              }
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative glass rounded-2xl p-8 ${plan.popular ? 'neon-glow-pink border-2 border-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-sm font-medium text-white">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard">
                  <Button
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-accent text-white' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-medium mb-4">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
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
              <div
                key={faq.question}
                className="glass rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8 md:p-12 text-center neon-glow-pink">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Ready to Understand Your
              <span className="block gradient-text">Relationships Better?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join 500,000+ users who are building healthier, more meaningful connections with HeartMind AI.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white text-lg px-8 py-6">
                Start Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">No credit card required. Start analyzing in seconds.</p>
          </div>
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
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              2025 HeartMind AI. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with care for better relationships
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
