"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  MessageSquareText,
  Upload,
  Sparkles,
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MessageCircle,
  Activity,
  BarChart3,
  Copy,
  Check,
  ArrowRight,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSubscription } from "@/hooks/use-subscription"
import {
  PieChart,
  Pie as OriginalPie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis as OriginalXAxis,
  YAxis as OriginalYAxis,
  Tooltip as OriginalTooltip
} from "recharts"

const Pie = OriginalPie as any;
const XAxis = OriginalXAxis as any;
const YAxis = OriginalYAxis as any;
const Tooltip = OriginalTooltip as any;

const platformOptions = [
  { name: "WhatsApp", color: "bg-green-500" },
  { name: "Instagram", color: "bg-pink-500" },
  { name: "Telegram", color: "bg-blue-500" },
  { name: "Snapchat", color: "bg-yellow-500" },
  { name: "iMessage", color: "bg-blue-400" },
  { name: "Other", color: "bg-gray-500" }
]

const getGradeLabel = (score: number) => {
  if (score >= 90) return "Excellent Resonance";
  if (score >= 80) return "Healthy Flow";
  if (score >= 70) return "Good Dynamics";
  if (score >= 60) return "Steady Flow";
  return "Reflective Space";
};

const getGradeLetter = (score: number) => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
};

const autodetectPlatform = (text: string): string => {
  const sample = text.slice(0, 15000);
  
  if (/\[\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}[,\s]/.test(sample) || /\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}[,\s]\d{1,2}:\d{2}/.test(sample)) {
    return "WhatsApp";
  }
  
  if (/,\s*\[\d{1,2}\.\d{1,2}\.\d{2,4}\s+\d{1,2}:\d{2}\]/.test(sample) || /telegram/i.test(sample)) {
    return "Telegram";
  }
  
  if (/snapchat/i.test(sample)) {
    return "Snapchat";
  }
  
  if (/imessage/i.test(sample) || /read\s+at\s+\d{1,2}:\d{2}/i.test(sample)) {
    return "iMessage";
  }

  if (/instagram/i.test(sample)) {
    return "Instagram";
  }

  return "Other";
};

const cleanChatText = (text: string): string => {
  if (!text) return "";
  const lines = text.split(/\r?\n/);
  const cleaned = lines.filter(line => {
    const trimmed = line.trim().toLowerCase();
    
    if (!trimmed) return false;
    
    if (trimmed.includes("messages and calls are end-to-end encrypted")) return false;
    if (trimmed.includes("joined using this group's invite link")) return false;
    if (trimmed.includes("created group")) return false;
    if (trimmed.includes("changed the subject")) return false;
    if (trimmed.includes("changed this group's icon")) return false;
    if (trimmed.includes("changed their phone number")) return false;
    if (trimmed.includes("security code changed")) return false;
    if (trimmed.includes("this message was deleted")) return false;
    if (trimmed.includes("you deleted this message")) return false;
    
    if (trimmed.includes("<media omitted>")) return false;
    if (trimmed.includes("[media omitted]")) return false;
    if (trimmed.includes("image omitted")) return false;
    if (trimmed.includes("video omitted")) return false;
    if (trimmed.includes("sticker omitted")) return false;
    if (trimmed.includes("audio omitted")) return false;
    if (trimmed.includes("file omitted")) return false;
    if (trimmed.includes("gif omitted")) return false;
    
    return true;
  });
  return cleaned.join("\n");
};

