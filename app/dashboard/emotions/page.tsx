"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  Heart,
  Activity,
  TrendingUp,
  TrendingDown,
  Brain,
  Frown,
  Angry,
  Smile,
  Meh,
  AlertCircle,
  Zap,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MessageSquareText,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PremiumGate } from "@/components/premium-gate"
import {
  LineChart,
  Line,
  XAxis as OriginalXAxis,
  YAxis as OriginalYAxis,
  CartesianGrid,
  Tooltip as OriginalTooltip,
  ResponsiveContainer,
  AreaChart,
  Area as OriginalArea
} from "recharts"

const XAxis = OriginalXAxis as any;
const YAxis = OriginalYAxis as any;
const Tooltip = OriginalTooltip as any;
const Area = OriginalArea as any;

import Link from "next/link"

const attachmentStyles = [
  { id: "secure", name: "Secure Attachment", color: "from-success to-accent", icon: Heart },
  { id: "anxious", name: "Anxious Attachment", color: "from-warning to-primary", icon: AlertCircle },
  { id: "avoidant", name: "Avoidant Attachment", color: "from-accent to-neon-cyan", icon: Brain },
  { id: "fearful", name: "Fearful-Avoidant", color: "from-danger to-warning", icon: Frown }
]

export default function EmotionsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [analyses, setAnalyses] = useState<any[]>([])
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null)
  const [loadingAnalyses, setLoadingAnalyses] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week")
  const [selectedEmotion, setSelectedEmotion] = useState<string>("Joy")
  const [chartWidth, setChartWidth] = useState(320)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setChartWidth(Math.min(window.innerWidth - 64, 700))
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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
        .catch((err) => console.error("Error fetching emotions data:", err))
        .finally(() => setLoadingAnalyses(false));
    } else if (sessionStatus === "unauthenticated") {
      setLoadingAnalyses(false)
    }
  }, [sessionStatus])

  if (loadingAnalyses || sessionStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium tracking-wide animate-pulse">
          Opening emotional workspace...
        </p>
      </div>
    )
  }

  // Handle empty state
  if (!latestAnalysis) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={isMobile ? undefined : { opacity: 0, y: 20 }}
          animate={isMobile ? undefined : { opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold">Emotional Intelligence</h1>
          <p className="text-muted-foreground">Track and understand your emotional patterns</p>
        </motion.div>

        <motion.div
          initial={isMobile ? undefined : { opacity: 0, scale: 0.98 }}
          animate={isMobile ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="premium-card spotlight-glow rounded-3xl border border-white/[0.05] bg-zinc-950/60 p-8 md:p-12 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden glass-strong"
          onMouseMove={(e: any) => {
            if (window.innerWidth < 768) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
            e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
          }}
        >
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="hidden md:block absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl relative">
                <Brain className="w-9 h-9 text-primary" />
                <Sparkles className="w-4.5 h-4.5 text-accent absolute -top-1 -right-1 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            <div className="space-y-2.5 max-w-xl mx-auto">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                Map your shared emotional synchronization
              </h2>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                Unlock daily emotional tracking, weekly timelines, and empathic resonance indicators. Step into high emotional clarity by uploading and analyzing your first conversation chat log.
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

  // Calculate dynamic emotional stats based on the latest saved MongoDB analysis
  const positivity = latestAnalysis?.positivityScore ?? 70
  const redFlagsCount = latestAnalysis?.redFlags?.length ?? 0

  const prevAnalysis = analyses[1]
  const prevPositivity = prevAnalysis?.analysisResult?.positivityScore ?? prevAnalysis?.score ?? positivity
  const prevRedFlagsCount = prevAnalysis?.analysisResult?.redFlags?.length ?? redFlagsCount

  const calculateEmotions = (pos: number, rFlags: number) => {
    return {
      joy: Math.round(pos),
      sadness: Math.max(5, Math.min(95, Math.round((100 - pos) * 0.4))),
      anxiety: Math.max(5, Math.min(95, Math.round((100 - pos) * 0.3 + rFlags * 6))),
      anger: Math.max(2, Math.min(90, Math.round(rFlags * 8 + (100 - pos) * 0.15))),
      confusion: Math.max(5, Math.min(90, Math.round((100 - pos) * 0.25))),
      stress: Math.max(5, Math.min(95, Math.round((100 - pos) * 0.5 + rFlags * 4)))
    }
  }

  const currentEmotions = latestAnalysis?.emotions || calculateEmotions(positivity, redFlagsCount)
  const prevEmotions = calculateEmotions(prevPositivity, prevRedFlagsCount)

  const getTrendAndChange = (curr: number, prev: number, isNegativeEmotion: boolean = false) => {
    if (analyses.length < 2) {
      return { trend: "stable" as const, change: "New" }
    }
    const diff = curr - prev
    if (diff === 0) return { trend: "stable" as const, change: "0%" }

    // For negative emotions, decrease is a good/up trend, increase is bad/down
    let trend: "up" | "down" | "stable" = "stable"
    if (isNegativeEmotion) {
      trend = diff > 0 ? "down" : "up" // higher negative emotions is bad (down trend in health terms)
    } else {
      trend = diff > 0 ? "up" : "down"
    }

    const prefix = diff > 0 ? `+${diff}%` : `${diff}%`
    return { trend, change: prefix }
  }

  const joyData = getTrendAndChange(currentEmotions.joy, prevEmotions.joy)
  const sadnessData = getTrendAndChange(currentEmotions.sadness, prevEmotions.sadness, true)
  const anxietyData = getTrendAndChange(currentEmotions.anxiety, prevEmotions.anxiety, true)
  const angerData = getTrendAndChange(currentEmotions.anger, prevEmotions.anger, true)
  const confusionData = getTrendAndChange(currentEmotions.confusion, prevEmotions.confusion, true)
  const stressData = getTrendAndChange(currentEmotions.stress, prevEmotions.stress, true)

  const emotionalStates = [
    { name: "Joy", value: currentEmotions.joy, ...joyData, icon: Smile, color: "text-success bg-success/20" },
    { name: "Sadness", value: currentEmotions.sadness, ...sadnessData, icon: Frown, color: "text-accent bg-accent/20" },
    { name: "Anxiety", value: currentEmotions.anxiety, ...anxietyData, icon: AlertCircle, color: "text-warning bg-warning/20" },
    { name: "Anger", value: currentEmotions.anger, ...angerData, icon: Angry, color: "text-danger bg-danger/20" },
    { name: "Confusion", value: currentEmotions.confusion, ...confusionData, icon: Meh, color: "text-neon-purple bg-neon-purple/20" },
    { name: "Stress", value: currentEmotions.stress, ...stressData, icon: Zap, color: "text-warning bg-warning/20" }
  ]

  const emotionConfigs: Record<string, {
    stroke: string;
    fill: string;
    dataKey: string;
  }> = {
    "Joy": { stroke: "oklch(0.7 0.2 150)", fill: "oklch(0.7 0.2 150)", dataKey: "joy" },
    "Sadness": { stroke: "oklch(0.65 0.2 240)", fill: "oklch(0.65 0.2 240)", dataKey: "sadness" },
    "Anxiety": { stroke: "oklch(0.75 0.15 80)", fill: "oklch(0.75 0.15 80)", dataKey: "anxiety" },
    "Anger": { stroke: "oklch(0.6 0.25 25)", fill: "oklch(0.6 0.25 25)", dataKey: "anger" },
    "Confusion": { stroke: "oklch(0.65 0.25 300)", fill: "oklch(0.65 0.25 300)", dataKey: "confusion" },
    "Stress": { stroke: "oklch(0.65 0.2 30)", fill: "oklch(0.65 0.2 30)", dataKey: "stress" }
  };

  const currentConfig = emotionConfigs[selectedEmotion] || emotionConfigs["Joy"];

  // Populate the AreaChart weekly timeline dynamically based on the last 7 real analyses (with baseline filler if < 7)
  const chartTimeline = [...analyses].slice(0, 7).reverse().map((a, index) => {
    const dateObj = new Date(a.createdAt)
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" })

    const pos = a.analysisResult?.positivityScore ?? a.score ?? 70
    const rFlags = a.analysisResult?.redFlags?.length ?? 0
    const emotions = calculateEmotions(pos, rFlags)

    return {
      day: dayName,
      joy: emotions.joy,
      sadness: emotions.sadness,
      anxiety: emotions.anxiety,
      anger: emotions.anger,
      confusion: emotions.confusion,
      stress: emotions.stress
    }
  })

  // Add dummy/baseline items if there are less than 7 analyses, so the chart looks fully populated and professional
  if (chartTimeline.length === 1) {
    chartTimeline.unshift({
      day: "Baseline",
      joy: Math.max(10, Math.min(95, chartTimeline[0].joy - 8)),
      sadness: Math.max(10, Math.min(95, chartTimeline[0].sadness + 5)),
      anxiety: Math.max(10, Math.min(95, chartTimeline[0].anxiety + 6)),
      anger: Math.max(10, Math.min(95, chartTimeline[0].anger + 3)),
      confusion: Math.max(10, Math.min(95, chartTimeline[0].confusion + 4)),
      stress: Math.max(10, Math.min(95, chartTimeline[0].stress + 4))
    })
  }

  // Dynamically compute burnout risk scores based on the stress and red flags of latest analysis
  const burnoutIndicators = [
    { label: "Emotional Exhaustion", value: Math.max(10, Math.min(95, Math.round((100 - positivity) * 0.4 + redFlagsCount * 5))), risk: positivity > 75 ? "low" : positivity > 50 ? "medium" : "high" },
    { label: "Communication Fatigue", value: Math.max(10, Math.min(95, Math.round((100 - positivity) * 0.3 + redFlagsCount * 4))), risk: positivity > 75 ? "low" : positivity > 55 ? "medium" : "high" },
    { label: "Empathy Depletion", value: Math.max(5, Math.min(90, Math.round((100 - positivity) * 0.2 + redFlagsCount * 2))), risk: positivity > 80 ? "low" : positivity > 60 ? "medium" : "high" },
    { label: "Conflict Avoidance", value: Math.max(10, Math.min(95, Math.round((100 - positivity) * 0.5 + redFlagsCount * 6))), risk: positivity > 70 ? "low" : positivity > 45 ? "medium" : "high" }
  ]

  const overallRisk = positivity >= 75 ? "Healthy" : positivity >= 50 ? "Moderate" : "Elevated Risk"
  const overallText = positivity >= 75
    ? "Your emotional resilience is strong. Keep maintaining healthy boundaries."
    : positivity >= 50
    ? "Moderate stress detected. Focus on active replenishment and balanced checking in."
    : "Elevated relational fatigue indicated. Consider prioritizing supportive dialogue and emotional de-escalation."

  // Dynamic weekly insights descriptions
  const joyDiff = prevAnalysis ? (currentEmotions.joy - prevEmotions.joy) : 15
  const anxietyDiff = prevAnalysis ? (prevEmotions.anxiety - currentEmotions.anxiety) : 10

  const weeklyInsights = [
    {
      title: "Positive Trend",
      icon: TrendingUp,
      color: "from-success/10 to-success/5 border-success/20",
      iconColor: "text-success",
      desc: joyDiff >= 0
        ? `Your joy levels have increased by ${joyDiff}% compared to your previous baseline.`
        : `Your joy levels decreased slightly by ${Math.abs(joyDiff)}% compared to your previous baseline.`
    },
    {
      title: "Reduced Anxiety",
      icon: TrendingDown,
      color: "from-accent/10 to-accent/5 border-accent/20",
      iconColor: "text-accent",
      desc: anxietyDiff >= 0
        ? `Anxiety indicators have dropped by ${anxietyDiff}%, showing positive emotional boundary support.`
        : `Anxiety indicators rose by ${Math.abs(anxietyDiff)}%. Try practicing gentle alignment reframing.`
    },
    {
      title: "Strong Connection",
      icon: Brain,
      color: "from-primary/10 to-primary/5 border-primary/20",
      iconColor: "text-primary",
      desc: positivity >= 75
        ? "Excellent emotional resonance and empathic connection detected in active conversation logs."
        : "Moderate synchrony. Focus on active listening exercises to deepen emotional closeness."
    }
  ]

  // Helper to extract dynamic and human-friendly time/date from the actual analysis creation timestamp
  const getFormattedEventTime = (dateString?: string, defaultDaysAgo?: number) => {
    if (!dateString) {
      const fallbackDate = new Date();
      if (defaultDaysAgo) {
        fallbackDate.setDate(fallbackDate.getDate() - defaultDaysAgo);
      }
      return {
        date: defaultDaysAgo === 0 ? "Today" : defaultDaysAgo === 1 ? "Yesterday" : fallbackDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: defaultDaysAgo === 0 ? "Just now" : "8:45 PM"
      };
    }
    
    const d = new Date(dateString);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return { date: "Today", time: timeStr };
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return { date: "Yesterday", time: timeStr };
    }
    
    return { date: dateStr, time: timeStr };
  };

  const latestTime = getFormattedEventTime(latestAnalysis?.createdAt, 0);
  const prevTime = getFormattedEventTime(prevAnalysis ? prevAnalysis.createdAt : undefined, 1);

  const emotionalEvents = [
    {
      date: latestTime.date,
      time: latestTime.time,
      type: positivity >= 75 ? "positive" : positivity >= 50 ? "neutral" : "warning",
      title: latestAnalysis?.name || "Recent Chat Log",
      description: latestAnalysis?.analysisResult?.relationshipSummary?.split(".")[0] || "Successfully completed chat emotional synchronization."
    },
    {
      date: prevTime.date,
      time: prevTime.time,
      type: prevPositivity >= 75 ? "positive" : prevPositivity >= 50 ? "neutral" : "warning",
      title: prevAnalysis ? (prevAnalysis.name || "Previous Chat Log") : "Affection Expression",
      description: prevAnalysis 
        ? (prevAnalysis.analysisResult?.relationshipSummary?.split(".")[0] || "Successfully synced baseline connection metrics.")
        : "Warmth indicators and mutual responsiveness remain strong overall."
    }
  ];

  return (
    <div className="space-y-6 force-gpu">
      {/* Header */}
      <motion.div
        initial={isMobile ? undefined : { opacity: 0, y: 20 }}
        animate={isMobile ? undefined : { opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Emotional Intelligence</h1>
          <p className="text-muted-foreground">Track and understand your emotional patterns</p>
        </div>
        <div className="flex items-center gap-2">
          {(["week", "month", "year"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? "bg-gradient-to-r from-primary to-accent text-white" : ""}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Emotional State Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {emotionalStates.map((emotion, index) => {
          const isSelected = selectedEmotion === emotion.name;
          const activeStyle = isSelected
            ? (emotion.name === "Joy" ? "border-emerald-500/80 bg-emerald-500/[0.04] shadow-md shadow-emerald-500/10 scale-[1.03] text-emerald-400" :
               emotion.name === "Sadness" ? "border-blue-500/80 bg-blue-500/[0.04] shadow-md shadow-blue-500/10 scale-[1.03] text-blue-400" :
               emotion.name === "Anxiety" ? "border-amber-500/80 bg-amber-500/[0.04] shadow-md shadow-amber-500/10 scale-[1.03] text-amber-400" :
               emotion.name === "Anger" ? "border-rose-500/80 bg-rose-500/[0.04] shadow-md shadow-rose-500/10 scale-[1.03] text-rose-400" :
               emotion.name === "Confusion" ? "border-fuchsia-500/80 bg-fuchsia-500/[0.04] shadow-md shadow-fuchsia-500/10 scale-[1.03] text-fuchsia-400" :
               "border-orange-500/80 bg-orange-500/[0.04] shadow-md shadow-orange-500/10 scale-[1.03] text-orange-400")
            : "border-border hover:bg-white/[0.02] md:hover:scale-[1.01]";

          return (
            <motion.div
              key={emotion.name}
              initial={isMobile ? undefined : { opacity: 0, y: 20 }}
              animate={isMobile ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedEmotion(emotion.name)}
              className="cursor-pointer"
            >
              <Card className={`bg-zinc-950/85 border border-white/[0.06] backdrop-blur-none md:backdrop-blur-md transition-all duration-300 ${activeStyle}`}>
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl ${emotion.color} flex items-center justify-center mb-3`}>
                    <emotion.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold tracking-wide">{emotion.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-black text-zinc-100">{emotion.value}%</span>
                    <span className={`text-xs font-semibold ${
                      emotion.trend === "up" ? "text-success" :
                      emotion.trend === "down" ? "text-danger" :
                      "text-muted-foreground"
                    }`}>
                      {emotion.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Emotional Timeline Chart */}
      <motion.div
        initial={isMobile ? undefined : { opacity: 0, y: 20 }}
        animate={isMobile ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass border-border">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Emotional Timeline
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Showing historical progression of <strong className="text-zinc-200">{selectedEmotion}</strong> pattern over your last 7 analyses. Click any card above to switch.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 bg-zinc-950/40 p-1 rounded-xl border border-white/[0.04]">
              {["Joy", "Sadness", "Anxiety", "Anger", "Confusion", "Stress"].map((emo) => {
                const isSelected = selectedEmotion === emo;
                const activeBadge = isSelected
                  ? (emo === "Joy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                     emo === "Sadness" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                     emo === "Anxiety" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                     emo === "Anger" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                     emo === "Confusion" ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" :
                     "bg-orange-500/10 text-orange-400 border-orange-500/20")
                  : "text-zinc-400 border-transparent hover:text-white";

                return (
                  <button
                    key={emo}
                    onClick={() => setSelectedEmotion(emo)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${activeBadge}`}
                  >
                    {emo}
                  </button>
                )
              })}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80 w-full min-h-[250px] flex items-center justify-center overflow-hidden">
              {isMobile ? (
                <AreaChart width={chartWidth} height={240} data={chartTimeline}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(9, 9, 11, 0.95)",
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
                    dataKey={currentConfig.dataKey}
                    stroke={currentConfig.stroke}
                    fill={currentConfig.fill}
                    fillOpacity={0.05}
                    strokeWidth={2.5}
                  />
                </AreaChart>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartTimeline}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(9, 9, 11, 0.95)",
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
                      dataKey={currentConfig.dataKey}
                      stroke={currentConfig.stroke}
                      fill={currentConfig.fill}
                      fillOpacity={0.05}
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Premium Gate blur teasing for advanced emotional indicators */}
      <PremiumGate allowedTiers={["pro", "premium"]} featureName="Emotional Intelligence Dashboard" fallbackMode="blur">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emotional Events */}
            <motion.div
              initial={isMobile ? undefined : { opacity: 0, y: 20 }}
              animate={isMobile ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass border-border h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    Recent Emotional Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emotionalEvents.map((event, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border ${
                          event.type === "positive" ? "bg-success/10 border-success/30" :
                          event.type === "warning" ? "bg-warning/10 border-warning/30" :
                          "bg-secondary border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full ${
                            event.type === "positive" ? "bg-success" :
                            event.type === "warning" ? "bg-warning" :
                            "bg-muted-foreground"
                          }`} />
                          <span className="font-medium text-sm">{event.title}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {event.date} at {event.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Burnout Risk Assessment */}
            <motion.div
              initial={isMobile ? undefined : { opacity: 0, y: 20 }}
              animate={isMobile ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass border-border h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Emotional Burnout Risk
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {burnoutIndicators.map((indicator, index) => (
                    <div key={indicator.label}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">{indicator.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            indicator.risk === "low" ? "bg-success/20 text-success" :
                            indicator.risk === "medium" ? "bg-warning/20 text-warning" :
                            "bg-danger/20 text-danger"
                          }`}>
                            {indicator.risk} risk
                          </span>
                          <span className="text-sm font-medium">{indicator.value}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={isMobile ? undefined : { width: 0 }}
                          animate={isMobile ? undefined : { width: `${indicator.value}%` }}
                          style={isMobile ? { width: `${indicator.value}%` } : undefined}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className={`h-full rounded-full ${
                            indicator.risk === "low" ? "bg-success" :
                            indicator.risk === "medium" ? "bg-warning" :
                            "bg-danger"
                          }`}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 mt-4 border-t border-border">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30">
                      <Heart className="w-8 h-8 text-success" />
                      <div>
                        <p className="font-medium text-success">Overall: {overallRisk}</p>
                        <p className="text-sm text-muted-foreground">
                          {overallText}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Weekly Insights */}
          <motion.div
            initial={isMobile ? undefined : { opacity: 0, y: 20 }}
            animate={isMobile ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle>Weekly Emotional Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {weeklyInsights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-xl bg-gradient-to-br ${insight.color} border`}>
                      <insight.icon className={`w-8 h-8 ${insight.iconColor} mb-3`} />
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PremiumGate>
    </div>
  )
}
