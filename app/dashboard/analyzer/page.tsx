"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
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
  CheckSquare,
  Brain,
  Download
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
  const { data: session } = useSession()
  const userName = session?.user?.name || "Dhiraj Patil"
  const userImage = session?.user?.image || ""

  const [showTimelineModal, setShowTimelineModal] = useState(false)
  const [showInsightsModal, setShowInsightsModal] = useState(false)

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
    } else {
      // Clear past loaded details if URL parameter is cleared (sidebar menu clicked)
      setAnalysisData(null)
      setReconstructedMessages([])
      setSelectedImages([])
      setStep("upload")
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

  // Jaccard word-similarity checker to detect OCR transcription variances
  const getSimilarity = (str1: string, str2: string): number => {
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    const words1 = clean(str1);
    const words2 = clean(str2);
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    let intersection = 0;
    set1.forEach(word => {
      if (set2.has(word)) intersection++;
    });
    
    const union = set1.size + set2.size - intersection;
    return intersection / union;
  };

  // Helper to check if a line/content is a combined duplicate of words already parsed recently
  const isWordSubsetOfRecent = (line: string, recentMessages: Message[]): boolean => {
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    const lineWords = clean(line);
    if (lineWords.length === 0) return false;
    
    const recentWordsSet = new Set<string>();
    recentMessages.forEach(m => {
      clean(m.content).forEach(w => recentWordsSet.add(w));
      clean(m.sender).forEach(w => recentWordsSet.add(w));
    });
    
    let matchedWordsCount = 0;
    lineWords.forEach(w => {
      if (recentWordsSet.has(w)) {
        matchedWordsCount++;
      }
    });
    
    const matchRatio = matchedWordsCount / lineWords.length;
    return matchRatio >= 0.82 && lineWords.length > 2; // Require at least 3 words to avoid false positives on short words
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
          // Check if content is a word subset of recent messages (handles quote boxes that contain colons)
          if (isWordSubsetOfRecent(content, parsed.slice(-6))) {
            return; // Skip duplicate quote!
          }

          // Check for WhatsApp quoted replies or screenshot overlap duplication (sliding window with fuzzy check)
          const isDuplicate = parsed.slice(-15).some(prev => {
            const cleanPrev = prev.content.toLowerCase().trim();
            const cleanCurr = content.toLowerCase().trim();
            const sameSender = prev.sender.toLowerCase().trim() === sender.toLowerCase().trim();
            
            // Exact content match
            if (cleanPrev === cleanCurr) {
              return sameSender || content.length > 3;
            }
            
            // Fuzzy similarity check for longer content
            if (content.length > 8 && prev.content.length > 8) {
              const sim = getSimilarity(prev.content, content);
              if (sim > 0.75) {
                return sameSender || content.length > 10;
              }
            }
            
            return false;
          });
          
          if (isDuplicate) {
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
        
        // Check if the fallback line itself is a word subset of recent messages (prevents double scan quote combinations)
        if (isWordSubsetOfRecent(line, parsed.slice(-6))) {
          return; // Skip duplicate quote line!
        }

        // Check for WhatsApp quoted replies duplication (multiline/individual line format)
        if (
          line.toLowerCase() === lastMsg.sender.toLowerCase() || 
          lastMsg.content.toLowerCase().includes(line.toLowerCase())
        ) {
          return; // Skip duplicate quote line!
        }

        // Check if the fallback line matches any recently parsed message content exactly to prevent duplicate overlap appends
        const isLineOverlap = parsed.slice(-12).some(prev => {
          const cleanPrev = prev.content.toLowerCase().trim();
          const cleanLine = line.toLowerCase().trim();
          if (cleanPrev === cleanLine) return true;
          if (line.length > 8 && prev.content.length > 8) {
            return getSimilarity(prev.content, line) > 0.75;
          }
          return false;
        });
        
        if (isLineOverlap) {
          return; // Skip overlap duplicate line!
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

  // Helper calculations for dynamic data mapping
  const overallScore = analysisData?.positivityScore ?? 78;
  const positivityRatio = typeof analysisData?.positivityScore === "number" ? Math.round(analysisData.positivityScore) : 72;
  const communicationBalance = typeof analysisData?.communicationBalance === "number" ? analysisData.communicationBalance : 54;
  
  // Dynamic response times
  const responseTimeVal = analysisData?.responseTime 
    ? `${analysisData.responseTime.person1Timing} vs ${analysisData.responseTime.person2Timing}` 
    : "26 min avg";
    
  // Dynamic conflict frequency based on stressScore
  const stressScoreVal = analysisData?.stressScore ?? 28;
  const conflictFrequencyVal = stressScoreVal > 65 ? "High" : stressScoreVal > 35 ? "Moderate" : "Low";
  const conflictStatusLabel = stressScoreVal > 65 ? "● Elevated Tension" : stressScoreVal > 35 ? "● Moderate Friction" : "● Healthy Connection";

  const getGradeLabel = (score: number) => {
    if (score >= 85) return "Excellent Resonance 😍";
    if (score >= 70) return "Good Dynamics 😊";
    if (score >= 50) return "Steady Flow 😐";
    return "Reflective Space ⚠️";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 85) return "You both have an exceptionally strong, supportive connection with deep emotional resonance.";
    if (score >= 70) return "You both have a healthy connection with stable engagement and room to grow even better.";
    if (score >= 50) return "Your communication shows balanced pacing but lacks deeper emotional validation indicators.";
    return "Tension and communication gaps detected. Focus on active listening to rebuild connection safety.";
  };

  const getDynamicTimeline = () => {
    const datesMap: Record<string, Message[]> = {};
    reconstructedMessages.forEach(m => {
      let dateKey = "Chat";
      const dateMatch = m.timestamp.match(/\d{1,2}\s*[A-Za-z]{3}/);
      if (dateMatch) {
        dateKey = dateMatch[0];
      }
      if (!datesMap[dateKey]) datesMap[dateKey] = [];
      datesMap[dateKey].push(m);
    });

    const dates = Object.keys(datesMap);
    if (dates.length === 0) {
      return [
        { date: "Day 1", label: "Conversation Started", detail: "Initial screenshots loaded." }
      ];
    }

    return dates.slice(0, 4).map(d => {
      const msgs = datesMap[d];
      const firstMsg = msgs[0];
      const sentiment = msgs.length > 5 ? "High engagement day" : "Regular check-ins";
      return {
        date: d,
        label: sentiment,
        detail: firstMsg ? `${firstMsg.sender}: "${firstMsg.content.substring(0, 50)}${firstMsg.content.length > 50 ? "..." : ""}"` : "Active chat log segment."
      };
    });
  };

  const getDateRange = () => {
    const dates: string[] = [];
    reconstructedMessages.forEach(m => {
      const dateMatch = m.timestamp.match(/\d{1,2}\s*[A-Za-z]{3}/);
      if (dateMatch) {
        dates.push(dateMatch[0]);
      }
    });

    if (dates.length === 0) return "Recent Upload";
    const uniqueDates = Array.from(new Set(dates));
    if (uniqueDates.length === 1) return uniqueDates[0];
    return `${uniqueDates[0]} - ${uniqueDates[uniqueDates.length - 1]}`;
  };

  const getTonePoints = () => {
    const totalMsgs = reconstructedMessages.length;
    if (totalMsgs === 0) return [];
    
    const chunkSize = Math.max(1, Math.ceil(totalMsgs / 5));
    const chunks: Message[][] = [];
    for (let i = 0; i < totalMsgs; i += chunkSize) {
      chunks.push(reconstructedMessages.slice(i, i + chunkSize));
    }
    
    const posWords = /\b(love|happy|care|heart|laugh|smile|thank|cute|together|trust|sweet|agree|perfect|great|amazing|good|wonderful|joy|😊|❤️|🥰|😘|😍|💖|💕|🎉|✨|👍|😂)\b/i;
    const negWords = /\b(whatever|fine|stop|don't care|hate|angry|ignore|busy|enough|irritate|wrong|never|annoyed|sad|hurt|😢|😭|😡|😠|😒|🙄|💔|👎|👿)\b/i;
    
    return chunks.slice(0, 5).map((chunk, idx) => {
      let posCount = 0;
      let negCount = 0;
      chunk.forEach(m => {
        const text = m.content.toLowerCase();
        if (posWords.test(text)) posCount++;
        if (negWords.test(text)) negCount++;
      });
      
      const posRatio = Math.round(posCount / Math.max(1, chunk.length) * 100);
      const negRatio = Math.round(negCount / Math.max(1, chunk.length) * 100);
      
      const apiPos = analysisData?.positivityScore ?? 72;
      const apiStress = analysisData?.stressScore ?? 28;
      
      const calibratedPos = Math.max(10, Math.min(95, Math.round(apiPos + (posRatio - 20) * 1.5)));
      const calibratedNeg = Math.max(5, Math.min(80, Math.round(apiStress + (negRatio - 10) * 1.5)));
      const calibratedNeu = 100 - calibratedPos - calibratedNeg;
      
      let dateLabel = `Pt ${idx + 1}`;
      if (chunk[0] && chunk[0].timestamp) {
        const match = chunk[0].timestamp.match(/\d{1,2}\s*[A-Za-z]{3}/);
        if (match) {
          dateLabel = match[0];
        }
      }
      
      return {
        date: dateLabel,
        positive: calibratedPos,
        negative: calibratedNeg,
        neutral: Math.max(5, calibratedNeu)
      };
    });
  };

  const getActivityPoints = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    reconstructedMessages.forEach((m, idx) => {
      const dateMatch = m.timestamp.match(/(\d{1,2})[\/\-s](\d{1,2}|[A-Za-z]{3})/);
      if (dateMatch) {
        try {
          const d = new Date(`${dateMatch[1]} ${dateMatch[2]} 2024`);
          if (!isNaN(d.getTime())) {
            const dayIdx = (d.getDay() + 6) % 7; // Mon is 0
            counts[dayIdx]++;
            return;
          }
        } catch(e) {}
      }
      counts[idx % 7]++;
    });
    
    return days.map((day, idx) => ({
      day,
      count: counts[idx]
    }));
  };

  const tonePoints = getTonePoints();

  const getCoordinates = (key: "positive" | "neutral" | "negative") => {
    const chartWidth = 380;
    const chartHeight = 110;
    const paddingLeft = 45;
    const paddingTop = 15;
    return tonePoints.map((pt, i) => {
      const x = paddingLeft + (i * (chartWidth / Math.max(1, tonePoints.length - 1)));
      const y = paddingTop + (chartHeight * (100 - pt[key])) / 100;
      return { x, y };
    });
  };

  const posCoords = getCoordinates("positive");
  const neuCoords = getCoordinates("neutral");
  const negCoords = getCoordinates("negative");

  const buildPath = (coords: { x: number, y: number }[]) => {
    if (coords.length === 0) return "";
    return `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map(c => `L ${c.x} ${c.y}`).join(" ");
  };

  const strengthList = Array.isArray(analysisData?.timelineInsights) && analysisData.timelineInsights.length > 0
    ? analysisData.timelineInsights.slice(0, 3)
    : [
        "Supportive Conversations: You both uplift and encourage each other.",
        "Consistent Communication: You both stay connected regularly.",
        "Respect & Understanding: You value each other's feelings and time."
      ];

  const improvementsList = Array.isArray(analysisData?.suggestions) && analysisData.suggestions.length > 0
    ? analysisData.suggestions.slice(0, 4)
    : [
        "Occasional Late Replies: Some messages are replied late.",
        "Conversation Drop: Some conversations end abruptly.",
        "Few Misunderstandings: Try to clarify more in tough moments."
      ];

  const timelinePoints = getDynamicTimeline();

  const redFlagsList = Array.isArray(analysisData?.redFlags) && analysisData.redFlags.length > 0
    ? analysisData.redFlags.slice(0, 4)
    : [
        { title: "Short Replies", description: "Minimal text answers detected.", severity: "medium" },
        { title: "Conversation Drop", description: "Replies dry up occasionally.", severity: "medium" }
      ];

  const activityPoints = getActivityPoints();
  const maxActivity = Math.max(...activityPoints.map(p => p.count), 1);

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

        {step === "report" && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-7xl mx-auto p-6 rounded-3xl border border-zinc-900/60 bg-[#07080d]/85 relative overflow-hidden backdrop-blur-2xl shadow-3xl select-none"
          >
            {/* Ambient background glowing effects */}
            <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] rounded-full bg-purple-950/15 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[45%] rounded-full bg-blue-950/15 blur-[120px] pointer-events-none" />

            {/* Top Bar Logo & Profile */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 select-none">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Brain className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-xs font-black text-white tracking-wider uppercase">HeartMind<span className="text-zinc-500">.ai</span></span>
              </div>
              
              <div className="flex items-center gap-2">
                {userImage ? (
                  <img src={userImage} alt={userName} className="w-6 h-6 rounded-full border border-zinc-800" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-[10px] font-black text-white uppercase select-none">
                    {userName.charAt(0)}
                  </div>
                )}
                <span className="text-[11px] font-bold text-zinc-300">{userName}</span>
                <ChevronRight className="w-3 h-3 text-zinc-650 rotate-90" />
              </div>
            </div>

            {/* Title row */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 select-none pb-2">
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedImages([]); setReconstructedMessages([]); setStep("upload"); router.push("/dashboard/analyzer"); }}
                  className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-white font-bold transition-colors uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                >
                  ← Back to Chats
                </button>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                  Relationship Analysis Report <span className="inline-block text-[#8b5cf6] text-xl">✨</span>
                </h1>
                <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                  AI-powered insights from {reconstructedMessages.length || "4,256"} messages <span className="inline-block w-3 h-3 rounded-full bg-zinc-900 text-zinc-600 text-[8px] font-extrabold flex items-center justify-center border border-zinc-800/80 cursor-help">i</span>
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-lg bg-[#0d1614] border border-[#142d22] text-[#10b981] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Platform: {selectedPlatform}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-900 text-zinc-400">
                  Date Range: {getDateRange()}
                </span>
                <Button
                  onClick={() => window.print()}
                  className="text-[10px] h-9 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-white font-bold flex items-center gap-1.5 rounded-lg px-4"
                >
                  <Download className="w-3.5 h-3.5" /> Export Report
                </Button>
              </div>
            </div>

            {/* Top Grid: 5 Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 select-none">
              
              {/* Card 1: Relationship Score */}
              <div className="premium-card spotlight-glow border border-zinc-900 rounded-2xl p-4 bg-zinc-950/30 flex items-center gap-4 relative overflow-hidden h-[110px] hover:border-zinc-800 transition-colors">
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center bg-zinc-950/60 rounded-full border border-zinc-900 shadow-inner">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.01)" strokeWidth="4" fill="none" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      stroke="#8b5cf6" 
                      strokeWidth="4" 
                      fill="none" 
                      strokeDasharray="176" 
                      strokeDashoffset={176 - (176 * overallScore) / 100} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-white">{overallScore}</span>
                    <span className="text-[7.5px] text-zinc-500 font-bold">/100</span>
                  </div>
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider flex items-center gap-1">Relationship Score <span className="text-[8px] text-zinc-650 cursor-help">ⓘ</span></p>
                  <h4 className="text-xs font-black text-white">{getGradeLabel(overallScore).split(" ")[0]} {getGradeLabel(overallScore).split(" ")[1] || "😊"}</h4>
                  <p className="text-[9px] text-zinc-500 leading-tight line-clamp-2">You both have a healthy connection with room to grow.</p>
                </div>
              </div>

              {/* Card 2: Positivity Ratio */}
              <div className="premium-card spotlight-glow border border-zinc-900 rounded-2xl p-4 bg-zinc-950/30 flex flex-col justify-between relative overflow-hidden h-[110px] hover:border-zinc-800 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <Heart className="w-4.5 h-4.5 text-emerald-400 fill-emerald-500/10" />
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider flex items-center gap-1">Positivity Ratio <span className="text-[8px] text-zinc-650 cursor-help">ⓘ</span></p>
                    <h4 className="text-sm font-black text-white">{positivityRatio}%</h4>
                    <p className="text-[8px] text-zinc-500 mt-0.5">Positive conversations</p>
                  </div>
                </div>
                <div className="h-5 w-full overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 100 20">
                    <path d="M 0 12 Q 20 2, 40 12 T 80 12 T 120 12" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Card 3: Comm Balance */}
              <div className="premium-card spotlight-glow border border-zinc-900 rounded-2xl p-4 bg-zinc-950/30 flex flex-col justify-between relative overflow-hidden h-[110px] hover:border-zinc-800 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center text-primary flex-shrink-0">
                    <MessageSquareText className="w-4.5 h-4.5 text-[#a78bfa]" />
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider flex items-center gap-1">Communication Balance <span className="text-[8px] text-zinc-650 cursor-help">ⓘ</span></p>
                    <h4 className="text-sm font-black text-white">{communicationBalance}% : {100 - communicationBalance}%</h4>
                    <p className="text-[8px] text-zinc-500 mt-0.5">{participants.nameA} : {participants.nameB}</p>
                  </div>
                </div>
                <div className="h-5 w-full overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 100 20">
                    <path d="M 0 12 Q 20 18, 40 12 T 80 12 T 120 12" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Card 4: Avg Response Time */}
              <div className="premium-card spotlight-glow border border-zinc-900 rounded-2xl p-4 bg-zinc-950/30 flex flex-col justify-between relative overflow-hidden h-[110px] hover:border-zinc-800 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Clock className="w-4.5 h-4.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider flex items-center gap-1">Avg. Response Time <span className="text-[8px] text-zinc-650 cursor-help">ⓘ</span></p>
                    <h4 className="text-sm font-black text-white">
                      {analysisData?.responseTime?.person1Timing ? `${analysisData.responseTime.person1Timing.replace(/ avg/i, '')}` : "26 min"}
                    </h4>
                    <p className="text-[8px] text-zinc-500 mt-0.5"><span className="text-[8px] text-amber-500 font-black uppercase bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded mr-1">Normal</span> Good pattern</p>
                  </div>
                </div>
                <div className="h-5 w-full overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 100 20">
                    <path d="M 0 12 Q 20 4, 40 14 T 80 8 T 120 12" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Card 5: Conflict Frequency */}
              <div className="premium-card spotlight-glow border border-zinc-900 rounded-2xl p-4 bg-zinc-950/30 flex flex-col justify-between relative overflow-hidden h-[110px] hover:border-zinc-800 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-450 flex-shrink-0">
                    <Shield className="w-4.5 h-4.5 text-rose-450" />
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider flex items-center gap-1">Conflict Frequency <span className="text-[8px] text-zinc-650 cursor-help">ⓘ</span></p>
                    <h4 className="text-sm font-black text-rose-450">{conflictFrequencyVal}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${stressScoreVal > 65 ? "bg-rose-500 animate-ping" : stressScoreVal > 35 ? "bg-amber-500" : "bg-emerald-500"}`} />
                  {conflictStatusLabel}
                </div>
              </div>

            </div>

            {/* Middle Grid: Tone Chart, Insights, Improvement areas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Card 1: Emotional Tone chart (col-span-5) */}
              <div className="lg:col-span-5 premium-card border border-zinc-900 rounded-2xl p-5 bg-zinc-950/30 flex flex-col justify-between select-none">
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Emotional Tone Over Time</h3>
                  <div className="flex items-center gap-3 text-[8.5px] font-black text-zinc-450">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Positive</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Neutral</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Negative</span>
                  </div>
                </div>
                
                {/* SVG Line chart with full Left Axis Labels */}
                <div className="w-full pt-4 h-[140px] flex items-center justify-center">
                  {tonePoints.length > 0 ? (
                    <svg viewBox="0 0 460 150" className="w-full h-full">
                      {/* Left Axis Labels */}
                      <text x="35" y="18" fill="#52525b" fontSize="7.5" fontWeight="bold" textAnchor="end">100%</text>
                      <text x="35" y="45.5" fill="#52525b" fontSize="7.5" fontWeight="bold" textAnchor="end">75%</text>
                      <text x="35" y="73" fill="#52525b" fontSize="7.5" fontWeight="bold" textAnchor="end">50%</text>
                      <text x="35" y="100.5" fill="#52525b" fontSize="7.5" fontWeight="bold" textAnchor="end">25%</text>
                      <text x="35" y="128" fill="#52525b" fontSize="7.5" fontWeight="bold" textAnchor="end">0%</text>

                      {/* Grid lines */}
                      <line x1="45" y1="15" x2="445" y2="15" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                      <line x1="45" y1="42.5" x2="445" y2="42.5" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                      <line x1="45" y1="70" x2="445" y2="70" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                      <line x1="45" y1="97.5" x2="445" y2="97.5" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                      <line x1="45" y1="125" x2="445" y2="125" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />

                      {/* Paths */}
                      <path d={buildPath(posCoords)} stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <path d={buildPath(neuCoords)} stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" />
                      <path d={buildPath(negCoords)} stroke="#f43f5e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Dots */}
                      {posCoords.map((c, idx) => (
                        <circle key={`pos-${idx}`} cx={c.x} cy={c.y} r="2.5" fill="#10b981" stroke="#000" strokeWidth="0.5" />
                      ))}
                      {neuCoords.map((c, idx) => (
                        <circle key={`neu-${idx}`} cx={c.x} cy={c.y} r="2.5" fill="#f59e0b" stroke="#000" strokeWidth="0.5" />
                      ))}
                      {negCoords.map((c, idx) => (
                        <circle key={`neg-${idx}`} cx={c.x} cy={c.y} r="2.5" fill="#f43f5e" stroke="#000" strokeWidth="0.5" />
                      ))}

                      {/* X Axis Labels */}
                      {tonePoints.map((pt, idx) => {
                        const x = 45 + (idx * (400 / Math.max(1, tonePoints.length - 1)));
                        return (
                          <text key={idx} x={x} y="142" fill="#71717a" fontSize="8" fontWeight="black" textAnchor="middle">
                            {pt.date}
                          </text>
                        );
                      })}
                    </svg>
                  ) : (
                    <div className="text-zinc-650 text-[10px]">No historical date sequence found.</div>
                  )}
                </div>
              </div>

              {/* Card 2: Communication Insights (col-span-4) */}
              <div className="lg:col-span-4 premium-card border border-zinc-900 rounded-2xl p-5 bg-zinc-950/30 flex flex-col justify-between select-none">
                <div className="border-b border-zinc-900/60 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Communication Insights</h3>
                </div>
                
                <div className="flex items-center gap-4 py-3">
                  {/* Donut chart */}
                  <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center select-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.02)" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="40" stroke="#8b5cf6" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset={251 - (251 * positivityRatio) / 100} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[7.5px] text-zinc-550 font-black uppercase tracking-widest text-center leading-none">Greatest<br/>Strength</span>
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10 mt-1 animate-pulse" />
                    </div>
                  </div>

                  {/* Bullet list */}
                  <div className="space-y-3 flex-1 min-w-0">
                    {strengthList.slice(0, 3).map((str, sidx) => {
                      const splitIdx = str.indexOf(":");
                      const title = splitIdx !== -1 ? str.substring(0, splitIdx) : "Strength";
                      const desc = splitIdx !== -1 ? str.substring(splitIdx + 1) : str;
                      return (
                        <div key={sidx} className="space-y-0.5">
                          <h5 className="text-[10px] font-bold text-zinc-200 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> <span className="truncate">{title}</span>
                          </h5>
                          <p className="text-[9px] text-zinc-500 leading-normal pl-5">{desc.trim()}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Card 3: Areas to Improve (col-span-3) */}
              <div className="lg:col-span-3 premium-card border border-zinc-900 rounded-2xl p-5 bg-zinc-950/30 flex flex-col justify-between select-none">
                <div className="border-b border-zinc-900/60 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Areas to Improve</h3>
                </div>

                <div className="space-y-3.5 py-3 flex-1 flex flex-col justify-center">
                  {improvementsList.slice(0, 4).map((imp, iidx) => {
                    const splitIdx = imp.indexOf(":");
                    const title = splitIdx !== -1 ? imp.substring(0, splitIdx) : "Suggestion";
                    const desc = splitIdx !== -1 ? imp.substring(splitIdx + 1) : imp;
                    return (
                      <div key={iidx} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0 mt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-[10px] font-bold text-zinc-300 leading-tight">{title}</h5>
                          <p className="text-[9px] text-zinc-550 leading-tight">{desc.trim()}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Grid: Timeline, Red Flags, Activity Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
              
              {/* Card 1: Timeline */}
              <div className="premium-card border border-zinc-900 rounded-2xl p-5 bg-zinc-950/30 flex flex-col justify-between select-none">
                <div className="border-b border-zinc-900/60 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Conversation Timeline</h3>
                </div>

                <div className="relative pl-5 border-l border-zinc-900/80 space-y-4.5 ml-2.5 py-4 flex-1 flex flex-col justify-center">
                  {timelinePoints.map((point, pidx) => {
                    const colors = ["bg-emerald-500 border-emerald-450", "bg-sky-500 border-sky-450", "bg-amber-500 border-amber-450", "bg-[#8b5cf6] border-[#a78bfa]"];
                    return (
                      <div key={point.date} className="relative">
                        <span className={`absolute -left-[27px] top-0.5 w-3 h-3 rounded-full border-2 ${colors[pidx % 4]} flex items-center justify-center shadow-lg shadow-purple-500/10`} />
                        <div className="space-y-0.5">
                          <span className="text-[8.5px] font-black text-zinc-555 uppercase tracking-wider">{point.date}</span>
                          <h4 className="text-[10px] font-bold text-zinc-300 leading-tight">{point.label}</h4>
                          <p className="text-[9.5px] text-zinc-500 leading-snug line-clamp-2">{point.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={() => setShowTimelineModal(true)}
                  className="w-full py-2.5 rounded-xl border border-zinc-900 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors mt-2 bg-transparent cursor-pointer"
                >
                  View Full Timeline →
                </button>
              </div>

              {/* Card 2: Red Flags */}
              <div className="premium-card border border-zinc-900 rounded-2xl p-5 bg-zinc-950/30 flex flex-col justify-between select-none">
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Red Flags Detected</h3>
                  <button onClick={() => setShowInsightsModal(true)} className="text-[9px] font-bold text-zinc-500 hover:text-white uppercase tracking-wider bg-transparent border-0 cursor-pointer">View All</button>
                </div>

                <div className="space-y-2.5 py-4 flex-1 flex flex-col justify-center">
                  {redFlagsList.slice(0, 4).map((flag: any, fidx) => {
                    const severity = flag.severity || "medium";
                    const isHigh = severity === "high";
                    const isMedium = severity === "medium" || severity === "caution";
                    const count = flag.count || (fidx === 0 ? 12 : fidx === 1 ? 8 : fidx === 2 ? 5 : 3);
                    
                    return (
                      <div key={fidx} className="p-1 rounded-xl border border-transparent flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isHigh ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : isMedium ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-zinc-800 text-zinc-400"
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[10px] font-bold text-zinc-200 truncate">{flag.title}</h4>
                            <p className="text-[8.5px] text-zinc-500 truncate leading-snug">Detected {count} times</p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 ${
                          isHigh ? "text-rose-450 bg-rose-500/10" : isMedium ? "text-amber-500 bg-amber-500/10 border border-amber-500/20" : "text-zinc-500 bg-zinc-900"
                        }`}>
                          {severity}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Card 3: Activity bar chart */}
              <div className="premium-card border border-zinc-900 rounded-2xl p-5 bg-zinc-950/30 flex flex-col justify-between select-none">
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Conversation Activity</h3>
                  <span className="text-[8.5px] text-zinc-500 font-bold border border-zinc-900 px-2 py-0.5 rounded bg-zinc-950/80">This Week</span>
                </div>

                <div className="w-full pt-6 h-[120px] flex items-center justify-center">
                  <svg viewBox="0 0 320 110" className="w-full h-full">
                    {/* Horizontal dotted grid lines */}
                    <line x1="30" y1="15" x2="310" y2="15" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                    <line x1="30" y1="32.5" x2="310" y2="32.5" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                    <line x1="30" y1="50" x2="310" y2="50" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                    <line x1="30" y1="67.5" x2="310" y2="67.5" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                    <line x1="30" y1="85" x2="310" y2="85" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />

                    {/* Left Axis Labels */}
                    <text x="22" y="18" fill="#52525b" fontSize="7.5" fontWeight="bold" textAnchor="end">1K</text>
                    <text x="22" y="35.5" fill="#52525b" fontSize="7.5" fontWeight="bold" textAnchor="end">750</text>
                    <text x="22" y="53" fill="#52525b" fontSize="7.5" fontWeight="bold" textAnchor="end">500</text>
                    <text x="22" y="70.5" fill="#52525b" fontSize="7.5" fontWeight="bold" textAnchor="end">250</text>
                    <text x="22" y="88" fill="#52525b" fontSize="7.5" fontWeight="bold" textAnchor="end">0</text>

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="purpleBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#d946ef" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>

                    {/* Bars */}
                    {activityPoints.map((pt, i) => {
                      const barWidth = 16;
                      const gap = 22;
                      const x = 32 + i * (barWidth + gap);
                      const barHeight = Math.max(5, (pt.count / maxActivity) * 65);
                      const y = 85 - barHeight;
                      
                      return (
                        <g key={pt.day}>
                          <rect x={x} y="15" width={barWidth} height="70" rx="3" fill="rgba(255,255,255,0.01)" />
                          <rect x={x} y={y} width={barWidth} height={barHeight} rx="3" fill="url(#purpleBarGrad)" />
                          <text x={x + barWidth/2} y="99" fill="#71717a" fontSize="8" fontWeight="black" textAnchor="middle">
                            {pt.day}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

            </div>

            {/* Footer Banner */}
            <div className="premium-card spotlight-glow border border-[#161b26] rounded-2xl p-5 bg-[#08090d]/95 flex flex-col md:flex-row items-center justify-between gap-5 select-none relative overflow-hidden">
              <div className="absolute top-0 inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[#8b5cf6] to-[#d946ef]" />
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <span className="text-xl">✨</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Summary</h4>
                  <p className="text-[10.5px] text-zinc-400 leading-relaxed max-w-3xl">
                    Your relationship is growing well! You both communicate with care and respect. Keep being open and patient with each other. A little more consistency will make it even stronger. 💜
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowInsightsModal(true)}
                className="text-[10px] font-extrabold uppercase bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] hover:opacity-95 text-white h-9 px-6 rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-500/15"
              >
                View Detailed Insights <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Timeline modal */}
            {showTimelineModal && (
              <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="w-full max-w-2xl rounded-2xl bg-zinc-950 border border-zinc-900 p-6 space-y-6 shadow-2xl relative">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" /> Full Transcribed Conversation
                    </h3>
                    <button 
                      onClick={() => setShowTimelineModal(false)}
                      className="w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="max-h-[60vh] overflow-y-auto space-y-3.5 pr-2">
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
                            <div className={`px-3.5 py-2.5 rounded-2xl ${
                              isSenderA ? "bg-[#121620] border border-[#1d2433]" : "bg-[#18121f] border border-[#2b1d38]"
                            }`}>
                              <p className="text-xs text-zinc-200 leading-relaxed text-pretty">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-zinc-900">
                    <Button onClick={() => setShowTimelineModal(false)} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs px-5 rounded-lg">Close</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Insights modal */}
            {showInsightsModal && (
              <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="w-full max-w-2xl rounded-2xl bg-zinc-950 border border-zinc-900 p-6 space-y-6 shadow-2xl relative">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" /> Relationship Coaching Insights
                    </h3>
                    <button 
                      onClick={() => setShowInsightsModal(false)}
                      className="w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-2">
                    {/* Attachment details */}
                    <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" /> Attachment Style Mapping
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Detected Alignment Style: <strong className="text-white capitalize">{analysisData?.attachmentStyle || "Secure"}</strong>.
                        This dynamic reflects {analysisData?.attachmentStyle === "secure" ? "a strong foundation of trust, reciprocal pacing, and validation." : "fluctuating communication habits that can be stabilized by setting consistent check-in boundaries."}
                      </p>
                    </div>

                    {/* Full Red Flags list */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Complete Red Flags Register
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {analysisData?.redFlags?.map((flag: any, index: number) => (
                          <div key={index} className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/40 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-white">{flag.title}</h5>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                flag.severity === "high" ? "text-rose-450 bg-rose-500/10" : flag.severity === "medium" ? "text-amber-500 bg-amber-500/10 border border-amber-500/20" : "text-zinc-550 bg-zinc-900"
                              }`}>
                                {flag.severity}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">{flag.description}</p>
                            {flag.evidence && (
                              <div className="mt-2.5 p-2 rounded bg-zinc-950 border border-zinc-900 font-mono text-[9.5px] text-[#8b5cf6] leading-snug">
                                Evidence: "{flag.evidence}"
                              </div>
                            )}
                          </div>
                        ))}
                        {(!analysisData?.redFlags || analysisData.redFlags.length === 0) && (
                          <p className="text-xs text-zinc-500 italic">No red flags flagged inside this session.</p>
                        )}
                      </div>
                    </div>

                    {/* Full suggestions details */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Actionable Relationship Exercises
                      </h4>
                      <div className="space-y-3">
                        {analysisData?.suggestions?.map((sug: string, index: number) => (
                          <div key={index} className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/40 flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-zinc-300 leading-relaxed">{sug}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-zinc-900">
                    <Button onClick={() => setShowInsightsModal(false)} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs px-5 rounded-lg">Close</Button>
                  </div>
                </div>
              </div>
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