const sampleChatTextClient = (chatText: string, maxMessages = 1000): { text: string; totalMessages: number; isSampled: boolean } => {
  if (!chatText) return { text: "", totalMessages: 0, isSampled: false };
  const lines = chatText.split(/\r?\n/);
  
  const bracketedTimestampRegex = /^\[[^\]]{5,50}\]\s*[-:]?\s*/;
  const unbracketedTimestampRegex = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}[,\s]\s?\d{1,2}:\d{2}(?::\d{2})?\s?[APap]?[Mm]?\s*[-:]?\s*/;
  const simpleLineRegex = /^([^:]+):\s*(.*)$/;

  let messageCount = 0;
  let splitIndex = 0;
  let totalParsedMessages = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    let cleanLine = trimmed;
    let isMessageStart = false;
    if (bracketedTimestampRegex.test(cleanLine) || unbracketedTimestampRegex.test(cleanLine)) {
      isMessageStart = true;
    } else {
      const matchSimple = cleanLine.match(simpleLineRegex);
      if (matchSimple) {
        const sender = matchSimple[1].trim();
        if (sender && sender.length < 50 && !sender.startsWith("[") && !sender.endsWith("]")) {
          isMessageStart = true;
        }
      }
    }
    if (isMessageStart) {
      totalParsedMessages++;
    }
  }

  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    let cleanLine = trimmed;
    let isMessageStart = false;

    if (bracketedTimestampRegex.test(cleanLine)) {
      cleanLine = cleanLine.replace(bracketedTimestampRegex, "");
      isMessageStart = true;
    } else if (unbracketedTimestampRegex.test(cleanLine)) {
      cleanLine = cleanLine.replace(unbracketedTimestampRegex, "");
      isMessageStart = true;
    } else {
      const matchSimple = cleanLine.match(simpleLineRegex);
      if (matchSimple) {
        const sender = matchSimple[1].trim();
        if (sender && sender.length < 50 && !sender.startsWith("[") && !sender.endsWith("]")) {
          isMessageStart = true;
        }
      }
    }

    if (isMessageStart) {
      messageCount++;
      if (messageCount >= maxMessages) {
        splitIndex = i;
        break;
      }
    }
  }

  if (totalParsedMessages > maxMessages && splitIndex > 0) {
    return {
      text: lines.slice(splitIndex).join("\n"),
      totalMessages: totalParsedMessages,
      isSampled: true
    };
  }
  
  return {
    text: chatText,
    totalMessages: totalParsedMessages || lines.length,
    isSampled: false
  };
};

function ChatAnalyzerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const historyId = searchParams.get("id")
  const { subscription } = useSubscription()
  const activeTier = subscription?.tier || "free"

  const [chatText, setChatText] = useState("")
  const [isExtractingScreenshot, setIsExtractingScreenshot] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("WhatsApp")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [copiedInsight, setCopiedInsight] = useState<number | null>(null)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [pastAnalyses, setPastAnalyses] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"new" | "history">("new")
  const [notification, setNotification] = useState<{
    type: "info" | "success" | "warning";
    message: string;
    description?: string;
  } | null>(null)
  const [showMobileGuide, setShowMobileGuide] = useState(false)
  const [showAllPatterns, setShowAllPatterns] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setNotification(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      if (!rawText || !rawText.trim()) {
        setErrorMsg("The uploaded file is empty. Please select a valid chat export.");
        return;
      }

      const detected = autodetectPlatform(rawText);
      setSelectedPlatform(detected);
      const cleaned = cleanChatText(rawText);
      const sampled = sampleChatTextClient(cleaned, 1000);
      setChatText(sampled.text);

      if (sampled.isSampled) {
        setNotification({
          type: "success",
          message: `Successfully loaded ${detected} chat export!`,
          description: `Detected platform: ${detected}. We identified ${sampled.totalMessages} messages and automatically optimized the analysis to focus on the most recent 1,000 messages for maximum accuracy and speed.`
        });
      } else {
        setNotification({
          type: "success",
          message: `Successfully loaded ${detected} chat export!`,
          description: `Detected platform: ${detected}. Loaded all ${sampled.totalMessages} messages cleanly, removing system noise/media placeholders.`
        });
      }
    };

    reader.onerror = () => {
      setErrorMsg("Failed to read the file. Please try again.");
    };

    reader.readAsText(file);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorMsg("");
    setNotification(null);
    setIsExtractingScreenshot(true);

    const readAndTranscribeFile = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64Data = event.target?.result as string;
          if (!base64Data) {
            reject(new Error(`Failed to read the image file: ${file.name}`));
            return;
          }

          try {
            const response = await fetch("/api/analyze-image", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ imageBase64: base64Data }),
            });

            const data = await response.json();
            if (data.success && data.text) {
              resolve(data.text.trim());
            } else {
              reject(new Error(data.error || `Failed to extract text from ${file.name}`));
            }
          } catch (err: any) {
            reject(new Error(`Connection error while transcribing ${file.name}`));
          }
        };

        reader.onerror = () => {
          reject(new Error(`Failed to read the image file: ${file.name}`));
        };

        reader.readAsDataURL(file);
      });
    };

    try {
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const transcribedTexts: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (i > 0) {
          // Add a 1.5s delay to keep free tier API requests spaced out
          await sleep(1500);
        }
        const text = await readAndTranscribeFile(files[i]);
        transcribedTexts.push(text);
      }

      const combinedText = transcribedTexts.join("\n\n");
      setChatText(prev => prev ? `${prev}\n\n${combinedText}` : combinedText);

      setNotification({
        type: "success",
        message: `Successfully extracted chat text from ${files.length} screenshot(s)!`,
        description: `Our AI model has transcribed all ${files.length} screenshot(s) and combined their text in chronological order. Feel free to review it and click 'Analyze Conversation' to get your report.`
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to extract text from one or more screenshots. Please try pasting the text or uploading a standard export file.");
    } finally {
      setIsExtractingScreenshot(false);
      e.target.value = "";
    }
  };

  // Auto-switch tab based on URL search params
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam === "history") {
      setActiveTab("history")
    }
  }, [searchParams])

  // Load all analysis history logs for the sidebar/list
  const loadHistoryList = () => {
    fetch("/api/analyze-chat?_t=" + Date.now(), { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPastAnalyses(data.analyses || [])
        }
      })
      .catch((err) => console.error("Error loading analysis history:", err))
  }

  // Fetch past analysis if ID is in the URL query parameters, and load history list on mount
  useEffect(() => {
    loadHistoryList()
  }, [])

  useEffect(() => {
    if (historyId) {
      setIsLoadingHistory(true)
      setErrorMsg("")
      fetch(`/api/analyze-chat?id=${historyId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.analysis) {
            setAnalysisData(data.analysis)
            setShowResults(true)
          } else {
            setErrorMsg(data.error || "Failed to load past analysis.")
          }
        })
        .catch((err) => {
          console.error("Error loading past analysis:", err)
          setErrorMsg("Could not load history analysis.")
        })
        .finally(() => {
          setIsLoadingHistory(false)
        })
    } else {
      // Clear results if no id parameter is in the URL
      setShowResults(false)
      setAnalysisData(null)
      setChatText("")
    }
  }, [historyId])

  const resetToNew = () => {
    setChatText("")
    setShowResults(false)
    setAnalysisData(null)
    setErrorMsg("")
    setNotification(null)
    router.push("/dashboard/analyzer")
  }

  const validateChatFormat = (text: string): string | null => {
    const lines = text.trim().split("\n").filter(l => l.trim().length > 0)
    if (lines.length < 4) {
      return "Chat too short. Please paste at least 4-5 messages from a real conversation."
    }

    // Detect sender names using common chat formats
    const senderPattern = /^(?:\[.*?\]\s*)?([^:]{1,50}):\s*.+$/
    const senders = new Set<string>()
    let parsedMessages = 0

    for (const line of lines) {
      const match = line.trim().match(senderPattern)
      if (match) {
        const sender = match[1].trim()
        // Exclude timestamp-only matches and system messages
        if (
          sender.length > 0 &&
          sender.length < 50 &&
          !sender.match(/^\d{1,2}[:\/\-]\d/) &&
          !sender.toLowerCase().includes("messages") &&
          !sender.toLowerCase().includes("system")
        ) {
          senders.add(sender)
          parsedMessages++
        }
      }
    }

    if (parsedMessages < 4) {
      return `Invalid format detected. Please paste a real chat conversation with sender names.\n\nExample format:\n  Rahul: Hey, how are you?\n  Priya: I'm good! What about you?\n  Rahul: Great, let's meet this weekend!\n  Priya: Sounds perfect! 😊`
    }

    if (senders.size < 2) {
      return `Only one sender detected ("${Array.from(senders)[0]}"). A conversation needs at least 2 people. Please paste a real back-and-forth chat between two people.`
    }

    return null // All good!
  }

  const handleAnalyze = async () => {
    if (!chatText.trim()) return
    
    // Validate chat format before sending to AI
    const validationError = validateChatFormat(chatText)
    if (validationError) {
      setErrorMsg(validationError)
      return
    }

    setIsAnalyzing(true)
    setErrorMsg("")
    try {
      const cleanedText = cleanChatText(chatText);
      const sampled = sampleChatTextClient(cleanedText, 1000);
      const optimizedText = sampled.text;

      const response = await fetch("/api/analyze-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: optimizedText,
          name: `${selectedPlatform} Chat`,
          platform: selectedPlatform,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setAnalysisData({
          ...data.analysis,
          _id: data.recordId
        })
        setShowResults(true)
        setErrorMsg("")
        loadHistoryList()
        router.refresh()
      } else {
        setErrorMsg(data.error || "Failed to analyze chat log. Please upgrade or try again.")
      }
    } catch (err: any) {
      console.error("Error analyzing chat:", err)
      setErrorMsg("An unexpected connection error occurred.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyInsight = (index: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedInsight(index)
    setTimeout(() => setCopiedInsight(null), 2000)
  }

  const emotionColors = ["oklch(0.7 0.2 150)", "oklch(0.65 0 0)", "oklch(0.6 0.25 25)"]

  // Strips markdown bold artifacts like **Name from displayed text
  const cleanText = (text: string) => text.replace(/\*\*/g, "")

  const effortScoreVal = analysisData && typeof analysisData.effortScore === "number"
    ? analysisData.effortScore
    : (analysisData ? Math.round(100 - Math.abs(50 - (analysisData.communicationBalance ?? 50)) * 0.8) : 75);

  const dynamicAnalysis = analysisData ? {
    overallScore: analysisData.positivityScore ?? 70,
    emotionalTone: (() => {
      const pos = typeof analysisData.positivityScore === "number" ? Math.round(analysisData.positivityScore) : 70;
      const remaining = 100 - pos;
      const neg = Math.round(remaining * 0.6);
      const neut = remaining - neg;
      return { positive: pos, neutral: neut, negative: neg };
    })(),
    metrics: {
      positivityRatio: typeof analysisData.positivityScore === "number" ? Math.round(analysisData.positivityScore) : 70,
      responseBalance: typeof analysisData.communicationBalance === "number"
        ? analysisData.communicationBalance
        : (String(analysisData.communicationBalance || "").toLowerCase().includes("asymmetry") ? 45 : 85),
      effortScore: effortScoreVal,
      emotionalDepth: (analysisData.positivityScore ?? 70) > 75 ? 85 : (analysisData.positivityScore ?? 70) > 50 ? 70 : 50,
      communicationQuality: Math.round(((analysisData.positivityScore ?? 70) + effortScoreVal) / 2)
    },
    patterns: Array.isArray(analysisData.redFlags) && analysisData.redFlags.length > 0
      ? analysisData.redFlags.map((rf: any) => ({
          type: rf.type && rf.type !== "none" ? "warning" : "neutral",
          title: rf.title || "Communication Signal",
          description: cleanText(rf.description || "")
        }))
      : [
          {
            type: "positive",
            title: "Balanced Dialogue",
            description: "Both partners show highly comparable engagement levels and conversational depth."
          },
          {
            type: "positive",
            title: "Reciprocal Flow",
            description: "A healthy level of mutual responsiveness and emotional validation is observed in recent messages."
          },
          {
            type: "positive",
            title: "Positive Resonance",
            description: "Expressed sentiment indicates mutual support and strong positive reinforcement."
          }
        ],
    insights: [
      ...(analysisData.suggestions || []).map((s: string) => ({
        type: "positive",
        title: "AI Suggestion",
        description: cleanText(s)
      }))
    ],
    responseTime: (analysisData && analysisData.responseTime && analysisData.responseTime.person1Name) ? {
      person1Name: analysisData.responseTime.person1Name,
      person1Timing: analysisData.responseTime.person1Timing,
      person2Name: analysisData.responseTime.person2Name,
      person2Timing: analysisData.responseTime.person2Timing
    } : {
      person1Name: "Sender A",
      person1Timing: Math.round(20 - (effortScoreVal / 5)) + " min avg",
      person2Name: "Sender B",
      person2Timing: Math.round(40 - (effortScoreVal / 4)) + " min avg"
    }
  } : {
    overallScore: 70,
    emotionalTone: { positive: 70, neutral: 20, negative: 10 },
    metrics: { positivityRatio: 70, responseBalance: 50, effortScore: 70, emotionalDepth: 70, communicationQuality: 70 },
    patterns: [],
    insights: [],
    responseTime: { person1Name: "Sender A", person1Timing: "0 min avg", person2Name: "Sender B", person2Timing: "0 min avg" }
  };

  if (isLoadingHistory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <p className="text-xs text-zinc-500 font-medium tracking-wide animate-pulse">
          Retrieving your communication intelligence log...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 force-gpu">
      {/* Header */}
      <motion.div
        initial={isMobile ? false : { opacity: 0, y: 20 }}
        animate={isMobile ? false : { opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {historyId ? "Past Assistive Analysis" : "AI Chat Analyzer"}
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            {historyId 
              ? "Viewing loaded relationship intelligence record from your conversation logs"
              : "Paste a real back-and-forth conversation between 2 people — our AI detects emotional patterns, tone, and connection quality"
            }
          </p>
        </div>
        {historyId && (
          <Button
            onClick={resetToNew}
            variant="outline"
            className="text-xs font-semibold h-9 px-4 rounded-lg border-white/[0.06] hover:bg-white/[0.02] flex items-center gap-1.5 self-start md:self-center"
          >
            ← Back to Analyzer
          </Button>
        )}
      </motion.div>

      {/* Tab Switcher - only show if NOT showing results */}
      {!showResults && (
        <div className="flex bg-zinc-900/40 p-1.5 rounded-xl border border-white/[0.04] max-w-sm relative z-10">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === "new"
                ? "bg-primary text-white shadow-md shadow-primary/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            New Analysis
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === "history"
                ? "bg-primary text-white shadow-md shadow-primary/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            History Logs ({pastAnalyses.length})
          </button>
        </div>
      )}

      {/* Main Body Section */}
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="loading"
            initial={isMobile ? false : { opacity: 0, scale: 0.98 }}
            animate={isMobile ? false : { opacity: 1, scale: 1 }}
            exit={isMobile ? false : { opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-zinc-950/40 border border-white/[0.04] rounded-2xl max-w-2xl mx-auto shadow-xl"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary to-accent opacity-80" />
              <Sparkles className="absolute inset-0 m-auto w-7 h-7 text-white" />
            </div>
            <p className="mt-6 text-lg font-bold text-zinc-200">AI is analyzing your conversation...</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center leading-relaxed">
              Detecting emotional boundaries, supportive pattern scores, response synchrony, and personalized coaching suggestions.
            </p>
          </motion.div>
        ) : showResults ? (
          /* FULL-WIDTH RESULTS REPORT VIEW */
          <motion.div
            key="results"
            initial={isMobile ? false : { opacity: 0, y: 20 }}
            animate={isMobile ? false : { opacity: 1, y: 0 }}
            className="space-y-6 force-gpu"
          >
            {/* Top Row Grid: Score & Emotional Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Score Card */}
              <Card className="glass border-border shadow-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-28 h-28 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-secondary/50"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          stroke="oklch(0.62 0.21 285)"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${dynamicAnalysis.overallScore * 3.01} 301`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black">{dynamicAnalysis.overallScore}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Score</span>
                      </div>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="text-lg font-bold text-zinc-200 mb-1.5 uppercase tracking-wide">Relationship Health Index</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        Based on emotional resonance balance, reciprocity ratios, question frequency, and supportive syntax flags detected in the dialogue flow.
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {getGradeLabel(dynamicAnalysis.overallScore)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emotional Tone Breakdown */}
              <Card className="glass border-border shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    Emotional Tone Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center">
                      <PieChart width={112} height={112}>
                        <Pie
                          data={[
                            { name: "Positive", value: dynamicAnalysis.emotionalTone.positive },
                            { name: "Neutral", value: dynamicAnalysis.emotionalTone.neutral },
                            { name: "Negative", value: dynamicAnalysis.emotionalTone.negative }
                          ]}
                          cx={56}
                          cy={56}
                          innerRadius={32}
                          outerRadius={48}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {emotionColors.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </div>
                    <div className="flex-1 w-full space-y-2.5">
                      {[
                        { label: "Positive Sentiment", value: dynamicAnalysis.emotionalTone.positive, color: "bg-[oklch(0.7_0.2_150)]", textClass: "text-emerald-400" },
                        { label: "Neutral Stance", value: dynamicAnalysis.emotionalTone.neutral, color: "bg-[oklch(0.65_0_0)]", textClass: "text-zinc-400" },
                        { label: "Stress Indicators", value: dynamicAnalysis.emotionalTone.negative, color: "bg-[oklch(0.6_0.25_25)]", textClass: "text-rose-400" }
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                          <span className="text-xs text-zinc-300 flex-1">{item.label}</span>
                          <span className={`text-xs font-bold ${item.textClass}`}>{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Grid Row: Metrics & Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Metrics */}
              <Card className="glass border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent" />
                    Communication Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(dynamicAnalysis.metrics).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-zinc-300 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span className="text-xs font-bold text-zinc-200">{value}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/[0.02]">
                        <motion.div
                          initial={isMobile ? false : { width: 0 }}
                          animate={isMobile ? false : { width: `${value}%` }}
                          style={isMobile ? { width: `${value}%` } : undefined}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full ${
                            value >= 80 ? "bg-gradient-to-r from-emerald-500 to-accent" :
                            value >= 60 ? "bg-gradient-to-r from-amber-500 to-emerald-500" :
                            "bg-gradient-to-r from-rose-500 to-amber-500"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Response Time Analysis */}
              <Card className="glass border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Conversational Effort &amp; Response Timing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/[0.02] text-center">
                      <User className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider truncate">
                        {dynamicAnalysis.responseTime.person1Name}
                      </p>
                      <p className="text-sm font-black text-zinc-200 mt-1.5 leading-snug">
                        {dynamicAnalysis.responseTime.person1Timing}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/[0.02] text-center">
                      <User className="w-6 h-6 mx-auto mb-2 text-accent" />
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider truncate">
                        {dynamicAnalysis.responseTime.person2Name}
                      </p>
                      <p className="text-sm font-black text-zinc-200 mt-1.5 leading-snug">
                        {dynamicAnalysis.responseTime.person2Timing}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-4 text-center italic leading-relaxed">
                    Differences in response intervals are normal. However, significant structural asymmetry can indicate mismatched expectations or scheduling mismatches.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row Grid: Detected Patterns & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Communication Patterns */}
              <Card className="glass border-border shadow-xl">
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Detected Communication Patterns
                    </CardTitle>
                    <p className="text-[10px] text-zinc-500">
                      Behavioral rhythms observed in the uploaded text log
                    </p>
                  </div>
                  {(dynamicAnalysis.patterns && dynamicAnalysis.patterns.length > 1) && (
                    <button
                      onClick={() => setShowAllPatterns(!showAllPatterns)}
                      className="text-[10px] font-extrabold uppercase text-primary hover:text-primary/80 transition-colors border border-primary/20 bg-primary/5 px-2 py-1 rounded-md shrink-0"
                    >
                      {showAllPatterns ? "View Less" : `View All (${dynamicAnalysis.patterns.length})`}
                    </button>
                  )}
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    {(Array.isArray(dynamicAnalysis.patterns) ? dynamicAnalysis.patterns : [])
                      .slice(0, showAllPatterns ? undefined : 1)
                      .map((pattern: any, index: number) => {
                      const isTense = pattern.type === "warning" || pattern.type === "danger";
                      const isPositive = pattern.type === "positive";
                      return (
                        <div
                          key={index}
                          className={`p-3.5 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                            isPositive ? "bg-emerald-500/[0.01] border-emerald-500/10 hover:bg-emerald-500/[0.03]" :
                            isTense ? "bg-rose-500/[0.01] border-rose-500/10 hover:bg-rose-500/[0.03]" :
                            "bg-zinc-900/20 border-white/[0.02] hover:bg-zinc-900/40"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isPositive ? "bg-emerald-500/10 text-emerald-400" :
                              isTense ? "bg-rose-500/10 text-rose-400" :
                              "bg-zinc-800 text-zinc-400"
                            }`}>
                              {isPositive ? <CheckCircle className="w-3.5 h-3.5 text-success" /> :
                               isTense ? <AlertTriangle className="w-3.5 h-3.5 text-warning" /> :
                               <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-zinc-200 mb-1">{pattern.title}</h4>
                              <p className="text-[11px] text-zinc-400 leading-normal">{pattern.description}</p>
                            </div>
                            <button
                              onClick={() => copyInsight(index + 100, `${pattern.title}: ${pattern.description}`)}
                              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0 self-center"
                            >
                              {copiedInsight === index + 100 ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-355" />
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights (Coaching tips & warnings) */}
              <Card className="glass border-border shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AI Relationship Coach Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 space-y-3">
                  {dynamicAnalysis.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-3.5 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                        insight.type === "positive" ? "bg-emerald-500/[0.01] border-emerald-500/10 hover:bg-emerald-500/[0.03]" :
                        insight.type === "warning" ? "bg-amber-500/[0.01] border-amber-500/10 hover:bg-amber-500/[0.03]" :
                        "bg-zinc-900/20 border-white/[0.02] hover:bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          insight.type === "positive" ? "bg-emerald-500/10 text-emerald-400" :
                          insight.type === "warning" ? "bg-amber-500/10 text-amber-400" :
                          "bg-zinc-800 text-zinc-400"
                        }`}>
                          {insight.type === "positive" ? <CheckCircle className="w-3.5 h-3.5 text-success" /> :
                           insight.type === "warning" ? <AlertTriangle className="w-3.5 h-3.5 text-warning" /> :
                           <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-zinc-200 mb-1">{insight.title}</h4>
                          <p className="text-[11px] text-zinc-400 leading-normal">{insight.description}</p>
                        </div>
                        <button
                          onClick={() => copyInsight(index, `${insight.title}: ${insight.description}`)}
                          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0 self-center"
                        >
                          {copiedInsight === index ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-355" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Navigation Button */}
            <motion.div
              initial={isMobile ? false : { opacity: 0, y: 10 }}
              animate={isMobile ? false : { opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row justify-center gap-3 pt-4"
            >
              <Link href={`/dashboard/red-flags?chatId=${analysisData?._id || historyId}`}>
                <Button
                  className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold text-xs h-10 px-6 rounded-xl border border-white/5 shadow-md shadow-rose-500/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4 animate-pulse" />
                  View Red Flag Detection
                </Button>
              </Link>
              <Button
                onClick={() => {
                  router.refresh()
                  router.push("/dashboard")
                }}
                className="bg-zinc-900 border border-white/[0.04] hover:bg-zinc-800 text-zinc-300 font-semibold text-xs h-10 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Return to Dashboard Overview
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          /* WORKSPACE VIEW: TABS */
          <motion.div
            key="workspace"
            initial={isMobile ? false : { opacity: 0 }}
            animate={isMobile ? false : { opacity: 1 }}
            className="w-full"
          >
            {activeTab === "new" ? (
              /* TAB 1: NEW ANALYSIS FORM */
              <motion.div
                initial={isMobile ? false : { opacity: 0, y: 15 }}
                animate={isMobile ? false : { opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto w-full"
              >
                <Card className="glass border-border shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-zinc-200">
                      <MessageSquareText className="w-5 h-5 text-primary" />
                      Paste Your Conversation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Platform Selection */}
                    <div>
                      <label className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-wider">Select Platform</label>
                      <div className="flex flex-wrap gap-2">
                        {platformOptions.map((platform) => (
                          <button
                            key={platform.name}
                            onClick={() => setSelectedPlatform(platform.name)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              selectedPlatform === platform.name
                                ? "bg-primary text-white"
                                : "bg-zinc-900 border border-white/[0.04] text-zinc-400 hover:bg-zinc-800"
                            }`}
                          >
                            {platform.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Area */}
                    <div>
                      <label className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-wider flex justify-between">
                        <span>Conversation Text</span>
                        <span className="text-[10px] text-primary/70 font-semibold lowercase">— 2 senders &amp; at least 4 messages</span>
                      </label>
                      <textarea
                        value={chatText}
                        onChange={(e) => { setChatText(e.target.value); if (errorMsg) setErrorMsg(""); if (notification) setNotification(null); }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file && (file.name.endsWith(".txt") || file.name.endsWith(".json"))) {
                            setErrorMsg("");
                            setNotification(null);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const rawText = event.target?.result as string;
                              if (rawText && rawText.trim()) {
                                const detected = autodetectPlatform(rawText);
                                setSelectedPlatform(detected);
                                const cleaned = cleanChatText(rawText);
                                const sampled = sampleChatTextClient(cleaned, 1000);
                                setChatText(sampled.text);
                                if (sampled.isSampled) {
                                  setNotification({
                                    type: "success",
                                    message: `Successfully dropped and loaded ${detected} chat export!`,
                                    description: `Detected platform: ${detected}. Identified ${sampled.totalMessages} messages and automatically optimized the analysis to focus on the most recent 1,000 messages for maximum accuracy and speed.`
                                  });
                                } else {
                                  setNotification({
                                    type: "success",
                                    message: `Successfully dropped and loaded ${detected} chat export!`,
                                    description: `Detected platform: ${detected}. Loaded all ${sampled.totalMessages} messages cleanly, removing system noise.`
                                  });
                                }
                              }
                            };
                            reader.readAsText(file);
                          } else {
                            setErrorMsg("Invalid file type. Please drop a .txt or .json exported chat file.");
                          }
                        }}
                        placeholder={`Paste or Drop your ${selectedPlatform} export here...\n\nRequirements:\n✓ Real back-and-forth conversation between 2 people\n✓ At least 4-5 messages\n✓ Sender names must be visible\n\nExample format:\nRahul: Hey, how was your day?\nPriya: It was great! I missed you though 😊\nRahul: Aww, I missed you too! When can we meet?\nPriya: This weekend? I'm free Saturday!`}
                        className="w-full h-72 p-4 rounded-xl bg-zinc-950/40 border border-white/[0.05] focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-xs font-mono text-zinc-300 placeholder-zinc-650 transition-all duration-300"
                      />
                    </div>

                    {/* Upload Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Text/JSON file upload */}
                      <div className="relative group">
                        <input
                          type="file"
                          accept=".txt,.json"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="chat-file-upload"
                          disabled={isExtractingScreenshot || isAnalyzing}
                        />
                        <label
                          htmlFor="chat-file-upload"
                          className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-xl border border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 bg-zinc-950/20 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer transition-all duration-300 active:scale-[0.98] select-none"
                        >
                          <Upload className="w-4 h-4 text-zinc-450 group-hover:text-primary transition-colors" />
                          <span>Upload Export (.txt, .json)</span>
                        </label>
                      </div>

                      {/* Screenshot upload */}
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleScreenshotUpload}
                          className="hidden"
                          id="chat-screenshot-upload"
                          disabled={isExtractingScreenshot || isAnalyzing}
                        />
                        <label
                          htmlFor="chat-screenshot-upload"
                          className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-xl border border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 bg-zinc-950/20 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer transition-all duration-300 active:scale-[0.98] select-none"
                        >
                          <Upload className="w-4 h-4 text-zinc-450 group-hover:text-primary transition-colors" />
                          <span>{isExtractingScreenshot ? "Transcribing..." : "Upload Screenshot(s)"}</span>
                        </label>
                      </div>
                    </div>

                    {notification && (
                      <div className="p-4 rounded-xl border border-primary/20 bg-primary/10 text-zinc-200 text-xs font-medium leading-relaxed relative overflow-hidden flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                        <div className="flex-1">
                          <p className="font-extrabold uppercase tracking-widest text-[9px] mb-1 text-primary">Chat Cleaned &amp; Optimized</p>
                          <p className="text-zinc-300 font-semibold">{notification.message}</p>
                          {notification.description && (
                            <p className="text-zinc-400 text-[10px] mt-0.5 leading-normal">{notification.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setNotification(null)}
                          className="text-zinc-400 hover:text-white font-bold text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {errorMsg && (
                      <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-medium leading-relaxed relative overflow-hidden flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-455" />
                        <div className="flex-1">
                          <p className="font-extrabold uppercase tracking-widest text-[9px] mb-1">Analysis Alert</p>
                          <p className="text-zinc-350">{errorMsg}</p>
                          {errorMsg.toLowerCase().includes("upgrade") && (
                            <Link href="/dashboard/upgrade" className="inline-flex items-center gap-1 mt-2.5 text-primary hover:underline font-extrabold text-[9px] uppercase tracking-wide">
                              Upgrade to Premium <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Analyze Button */}
                    <Button
                      onClick={handleAnalyze}
                      disabled={!chatText.trim() || isAnalyzing || isExtractingScreenshot}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white py-6 text-sm font-semibold rounded-xl border border-white/5 shadow-md shadow-primary/10 transition-all duration-300"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Analyzing Conversation...
                        </>
                      ) : isExtractingScreenshot ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 w-4 h-4 animate-pulse" />
                          Analyze Conversation
                        </>
                      )}
                    </Button>

                    <p className="text-[10px] text-zinc-500 text-center">
                      Your conversation is processed securely and analyzed live. Under no circumstances is raw text shared publicly.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* TAB 2: SPACIOUS HISTORY LOGS GRID */
              <motion.div
                initial={isMobile ? false : { opacity: 0, y: 15 }}
                animate={isMobile ? false : { opacity: 1, y: 0 }}
                className="w-full"
              >
                <Card className="glass border-border shadow-2xl">
                  <CardHeader className="pb-3 border-b border-white/[0.04]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-4.5 h-4.5 text-primary" />
                          Conversation History Log
                        </CardTitle>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          Browse all your past relationship intelligence analyses ({pastAnalyses.length} total)
                        </p>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-zinc-400 self-start sm:self-center">
                        Select a past chat to review
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {pastAnalyses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pastAnalyses.map((a: any) => (
                          <button
                            key={a._id}
                            onClick={() => router.push(`/dashboard/analyzer?id=${a._id}`)}
                            className="w-full text-left flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-900/30 border border-white/[0.02] hover:bg-white/[0.02] hover:border-white/[0.04] transition-all duration-300 cursor-pointer block group"
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              a.sentiment === "positive" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 group-hover:bg-emerald-500/15" :
                              a.sentiment === "neutral" ? "bg-amber-500/10 text-amber-400 border border-amber-500/10 group-hover:bg-amber-500/15" :
                              "bg-rose-500/10 text-rose-400 border border-rose-500/10 group-hover:bg-rose-500/15"
                            }`}>
                              {a.sentiment === "positive" ? <CheckCircle className="w-5 h-5" /> :
                               a.sentiment === "neutral" ? <Activity className="w-5 h-5" /> :
                               <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">{a.name}</p>
                                <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-zinc-950 text-zinc-400 border border-white/[0.04] flex-shrink-0">
                                  {a.platform}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5 font-medium">
                                <span>{new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                <span>•</span>
                                <span className={
                                  a.score >= 80 ? "text-emerald-500/70" :
                                  a.score >= 60 ? "text-amber-500/70" :
                                  "text-rose-500/70"
                                }>{getGradeLabel(a.score)}</span>
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0 flex items-center gap-2">
                              <div className="flex flex-col items-end justify-center">
                                <p className={`text-base font-extrabold leading-none ${
                                  a.score >= 80 ? "text-emerald-400" :
                                  a.score >= 60 ? "text-amber-400" :
                                  "text-rose-400"
                                }`}>{a.score}</p>
                                <span className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Score</span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-zinc-550 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquareText className="w-12 h-12 text-zinc-700 mx-auto mb-3 opacity-55" />
                        <p className="text-sm font-semibold text-zinc-300">No past conversation logs analyzed yet</p>
                        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
                          Head over to the &quot;New Analysis&quot; tab above, paste a back-and-forth chat conversation, and hit analyze to save reports in your local workspace.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ChatAnalyzerPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium tracking-wide animate-pulse">Loading analyzer...</p>
      </div>
    }>
      <ChatAnalyzerInner />
    </Suspense>
  )
}
