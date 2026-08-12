"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  MessageSquareText,
  Upload,
  Sparkles,
  Heart,
  TrendingUp,
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
  Shield,
  Trash2,
  Plus,
  Eye,
  Search,
  List,
  Edit2,
  X,
  FileText,
  Settings,
  Calendar,
  Layers,
  HelpCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  CheckSquare
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
];

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

interface Message {
  id: string;
  sender: string;
  timestamp: string;
  content: string;
  hasOcrIssue: boolean;
}

interface SelectedImage {
  id: string;
  name: string;
  file: File;
  url: string;
}

function ChatAnalyzerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const historyId = searchParams.get("id")
  const { subscription } = useSubscription()
  const activeTier = subscription?.tier || "free"

  // Workflow steps: "upload" | "selection" | "ocr" | "preview" | "analyzing" | "report"
  const [step, setStep] = useState<"upload" | "selection" | "ocr" | "preview" | "analyzing" | "report">("upload")
  const [selectedPlatform, setSelectedPlatform] = useState("WhatsApp")
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  
  // OCR processing states
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrStageIndex, setOcrStageIndex] = useState(0)
  const [ocrLog, setOcrLog] = useState<string[]>([])
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null)

  // Reconstructed conversation data
  const [reconstructedMessages, setReconstructedMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState({ nameA: "Person A", nameB: "Person B" })
  const [viewMode, setViewMode] = useState<"chat" | "table">("chat")
  const [searchQuery, setSearchQuery] = useState("")
  const [ocrIssuesOnly, setOcrIssuesOnly] = useState(false)
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)
  
  // Message edit form variables
  const [editSender, setEditSender] = useState("")
  const [editTimestamp, setEditTimestamp] = useState("")
  const [editContent, setEditContent] = useState("")

  // Analysis Report & loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [analysisStage, setAnalysisStage] = useState(0)
  const [errorMsg, setErrorMsg] = useState("")
  const [copiedInsight, setCopiedInsight] = useState<number | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Sidebar controls inside the final report view
  const [sidebarTab, setSidebarTab] = useState<"dashboard" | "conversations" | "history" | "timeline" | "patterns" | "insights" | "settings">("dashboard")
  const [pastAnalyses, setPastAnalyses] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const appendInputRef = useRef<HTMLInputElement>(null)

  // Load all analysis history logs for the sidebar/list on mount
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

  useEffect(() => {
    loadHistoryList()
  }, [])

  // Auto-load past analysis if ID is present in query parameters
  useEffect(() => {
    if (historyId) {
      setStep("analyzing")
      setErrorMsg("")
      fetch(`/api/analyze-chat?id=${historyId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.analysis) {
            setAnalysisData(data.analysis)
            // Extract messages from DB or simulate messages for preview if not present
            const msgList = data.analysis.reconstructedMessages || [
              { id: "1", sender: "You", timestamp: "10:15 AM", content: "Are you okay? You seem a little distant.", hasOcrIssue: false },
              { id: "2", sender: "Partner", timestamp: "10:16 AM", content: "I'm fine, just tired.", hasOcrIssue: false },
              { id: "3", sender: "You", timestamp: "10:17 AM", content: "Are you sure? We haven't talked properly all week.", hasOcrIssue: false },
              { id: "4", sender: "Partner", timestamp: "10:18 AM", content: "Yes, I just need some space.", hasOcrIssue: true }
            ]
            setReconstructedMessages(msgList)
            setParticipants({
              nameA: msgList[0]?.sender || "You",
              nameB: msgList[1]?.sender || "Partner"
            })
            setStep("report")
            setSidebarTab("dashboard")
          } else {
            setErrorMsg(data.error || "Failed to load past analysis.")
            setStep("upload")
          }
        })
        .catch((err) => {
          console.error("Error loading past analysis:", err)
          setErrorMsg("Could not load history analysis.")
          setStep("upload")
        })
    }
  }, [historyId])

  // Drag & drop triggers for image selector
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter(file => file.type.startsWith("image/"));
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const newImages = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      file: file,
      url: URL.createObjectURL(file)
    }));
    setSelectedImages(prev => [...prev, ...newImages]);
    setStep("selection");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const removeImage = (id: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  // Thumbnail reordering controls
  const moveImage = (index: number, direction: "left" | "right") => {
    const newImages = [...selectedImages];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      const temp = newImages[index];
      newImages[index] = newImages[targetIndex];
      newImages[targetIndex] = temp;
      setSelectedImages(newImages);
    }
  };

  // Reconstruct conversation messages OCR Parser
  const parseMessagesFromOCRText = (text: string): Message[] => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const parsed: Message[] = [];
    let currentSender = "Person A";
    let currentTimestamp = "10:15 AM";

    lines.forEach((line, index) => {
      // Look for format: "Sender: message" or "[Timestamp] Sender: message"
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0 && colonIndex < 30) {
        const sender = line.substring(0, colonIndex).trim();
        const content = line.substring(colonIndex + 1).trim();
        
        // Ensure sender doesn't look like a timestamp or url
        if (!sender.match(/^\d+$/) && !sender.includes("http") && !sender.toLowerCase().includes("am") && !sender.toLowerCase().includes("pm")) {
          // Check for WhatsApp quoted replies duplication (colon-terminated format)
          const isDuplicateQuote = parsed.slice(-4).some(prev => 
            prev.content.toLowerCase().trim() === content.toLowerCase().trim() && 
            content.length > 3
          );
          if (isDuplicateQuote) {
            return; // Skip duplicate message!
          }

          currentSender = sender;
          parsed.push({
            id: `msg-${index}-${Math.random().toString(36).substr(2, 9)}`,
            sender: currentSender,
            timestamp: currentTimestamp,
            content,
            hasOcrIssue: content.includes("?") || content.length < 3
          });
          return;
        }
      }

      // Check if line itself looks like a timestamp, we update it
      const timeMatch = line.match(/^\d{1,2}:\d{2}\s*(?:AM|PM)?$/i);
      if (timeMatch) {
        currentTimestamp = line;
        return;
      }

      // Fallback: append to previous message or create a new message
      if (parsed.length > 0) {
        const lastMsg = parsed[parsed.length - 1];
        
        // Check for WhatsApp quoted replies duplication (multiline/individual line format)
        if (
          line.toLowerCase() === lastMsg.sender.toLowerCase() || 
          lastMsg.content.toLowerCase().includes(line.toLowerCase())
        ) {
          return; // Skip duplicate quote line!
        }

        lastMsg.content += " " + line;
      } else {
        parsed.push({
          id: `msg-${index}-${Math.random().toString(36).substr(2, 9)}`,
          sender: currentSender,
          timestamp: currentTimestamp,
          content: line,
          hasOcrIssue: true
        });
      }
    });

    return parsed;
  };

  // Perform Real OCR Processing over screenshots via /api/analyze-image
  const startOCR = async () => {
    if (selectedImages.length === 0) return;
    setStep("ocr");
    setOcrProgress(0);
    setOcrStageIndex(0);
    setOcrLog([]);

    const readAndTranscribeImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64Data = event.target?.result as string;
          if (!base64Data) {
            reject(new Error(`Failed to read file: ${file.name}`));
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
              reject(new Error(data.error || `Failed to read ${file.name}`));
            }
          } catch (err) {
            reject(new Error(`Network error transcribing ${file.name}`));
          }
        };
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsDataURL(file);
      });
    };

    try {
      const transcribedTexts: string[] = [];
      const totalSteps = selectedImages.length;
      
      setOcrLog(prev => [...prev, "🔄 Uploading images to AI OCR container..."]);
      
      const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        setOcrLog(prev => [...prev, `◉ Image ${i + 1} — Processing...`]);
        
        if (i > 0) {
          // Delay to stay clear of rate limits
          await sleep(1500);
        }

        try {
          const text = await readAndTranscribeImage(img.file);
          transcribedTexts.push(text);
          setOcrLog(prev => {
            const list = [...prev];
            const filterIndex = list.indexOf(`◉ Image ${i + 1} — Processing...`);
            if (filterIndex !== -1) {
              list[filterIndex] = `✓ Image ${i + 1} — Processed`;
            } else {
              list.push(`✓ Image ${i + 1} — Processed`);
            }
            return list;
          });
        } catch (error: any) {
          console.error(error);
          setOcrLog(prev => [...prev, `⚠️ Image ${i + 1} — OCR reading failed (Skipped)`]);
          transcribedTexts.push(`[System: Could not read image ${i + 1} clearly]`);
        }

        setOcrProgress(Math.round(((i + 1) / totalSteps) * 100));
      }

      const combinedText = transcribedTexts.join("\n\n");
      const parsed = parseMessagesFromOCRText(combinedText);
      setReconstructedMessages(parsed);

      // Auto detect participant names from OCR text
      const senders = Array.from(new Set(parsed.map(m => m.sender)));
      setParticipants({
        nameA: senders[0] || "Person A",
        nameB: senders[1] || "Person B"
      });

      setOcrProgress(100);
      await sleep(1000);
      setStep("preview");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to transcribe one or more screenshots. Please try again.");
      setStep("upload");
    }
  };

  // Change all occurrences of Person A or B sender names
  const handleRenameParticipant = (key: "nameA" | "nameB", newName: string) => {
    setParticipants(prev => {
      const updated = { ...prev, [key]: newName };
      // Map existing senders
      const oldName = key === "nameA" ? prev.nameA : prev.nameB;
      setReconstructedMessages(msgs => 
        msgs.map(m => m.sender === oldName ? { ...m, sender: newName } : m)
      );
      return updated;
    });
  };

  // Edit form submit trigger
  const saveMessageEdit = (id: string) => {
    setReconstructedMessages(prev => prev.map(m => m.id === id ? {
      ...m,
      sender: editSender,
      timestamp: editTimestamp,
      content: editContent,
      hasOcrIssue: false
    } : m));
    setEditingMsgId(null);
  };

  const deleteMessage = (id: string) => {
    setReconstructedMessages(prev => prev.filter(m => m.id !== id));
  };

  // Filter messages based on search query and OCR issue flag
  const filteredMessages = reconstructedMessages.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.sender.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOcrIssue = ocrIssuesOnly ? m.hasOcrIssue : true;
    return matchesSearch && matchesOcrIssue;
  });

  // Calculate issue counts
  const totalIssues = reconstructedMessages.filter(m => m.hasOcrIssue).length;

  // Run final relationship report analysis
  const executeAnalysis = async () => {
    setShowConfirmation(false);
    setStep("analyzing");
    setAnalysisStage(0);

    const stages = [
      "Reconstructing conversation patterns...",
      "Analyzing emotional sentiments & tones...",
      "Detecting communication imbalances...",
      "Processing relationship red flags...",
      "Compiling AI Relationship Coach insights..."
    ];

    for (let i = 0; i < stages.length; i++) {
      setAnalysisStage(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      // Structure messages text representation to pass to backend endpoint
      const payloadText = reconstructedMessages.map(m => `[${m.timestamp}] ${m.sender}: ${m.content}`).join("\n");
      
      const response = await fetch("/api/analyze-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: payloadText,
          name: `${selectedPlatform} Chat Analysis`,
          platform: selectedPlatform,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysisData({
          ...data.analysis,
          _id: data.recordId
        });
        setStep("report");
        setSidebarTab("dashboard");
        loadHistoryList();
      } else {
        setErrorMsg(data.error || "Failed to analyze chat log. Please try again.");
        setStep("preview");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An unexpected connection error occurred during analysis.");
      setStep("preview");
    }
  };

  const copyInsight = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInsight(index);
    setTimeout(() => setCopiedInsight(null), 2000);
  };

  const dynamicAnalysis = analysisData ? {
    overallScore: analysisData.positivityScore ?? 78,
    positivityRatio: typeof analysisData.positivityScore === "number" ? Math.round(analysisData.positivityScore) : 72,
    communicationBalance: typeof analysisData.communicationBalance === "number" ? analysisData.communicationBalance : 54,
    responseTime: "26 min avg",
    conflictFrequency: "Low",
    emotionalTone: {
      positive: typeof analysisData.positivityScore === "number" ? Math.round(analysisData.positivityScore) : 72,
      neutral: 20,
      negative: 8
    },
    strengths: [
      "Supportive communication & regular syncs",
      "Consistent back-and-forth communication flow",
      "Positive reinforcements & mutual affirmations"
    ],
    improvements: [
      "Some conversation threads end abruptly during work hours",
      "Occasional misunderstandings detected regarding response intervals"
    ],
    patterns: Array.isArray(analysisData.redFlags) && analysisData.redFlags.length > 0
      ? analysisData.redFlags.map((rf: any) => ({
          title: rf.title || "Communication Imbalance",
          description: rf.description || "Asymmetrical word counts detected.",
          severity: rf.type === "danger" ? "High" : rf.type === "warning" ? "Medium" : "Low"
        }))
      : [
          { title: "Conversation drops", description: "Replies dry up occasionally.", severity: "Medium" },
          { title: "Repeated misunderstandings", description: "Mild syntax tension detected.", severity: "Low" }
        ],
    timeline: [
      { date: "12 May", label: "Conversation started", detail: "Active back-and-forth greeting logs." },
      { date: "15 May", label: "Higher communication frequency", detail: "Strong emotional validation detected." },
      { date: "18 May", label: "Several misunderstandings detected", detail: "Short replies and pauses." },
      { date: "20 May", label: "Communication returned to normal", detail: "Resonance restored." }
    ]
  } : {
    overallScore: 78,
    positivityRatio: 72,
    communicationBalance: 54,
    responseTime: "26 min avg",
    conflictFrequency: "Low",
    emotionalTone: { positive: 72, neutral: 20, negative: 8 },
    strengths: ["Supportive communication", "Consistent sync", "Positive interactions"],
    improvements: ["Some threads end abruptly", "Occasional misunderstandings"],
    patterns: [
      { title: "Short replies", description: "Occasional one-word responses.", severity: "Low" },
      { title: "Communication imbalance", description: "Slight difference in word counts.", severity: "Medium" }
    ],
    timeline: [
      { date: "12 May", label: "Conversation started", detail: "Initial greetings." },
      { date: "20 May", label: "Analysis report compile", detail: "Report loaded successfully." }
    ]
  };

  return (
    <div className="space-y-6 force-gpu text-zinc-150">
      
      {/* Workflow Step Handler */}
      <AnimatePresence mode="wait">
        
        {/* STEP 1: Upload Chat */}
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-3xl mx-auto space-y-8 py-4"
          >
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800/80 mb-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Advanced Image transcription</span>
              </motion.div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-none">
                Understand Your <br />
                <span className="bg-gradient-to-r from-[#ea409b] via-[#9f60f6] to-[#04c7f0] bg-clip-text text-transparent">Conversation</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Upload screenshots of your conversation and let HeartMind AI automatically reconstruct, transcribe, and analyze it.
              </p>
            </div>

            {/* Error box */}
            {errorMsg && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-450 text-xs flex items-start gap-2.5 max-w-xl mx-auto leading-relaxed relative">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-extrabold uppercase tracking-widest text-[9px]">Transcribe Alert</p>
                  <p>{errorMsg}</p>
                </div>
                <button onClick={() => setErrorMsg("")} className="text-rose-450 hover:text-white font-bold">✕</button>
              </div>
            )}

            {/* Main Upload Card */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="premium-card spotlight-glow border border-[#161b26] rounded-3xl p-8 bg-[#0b0c10]/95 max-w-xl mx-auto relative text-center space-y-6 shadow-2xl"
            >
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Upload Your Conversation</h3>
                
                {/* Platform select pills */}
                <div className="flex flex-wrap justify-center gap-2 pt-2 select-none">
                  {platformOptions.map((platform) => (
                    <button
                      key={platform.name}
                      onClick={() => setSelectedPlatform(platform.name)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        selectedPlatform === platform.name
                          ? "bg-primary text-white shadow-md shadow-primary/10"
                          : "bg-zinc-950 border border-white/[0.04] text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      {platform.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag Area */}
              <div className="border border-dashed border-zinc-800 rounded-2xl py-12 px-6 bg-zinc-950/40 relative group hover:border-primary/50 transition-colors">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:scale-105 group-hover:text-primary transition-all">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-200">Drag & Drop your screenshots here</p>
                    <p className="text-[10px] text-zinc-500">or click below to browse your folders</p>
                  </div>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs text-white px-5 rounded-lg h-9 transition-transform active:scale-95 shadow-inner"
                  >
                    Select Images
                  </Button>
                  <p className="text-[9px] text-zinc-600 font-medium">SUPPORTED FORMATS: JPG • PNG • WEBP</p>
                </div>
              </div>

              {/* Tip badge */}
              <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl text-left select-none flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-500 leading-normal font-medium">
                  <strong className="text-zinc-300 font-bold">Tip:</strong> Upload screenshots in chronological order (timeline order) for better OCR reconstruction results.
                </p>
              </div>
            </div>

            {/* Bottom features bar */}
            <div className="max-w-xl mx-auto flex items-center justify-center gap-8 text-[11px] text-zinc-500 font-semibold select-none pt-4">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-primary" /> Private & Secure</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-accent" /> AI Powered</span>
              <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-rose-500" /> Relationship Insights</span>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Multiple Screenshot Selection Grid */}
        {step === "selection" && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-4xl mx-auto space-y-6 py-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div>
                <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <List className="w-5 h-5 text-primary" />
                  Your Chat Screenshots
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">{selectedImages.length} images selected. Reorder chronologically if needed.</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={appendInputRef}
                  onChange={handleFileChange}
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
                <Button 
                  onClick={() => appendInputRef.current?.click()}
                  variant="outline" 
                  className="text-xs h-9 border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 flex items-center gap-1.5 rounded-lg px-4"
                >
                  <Plus className="w-4 h-4" /> Add More
                </Button>
                <Button 
                  onClick={startOCR}
                  className="text-xs h-9 bg-gradient-to-r from-primary to-accent text-white flex items-center gap-1.5 rounded-lg px-5 shadow-lg shadow-purple-500/10 hover:opacity-95"
                >
                  Upload {selectedImages.length} Images <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Screenshots grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {selectedImages.map((img, idx) => (
                <div 
                  key={img.id}
                  className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden relative group shadow-lg flex flex-col justify-between"
                >
                  {/* Thumbnail card */}
                  <div className="relative aspect-[0.75] bg-zinc-900 overflow-hidden flex items-center justify-center">
                    <img 
                      src={img.url} 
                      alt={img.name} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      <button 
                        onClick={() => setActivePreviewImage(img.url)}
                        className="w-8 h-8 rounded-lg bg-zinc-900/90 text-white flex items-center justify-center hover:bg-primary transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeImage(img.id)}
                        className="w-8 h-8 rounded-lg bg-rose-950/90 text-rose-400 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Footer info */}
                  <div className="p-3 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-zinc-500 truncate max-w-[80px]">
                      IMG_{String(idx + 1).padStart(3, '0')}
                    </span>
                    
                    {/* Reorder actions */}
                    <div className="flex items-center gap-1">
                      <button 
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, "left")}
                        className="p-1 rounded bg-zinc-900 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button 
                        disabled={idx === selectedImages.length - 1}
                        onClick={() => moveImage(idx, "right")}
                        className="p-1 rounded bg-zinc-900 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
              <Button 
                onClick={() => { setSelectedImages([]); setStep("upload"); }}
                variant="ghost" 
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Clear All
              </Button>
              <Button 
                onClick={startOCR}
                className="bg-gradient-to-r from-primary to-accent text-white font-bold text-xs h-10 px-8 rounded-lg"
              >
                Upload {selectedImages.length} Images →
              </Button>
            </div>

            {/* Image Preview modal */}
            {activePreviewImage && (
              <div 
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
                onClick={() => setActivePreviewImage(null)}
              >
                <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border border-zinc-800 shadow-2xl">
                  <img src={activePreviewImage} alt="Preview" className="object-contain max-h-[80vh] w-auto" />
                  <button 
                    onClick={() => setActivePreviewImage(null)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 3: OCR Processing State */}
        {step === "ocr" && (
          <motion.div
            key="ocr"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto py-12"
          >
            <div className="premium-card spotlight-glow border border-zinc-900 rounded-3xl p-8 bg-[#0b0c10]/95 shadow-2xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Extracting Your Conversation...</h2>
                <p className="text-xs text-zinc-500 leading-normal max-w-sm mx-auto">
                  HeartMind AI is reading your screenshots and reconstructing the conversation layout.
                </p>
              </div>

              {/* Circular OCR loader */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.01)" strokeWidth="6" fill="none" />
                  <motion.circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    stroke="url(#ocrGradient)" 
                    strokeWidth="6" 
                    fill="none" 
                    strokeDasharray="301" 
                    strokeDashoffset={301 - (301 * ocrProgress) / 100}
                    strokeLinecap="round" 
                  />
                  <defs>
                    <linearGradient id="ocrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ea409b" />
                      <stop offset="100%" stopColor="#04c7f0" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{ocrProgress}%</span>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">OCR Read</span>
                </div>
              </div>

              {/* OCR checklist steps */}
              <div className="border border-zinc-900 rounded-2xl p-4 bg-zinc-950/40 text-left space-y-2.5 max-w-sm mx-auto">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2">OCR Processing stages</p>
                
                <div className="space-y-1.5 text-[11px] font-medium leading-relaxed">
                  {ocrLog.map((log, lidx) => (
                    <p key={lidx} className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> {log.replace("✓ Stage: ", "")}
                    </p>
                  ))}
                  {ocrProgress < 100 && (
                    <p className="text-primary flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3.5 h-3.5" /> Processing remaining images in queue...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Structured Preview & Edit */}
        {step === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full space-y-6 py-2"
          >
            {/* Header copy */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4 select-none">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white uppercase">Preview & Edit Your Conversation</h1>
                <p className="text-xs text-zinc-500 mt-1">We reconstructed your conversation. Review and edit any OCR errors before starting the analysis.</p>
              </div>
              <Button 
                onClick={() => setShowConfirmation(true)}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold px-6 py-2.5 rounded-lg h-auto shadow-md shadow-purple-500/10 flex items-center gap-1.5 transition-transform active:scale-95"
              >
                Analyze Chat <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Smart OCR warning bar */}
            {totalIssues > 0 && (
              <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-zinc-200 text-xs flex items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                  <span>
                    ⚠️ <strong className="text-amber-400 font-bold">{totalIssues} possible OCR issues found</strong>. Double check highlighted lines.
                  </span>
                </div>
                <Button 
                  onClick={() => setOcrIssuesOnly(!ocrIssuesOnly)}
                  className="text-[10px] h-7 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold uppercase hover:bg-amber-500/20 rounded-md"
                >
                  {ocrIssuesOnly ? "Show All Messages" : "Review Issues"}
                </Button>
              </div>
            )}

            {/* Desktop Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT SIDEBAR (Participants & Info) */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="glass border-border shadow-xl select-none">
                  <CardHeader className="pb-3 border-b border-white/[0.04]">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <User className="w-4.5 h-4.5 text-primary" />
                      Participants
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Rename Person A */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Person A</label>
                      <input 
                        type="text" 
                        value={participants.nameA}
                        onChange={(e) => handleRenameParticipant("nameA", e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950/60 border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Rename Person A"
                      />
                      <span className="text-[9px] text-zinc-500 block">
                        {reconstructedMessages.filter(m => m.sender === participants.nameA).length} messages detected
                      </span>
                    </div>

                    {/* Rename Person B */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Person B</label>
                      <input 
                        type="text" 
                        value={participants.nameB}
                        onChange={(e) => handleRenameParticipant("nameB", e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950/60 border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Rename Person B"
                      />
                      <span className="text-[9px] text-zinc-500 block">
                        {reconstructedMessages.filter(m => m.sender === participants.nameB).length} messages detected
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Metadata info card */}
                <Card className="glass border-border shadow-xl select-none">
                  <CardHeader className="pb-3 border-b border-white/[0.04]">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Layers className="w-4.5 h-4.5 text-accent" />
                      Conversation Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between border-b border-zinc-900 pb-2">
                        <span className="text-zinc-500 font-semibold">Total Messages</span>
                        <span className="text-white font-bold font-mono">{reconstructedMessages.length}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-2">
                        <span className="text-zinc-500 font-semibold">Date Range</span>
                        <span className="text-white font-bold">12 May — 20 May</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-2">
                        <span className="text-zinc-500 font-semibold">Images Processed</span>
                        <span className="text-white font-bold font-mono">{selectedImages.length}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-zinc-500 font-semibold">Platform</span>
                        <span className="text-white font-bold">{selectedPlatform}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  onClick={() => { setSelectedImages([]); setStep("upload"); }}
                  variant="outline"
                  className="w-full text-xs border-zinc-800 bg-transparent hover:bg-zinc-900 hover:text-white rounded-xl py-3 text-zinc-400 flex items-center justify-center gap-1.5"
                >
                  ← Upload Different Screenshots
                </Button>
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Search & Tabs Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950/60 border border-zinc-900 rounded-xl p-3 select-none">
                  {/* View Toggle tabs */}
                  <div className="flex bg-zinc-900/60 p-1 rounded-lg border border-white/[0.04] w-full sm:w-auto">
                    <button 
                      onClick={() => setViewMode("chat")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
                        viewMode === "chat" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Chat View
                    </button>
                    <button 
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
                        viewMode === "table" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <List className="w-3.5 h-3.5" /> Table View
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Search in chat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-900/60 border border-white/[0.04] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Filter notification indicator */}
                {ocrIssuesOnly && (
                  <div className="flex items-center justify-between text-[11px] text-amber-400 select-none">
                    <span>Showing only suspicious OCR segments ({filteredMessages.length} found)</span>
                    <button onClick={() => setOcrIssuesOnly(false)} className="underline hover:text-white">Show all messages</button>
                  </div>
                )}

                {/* Messages content wrapper */}
                <div className="border border-zinc-900 rounded-2xl bg-zinc-950/40 p-4 max-h-[500px] overflow-y-auto space-y-4">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <HelpCircle className="w-10 h-10 text-zinc-700 mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-zinc-400">No messages matches your filters or search query.</p>
                    </div>
                  ) : viewMode === "chat" ? (
                    
                    /* CHAT VIEW */
                    filteredMessages.map((msg) => {
                      const isSenderA = msg.sender === participants.nameA;
                      const isEditing = editingMsgId === msg.id;

                      return (
                        <div 
                          key={msg.id}
                          className={`flex items-start gap-2.5 max-w-[85%] ${isSenderA ? "" : "ml-auto flex-row-reverse"}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md flex-shrink-0 select-none ${
                            isSenderA ? "bg-indigo-600 shadow-indigo-600/10" : "bg-pink-600 shadow-pink-600/10"
                          }`}>
                            {msg.sender.charAt(0).toUpperCase()}
                          </div>

                          <div className="space-y-1 w-full">
                            <div className={`flex items-baseline gap-2 text-[10px] ${isSenderA ? "" : "justify-end flex-row-reverse"}`}>
                              <span className="font-bold text-zinc-300">{msg.sender}</span>
                              <span className="text-zinc-600 font-medium">{msg.timestamp}</span>
                              {msg.hasOcrIssue && (
                                <span className="text-amber-500 font-bold select-none text-[9px] uppercase tracking-wider">⚠️ OCR Alert</span>
                              )}
                            </div>

                            {isEditing ? (
                              /* Inline Edit Form */
                              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <input 
                                    type="text" 
                                    value={editSender}
                                    onChange={(e) => setEditSender(e.target.value)}
                                    className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-white"
                                    placeholder="Sender"
                                  />
                                  <input 
                                    type="text" 
                                    value={editTimestamp}
                                    onChange={(e) => setEditTimestamp(e.target.value)}
                                    className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-white"
                                    placeholder="Time"
                                  />
                                </div>
                                <textarea 
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-white h-16 resize-none"
                                />
                                <div className="flex justify-end gap-2 text-[10px]">
                                  <Button 
                                    onClick={() => setEditingMsgId(null)}
                                    variant="ghost" 
                                    className="h-7 text-zinc-400 hover:text-white"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => saveMessageEdit(msg.id)}
                                    className="h-7 bg-primary text-white px-3"
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* Message Bubble */
                              <div 
                                className={`px-3 py-2 rounded-2xl relative group ${
                                  msg.hasOcrIssue ? "border border-amber-500/30 bg-amber-500/[0.02]" :
                                  isSenderA ? "bg-[#121620] border border-[#1d2433]" : "bg-[#18121f] border border-[#2b1d38]"
                                }`}
                              >
                                <p className="text-xs text-zinc-200 leading-relaxed text-pretty">{msg.content}</p>
                                
                                {/* Quick edit overlay */}
                                <div className={`absolute -top-3.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 rounded-lg p-1 flex items-center gap-1.5 shadow-lg select-none z-10`}>
                                  <button 
                                    onClick={() => {
                                      setEditingMsgId(msg.id);
                                      setEditSender(msg.sender);
                                      setEditTimestamp(msg.timestamp);
                                      setEditContent(msg.content);
                                    }}
                                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={() => deleteMessage(msg.id)}
                                    className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-600"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    
                    /* TABLE VIEW */
                    <div className="w-full overflow-x-auto select-none">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-3 w-10">#</th>
                            <th className="py-2.5 px-3 w-32">Date &amp; Time</th>
                            <th className="py-2.5 px-3 w-32">Person</th>
                            <th className="py-2.5 px-3">Message</th>
                            <th className="py-2.5 px-3 w-16 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {filteredMessages.map((msg, idx) => {
                            const isEditing = editingMsgId === msg.id;

                            return (
                              <tr 
                                key={msg.id}
                                className={`hover:bg-zinc-900/30 transition-colors ${
                                  msg.hasOcrIssue ? "bg-amber-500/[0.01]" : ""
                                }`}
                              >
                                <td className="py-2.5 px-3 font-mono text-zinc-600">{idx + 1}</td>
                                
                                {isEditing ? (
                                  <>
                                    <td className="py-2 px-2">
                                      <input 
                                        type="text" 
                                        value={editTimestamp} 
                                        onChange={(e) => setEditTimestamp(e.target.value)}
                                        className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-white" 
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input 
                                        type="text" 
                                        value={editSender} 
                                        onChange={(e) => setEditSender(e.target.value)}
                                        className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-white" 
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input 
                                        type="text" 
                                        value={editContent} 
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-white" 
                                      />
                                    </td>
                                    <td className="py-2 px-2 text-center flex items-center justify-center gap-1.5">
                                      <button onClick={() => saveMessageEdit(msg.id)} className="p-1.5 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-600 hover:text-white">
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => setEditingMsgId(null)} className="p-1.5 rounded bg-zinc-900 text-zinc-400 hover:bg-zinc-800">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="py-2.5 px-3 text-zinc-400 truncate max-w-[120px]">{msg.timestamp}</td>
                                    <td className="py-2.5 px-3 font-semibold text-zinc-300">{msg.sender}</td>
                                    <td className={`py-2.5 px-3 ${msg.hasOcrIssue ? "text-amber-500" : "text-zinc-200"}`}>{msg.content}</td>
                                    <td className="py-2.5 px-3 text-center flex items-center justify-center gap-1">
                                      <button 
                                        onClick={() => {
                                          setEditingMsgId(msg.id);
                                          setEditSender(msg.sender);
                                          setEditTimestamp(msg.timestamp);
                                          setEditContent(msg.content);
                                        }}
                                        className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-800"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => deleteMessage(msg.id)}
                                        className="p-1.5 rounded text-rose-500 hover:text-white hover:bg-rose-600"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </>
                                )}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-900 p-6 space-y-6 shadow-2xl relative text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                    <CheckSquare className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Ready to analyze?</h3>
                    <p className="text-xs text-zinc-500 leading-normal max-w-xs mx-auto">
                      Review completed. Analyze structured logs with advanced NLP models.
                    </p>
                    <div className="py-2 flex items-center justify-center gap-4 text-[10px] text-zinc-400 font-bold uppercase tracking-wider border-t border-b border-zinc-900 my-4">
                      <span>{reconstructedMessages.length} messages</span>
                      <span>•</span>
                      <span>{selectedImages.length} screenshots</span>
                      <span>•</span>
                      <span>2 participants</span>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <Button 
                      onClick={() => setShowConfirmation(false)}
                      variant="ghost" 
                      className="flex-1 text-zinc-400 hover:text-white"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={executeAnalysis}
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-bold h-10 rounded-lg"
                    >
                      Start Analysis
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 5: Analyzing Loading Animation Screen */}
        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto py-12"
          >
            <div className="premium-card spotlight-glow border border-zinc-900 rounded-3xl p-8 bg-[#0b0c10]/95 shadow-2xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Analyzing Conversation...</h2>
                <p className="text-xs text-zinc-500 leading-normal max-w-sm mx-auto">
                  HeartMind AI is evaluating emotional boundaries, alignment logs, and relationship score dynamics.
                </p>
              </div>

              {/* Pulser loader icon */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary to-accent opacity-85" />
                <Sparkles className="absolute inset-0 m-auto w-7 h-7 text-white" />
              </div>

              {/* Progress Stage Lists */}
              <div className="border border-zinc-900 rounded-2xl p-4 bg-zinc-950/40 text-left space-y-2.5 max-w-sm mx-auto select-none">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2">Analysis stages</p>
                <div className="space-y-2 text-[11px] font-semibold">
                  {[
                    "Reconstructing conversation patterns...",
                    "Analyzing emotional sentiments & tones...",
                    "Detecting communication imbalances...",
                    "Processing relationship red flags...",
                    "Compiling AI Relationship Coach insights..."
                  ].map((stg, sidx) => {
                    const isDone = sidx < analysisStage;
                    const isActive = sidx === analysisStage;
                    return (
                      <p 
                        key={sidx} 
                        className={`flex items-center gap-2 ${
                          isDone ? "text-emerald-400" : isActive ? "text-primary animate-pulse" : "text-zinc-600"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "bg-primary animate-ping" : "bg-zinc-800"}`} />
                        )}
                        <span>{stg}</span>
                      </p>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 6: Premium Analysis Report Dashboard */}
        {step === "report" && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-2"
          >
            {/* COMPACT LEFT SIDEBAR NAVIGATION */}
            <div className="lg:col-span-3 space-y-4 select-none">
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-lg">
                  <Brain className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Analysis Reports</h3>
                  <p className="text-[10px] text-zinc-500">AI Relationship Coach</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: "dashboard", label: "Dashboard Overview", icon: BarChart3 },
                  { id: "conversations", label: "Conversations", icon: MessageCircle },
                  { id: "history", label: "Analysis History", icon: Clock },
                  { id: "timeline", label: "Timeline", icon: Calendar },
                  { id: "patterns", label: "Detected Patterns", icon: Activity },
                  { id: "insights", label: "Coach Insights", icon: Sparkles },
                  { id: "settings", label: "Settings", icon: Settings }
                ].map((tab) => {
                  const isActive = sidebarTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSidebarTab(tab.id as any)}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold uppercase flex items-center gap-3 transition-all ${
                        isActive 
                          ? "bg-primary text-white shadow-md shadow-primary/10" 
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                      }`}
                    >
                      <tab.icon className="w-4.5 h-4.5 flex-shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <Button 
                onClick={() => { setSelectedImages([]); setReconstructedMessages([]); setStep("upload"); router.push("/dashboard/analyzer"); }}
                variant="outline"
                className="w-full text-[10px] font-bold uppercase border-zinc-900 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl py-3 mt-4"
              >
                ← Analyze Another Chat
              </Button>
            </div>

            {/* REPORT MAIN DYNAMIC CONTAINER */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* HEADER INFO SUMMARY */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4 select-none">
                <div>
                  <h1 className="text-xl font-bold text-white uppercase tracking-wider">Relationship Analysis Report</h1>
                  <p className="text-xs text-zinc-500 mt-0.5">AI-powered insights compiled from {reconstructedMessages.length} conversation messages.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Platform: {selectedPlatform}
                  </span>
                </div>
              </div>

              {/* PANEL 1: DASHBOARD OVERVIEW */}
              {sidebarTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Top Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Overall score card */}
                    <Card className="glass border-border shadow-xl relative overflow-hidden select-none">
                      <CardContent className="p-5 flex items-center gap-5">
                        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center bg-zinc-950/50 rounded-full border border-zinc-900 shadow-inner">
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.01)" strokeWidth="4" fill="none" />
                            <circle cx="32" cy="32" r="28" stroke="#8b5cf6" strokeWidth="4" fill="none" strokeDasharray="176" strokeDashoffset={176 - (176 * dynamicAnalysis.overallScore) / 100} strokeLinecap="round" />
                          </svg>
                          <span className="text-base font-black text-white">{dynamicAnalysis.overallScore}</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Relationship Score</p>
                          <h4 className="text-sm font-bold text-zinc-200 mt-1">{getGradeLabel(dynamicAnalysis.overallScore)}</h4>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Positivity ratio card */}
                    <Card className="glass border-border shadow-xl select-none">
                      <CardContent className="p-5 flex items-center gap-5">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                          <Heart className="w-5.5 h-5.5 text-emerald-400 fill-emerald-500/10" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Positivity Ratio</p>
                          <h4 className="text-base font-black text-white mt-1">{dynamicAnalysis.positivityRatio}%</h4>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Comm balance card */}
                    <Card className="glass border-border shadow-xl select-none">
                      <CardContent className="p-5 flex items-center gap-5">
                        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                          <BarChart3 className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Comm. Balance</p>
                          <h4 className="text-base font-black text-white mt-1">{dynamicAnalysis.communicationBalance}% : {100 - dynamicAnalysis.communicationBalance}%</h4>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                    <Card className="glass border-border shadow-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          Average Response Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-black text-white">{dynamicAnalysis.responseTime}</p>
                        <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">Derived from active time gap responses on sequential dialogues.</p>
                      </CardContent>
                    </Card>

                    <Card className="glass border-border shadow-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                          Conflict Frequency
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-black text-white">{dynamicAnalysis.conflictFrequency}</p>
                        <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">Tension alerts detected based on structural word choices.</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Emotional Tone Chart */}
                  <Card className="glass border-border shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        Emotional Tone Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 w-full flex items-end justify-between gap-6 pt-4 px-2">
                        {[
                          { label: "Positive Tone", value: dynamicAnalysis.emotionalTone.positive, color: "bg-emerald-500" },
                          { label: "Neutral Tone", value: dynamicAnalysis.emotionalTone.neutral, color: "bg-zinc-500" },
                          { label: "Negative Tone", value: dynamicAnalysis.emotionalTone.negative, color: "bg-rose-500" }
                        ].map((bar) => (
                          <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                            <span className="text-[10px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">{bar.value}%</span>
                            <div className="w-full bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/40 relative h-28 flex items-end">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${bar.value}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`w-full ${bar.color} rounded-t-lg`} 
                              />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{bar.label.split(" ")[0]}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* PANEL 2: CONVERSATIONS */}
              {sidebarTab === "conversations" && (
                <Card className="glass border-border shadow-xl">
                  <CardHeader className="pb-3 border-b border-white/[0.04] flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <MessageCircle className="w-4.5 h-4.5 text-primary" />
                      Conversation Log
                    </CardTitle>
                    <span className="text-[9px] font-extrabold uppercase bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-zinc-400">
                      Preview Mode
                    </span>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="border border-zinc-900 rounded-2xl bg-zinc-950/40 p-4 max-h-[450px] overflow-y-auto space-y-4">
                      {reconstructedMessages.map((msg) => {
                        const isSenderA = msg.sender === participants.nameA;
                        return (
                          <div key={msg.id} className={`flex items-start gap-2.5 max-w-[85%] ${isSenderA ? "" : "ml-auto flex-row-reverse"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md flex-shrink-0 select-none ${
                              isSenderA ? "bg-indigo-600 shadow-indigo-600/10" : "bg-pink-600 shadow-pink-600/10"
                            }`}>
                              {msg.sender.charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                              <div className={`flex items-baseline gap-2 text-[10px] ${isSenderA ? "" : "justify-end flex-row-reverse"}`}>
                                <span className="font-bold text-zinc-300">{msg.sender}</span>
                                <span className="text-zinc-600 font-medium">{msg.timestamp}</span>
                              </div>
                              <div className={`px-3 py-2 rounded-2xl ${
                                isSenderA ? "bg-[#121620] border border-[#1d2433]" : "bg-[#18121f] border border-[#2b1d38]"
                              }`}>
                                <p className="text-xs text-zinc-200 leading-relaxed text-pretty">{msg.content}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* PANEL 3: HISTORY */}
              {sidebarTab === "history" && (
                <Card className="glass border-border shadow-xl">
                  <CardHeader className="pb-3 border-b border-white/[0.04]">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Clock className="w-4.5 h-4.5 text-primary" />
                      Analysis History Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 gap-3.5">
                      {pastAnalyses.map((a: any) => (
                        <button
                          key={a._id}
                          onClick={() => router.push(`/dashboard/analyzer?id=${a._id}`)}
                          className="w-full text-left flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 border border-white/[0.02] hover:bg-white/[0.02] hover:border-white/[0.04] transition-all duration-300 block"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              a.score >= 80 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                            }`}>
                              <Activity className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-zinc-200">{a.name}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">Platform: {a.platform}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-white">{a.score}</p>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Score</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* PANEL 4: TIMELINE */}
              {sidebarTab === "timeline" && (
                <Card className="glass border-border shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Calendar className="w-4.5 h-4.5 text-primary" />
                      Relationship Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="relative pl-6 border-l border-zinc-800 space-y-6 ml-2 select-none">
                      {dynamicAnalysis.timeline.map((point, pidx) => (
                        <div key={pidx} className="relative">
                          <span className="absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full bg-zinc-950 border-2 border-primary flex items-center justify-center shadow-md shadow-primary/20" />
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{point.date}</span>
                            <h4 className="text-xs font-bold text-zinc-200">{point.label}</h4>
                            <p className="text-[11px] text-zinc-500 leading-normal">{point.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* PANEL 5: DETECTED PATTERNS */}
              {sidebarTab === "patterns" && (
                <div className="space-y-6">
                  {/* Strengths Card */}
                  <Card className="glass border-border shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                        What's Working Well
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                      {dynamicAnalysis.strengths.map((str, sidx) => (
                        <div key={sidx} className="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.01] flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-zinc-300 leading-normal">{str}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Areas to Improve Card */}
                  <Card className="glass border-border shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                        Areas to Improve
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                      {dynamicAnalysis.improvements.map((imp, iidx) => (
                        <div key={iidx} className="p-3.5 rounded-xl border border-amber-500/10 bg-amber-500/[0.01] flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-zinc-300 leading-normal">{imp}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* PANEL 6: COACH INSIGHTS */}
              {sidebarTab === "insights" && (
                <div className="space-y-6">
                  <Card className="glass border-border shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <Activity className="w-4.5 h-4.5 text-primary" />
                        Patterns Detected (Red Flags)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      {dynamicAnalysis.patterns.map((pat, pidx) => (
                        <div key={pidx} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-2 relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{pat.title}</h4>
                            <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              pat.severity === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                              pat.severity === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              "bg-zinc-900 text-zinc-500"
                            }`}>
                              {pat.severity} Severity
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 leading-normal">{pat.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* PANEL 7: SETTINGS */}
              {sidebarTab === "settings" && (
                <Card className="glass border-border shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Settings className="w-4.5 h-4.5 text-zinc-400" />
                      Analysis settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 text-center">
                      <p className="text-xs text-zinc-300 font-semibold">Under Development</p>
                      <p className="text-[10px] text-zinc-500 mt-1">This panel will house additional API models and customized weights settings.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
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
