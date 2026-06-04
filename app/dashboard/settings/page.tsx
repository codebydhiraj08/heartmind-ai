"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Mail,
  Bell,
  Shield,
  Activity,
  Check,
  Loader2,
  AlertCircle,
  Calendar,
  ChevronRight,
  HelpCircle,
  Heart,
  Camera,
  Save,
  Crown,
  Sparkles,
  Compass,
  MessageSquare,
  Volume2,
  Database,
  RefreshCw,
  AlertTriangle,
  Terminal,
  CheckCircle2,
  X,
  Lock,
  Send
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/use-subscription"
import { sendClientEvent } from "@/lib/analytics"

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const { subscription, usage, loading: subLoading, refreshSubscription } = useSubscription()

  // Active settings tab state
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "subscription" | "diagnostics">("profile")

  // Support & Resources modal states
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [isScienceModalOpen, setIsScienceModalOpen] = useState(false)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  
  // Support ticket form states
  const [ticketCategory, setTicketCategory] = useState("emotional")
  const [ticketMessage, setTicketMessage] = useState("")
  const [ticketStatus, setTicketStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [lastGeneratedTicketId, setLastGeneratedTicketId] = useState("")

  // Privacy sandbox states
  const [inputText, setInputText] = useState("")
  const [hashedText, setHashedText] = useState("")

  const computeHash = async (text: string) => {
    if (!text) {
      setHashedText("")
      return
    }
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      setHashedText(hashHex)
    } catch (e) {
      let hash = 0
      for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) - hash + text.charCodeAt(i)
        hash |= 0
      }
      setHashedText("simulated_hash_" + Math.abs(hash).toString(16))
    }
  }

  const getDynamicAssessment = (category: string, message: string) => {
    const msgLower = message.toLowerCase();
    
    if (category === "emotional") {
      let concernDetail = "your relationship dynamics";
      if (msgLower.includes("red flag") || msgLower.includes("pattern")) {
        concernDetail = "your red flag patterns not showing up";
      } else if (msgLower.includes("fight") || msgLower.includes("argument") || msgLower.includes("conflict")) {
        concernDetail = "the conflict escalation you are facing";
      } else if (msgLower.includes("voice") || msgLower.includes("speech") || msgLower.includes("audio")) {
        concernDetail = "your vocal analysis concerns";
      }
      return `“Understood. Relational issues like ${concernDetail} can feel extremely heavy. Our coach team is reviewing this concern and queueing a special prompt breakdown tailored for your attachment style.”`;
    }
    
    if (category === "billing") {
      let billingDetail = "your plan subscription";
      if (msgLower.includes("stripe") || msgLower.includes("razorpay") || msgLower.includes("payment")) {
        billingDetail = "your payment transaction sync";
      } else if (msgLower.includes("cancel") || msgLower.includes("refund")) {
        billingDetail = "your cancellation request";
      } else if (msgLower.includes("pro") || msgLower.includes("premium") || msgLower.includes("trial")) {
        billingDetail = "your upgrade to premium status";
      }
      return `“We've prioritized your request regarding ${billingDetail}. If you recently processed a transaction or activated a trial, sync takes 2-3 minutes. We are checking payment logs.”`;
    }
    
    if (category === "bug") {
      let bugDetail = "the interface behavior";
      if (msgLower.includes("loading") || msgLower.includes("slow") || msgLower.includes("freeze")) {
        bugDetail = "loading speed and freeze issues";
      } else if (msgLower.includes("voice") || msgLower.includes("record") || msgLower.includes("microphone")) {
        bugDetail = "voice recording metrics processing";
      } else if (msgLower.includes("chat") || msgLower.includes("upload") || msgLower.includes("export")) {
        bugDetail = "chat history export parsing";
      } else if (msgLower.includes("red flag") || msgLower.includes("not working") || msgLower.includes("pattern") || msgLower.includes("woring")) {
        bugDetail = "red flag detection displaying correctly";
      }
      return `“Diagnostic markers logged. The engineering telemetry for '${bugDetail}' was initialized. Our team is addressing this concern.”`;
    }
    
    let feedbackDetail = "our features";
    if (msgLower.includes("ui") || msgLower.includes("design") || msgLower.includes("layout")) {
      feedbackDetail = "the layout aesthetics and design settings";
    } else if (msgLower.includes("voice") || msgLower.includes("ai")) {
      feedbackDetail = "voice models and AI coaching features";
    }
    return `“Feedback registered regarding ${feedbackDetail}. We base 100% of our updates on direct user suggestions like yours. Thank you for helping us improve.”`;
  };



  // Diagnostics Tab states
  const [diagLoading, setDiagLoading] = useState(false)
  const [diagRetrying, setDiagRetrying] = useState(false)
  const [diagData, setDiagData] = useState<any>(null)
  const [diagError, setDiagError] = useState<string | null>(null)

  // Fetch diagnostics details from server
  const fetchDiagnostics = async (isRetry = false) => {
    if (isRetry) {
      setDiagRetrying(true)
    } else {
      setDiagLoading(true)
    }
    setDiagError(null)

    try {
      const res = await fetch(`/api/test-db${isRetry ? "?retry=true" : ""}`)
      const data = await res.json()
      setDiagData(data)
      if (!res.ok) {
        throw new Error(data.error || "Failed to load database diagnostics.")
      }
    } catch (err: any) {
      setDiagError(err.message || "An unexpected diagnostics error occurred.")
    } finally {
      setDiagLoading(false)
      setDiagRetrying(false)
    }
  }

  useEffect(() => {
    if (activeTab === "diagnostics") {
      fetchDiagnostics(false)
    }
  }, [activeTab])

  // Form states - Personal Profile
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [customAvatarUrl, setCustomAvatarUrl] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [age, setAge] = useState("")

  // Auto-calculates age dynamically based on birthdate selection to provide premium user experience
  const handleBirthdateChange = (dateString: string) => {
    setBirthdate(dateString)
    if (dateString) {
      const today = new Date()
      const birthDate = new Date(dateString)
      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
      if (calculatedAge >= 0) {
        setAge(calculatedAge.toString())
      }
    }
  }

  // Status states
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form states - AI Psychology & Preferences
  const [coachTone, setCoachTone] = useState("empathetic")
  const [banterLevel, setBanterLevel] = useState("medium")
  const [conflictBaseline, setConflictBaseline] = useState("calm")
  const [reassuranceBaseline, setReassuranceBaseline] = useState("standard")
  const [partnerName, setPartnerName] = useState("")
  const [relationshipStatus, setRelationshipStatus] = useState("dating")
  const [anniversaryDate, setAnniversaryDate] = useState("")
  const [tipsEnabled, setTipsEnabled] = useState(true)
  const [analysisAlerts, setAnalysisAlerts] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [prefSaved, setPrefSaved] = useState(false)
  const [prefSaving, setPrefSaving] = useState(false)

  // Sync user details from NextAuth session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
      if (session.user.image) {
        if (session.user.image.startsWith("preset-")) {
          // Keep legacy presets empty in text URL field so they can paste a new custom URL
          setCustomAvatarUrl("")
        } else {
          setCustomAvatarUrl(session.user.image)
        }
      }
      setBirthdate((session.user as any).birthdate || "")
      setAge((session.user as any).age !== undefined && (session.user as any).age !== null ? String((session.user as any).age) : "")
      
      // Sync AI and Relationship preferences from NextAuth session
      setCoachTone((session.user as any).coachTone || "empathetic")
      setPartnerName((session.user as any).partnerName || "")
      setRelationshipStatus((session.user as any).relationshipStatus || "dating")
      setAnniversaryDate((session.user as any).anniversaryDate || "")
      setTipsEnabled((session.user as any).tipsEnabled !== false)
      setAnalysisAlerts((session.user as any).analysisAlerts !== false)
      setMarketingEmails((session.user as any).marketingEmails === true)
      setBanterLevel((session.user as any).banterLevel || "medium")
      setConflictBaseline((session.user as any).conflictBaseline || "calm")
      setReassuranceBaseline((session.user as any).reassuranceBaseline || "standard")
    }
  }, [session])

  // Handle personal profile update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage(null)

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          image: customAvatarUrl,
          birthdate,
          age: age ? parseInt(age) : null
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile.")
      }

      // Update Client Session with lightweight URL to prevent JWT cookie size crash
      const sessionImageUrl = customAvatarUrl.startsWith("data:image/")
        ? `/api/user/profile-image?v=${new Date().getTime()}`
        : customAvatarUrl;

      await updateSession({
        name,
        email,
        image: sessionImageUrl,
        birthdate,
        age: age ? parseInt(age) : null,
        user: {
          name,
          email,
          image: sessionImageUrl,
          birthdate,
          age: age ? parseInt(age) : null
        }
      })

      setProfileMessage({
        type: "success",
        text: "Your profile details have been saved successfully!"
      })
      
      sendClientEvent("profile_updated")
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "An unexpected error occurred." })
    } finally {
      setProfileSaving(false)
    }
  }

  // Handle saving AI psychology preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    setPrefSaved(false)
    setPrefSaving(true)

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          coachTone,
          partnerName,
          relationshipStatus,
          anniversaryDate,
          tipsEnabled,
          analysisAlerts,
          marketingEmails,
          banterLevel,
          conflictBaseline,
          reassuranceBaseline,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update preferences.")
      }

      await updateSession({
        name,
        email,
        image: session?.user?.image || "",
        birthdate,
        age: age ? parseInt(age) : null,
        coachTone,
        partnerName,
        relationshipStatus,
        anniversaryDate,
        tipsEnabled,
        analysisAlerts,
        marketingEmails,
        banterLevel,
        conflictBaseline,
        reassuranceBaseline,
        user: {
          name,
          email,
          image: session?.user?.image || "",
          birthdate,
          age: age ? parseInt(age) : null,
          coachTone,
          partnerName,
          relationshipStatus,
          anniversaryDate,
          tipsEnabled,
          analysisAlerts,
          marketingEmails,
          banterLevel,
          conflictBaseline,
          reassuranceBaseline,
        }
      })

      setPrefSaved(true)
      sendClientEvent("preferences_updated", { coachTone, relationshipStatus })

      setTimeout(() => {
        setPrefSaved(false)
      }, 3000)
    } catch (err: any) {
      console.error("Preferences Update Error:", err)
    } finally {
      setPrefSaving(false)
    }
  }

  const getInitials = (userName: string) => {
    if (!userName) return "U"
    return userName.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase()
  }

  // Get active avatar background/preview
  const renderAvatarPreview = () => {
    if (customAvatarUrl && (customAvatarUrl.startsWith("http") || customAvatarUrl.startsWith("data:image/") || customAvatarUrl.startsWith("/api/"))) {
      return <img key={customAvatarUrl} src={customAvatarUrl} alt="Profile photo" className="w-full h-full object-cover animate-fade-in" />
    }
    
    // Legacy preset check for background fallback if custom URL is empty
    if (session?.user?.image && session.user.image.startsWith("preset-")) {
      const presetBgMap: Record<string, string> = {
        "preset-heart": "bg-gradient-to-br from-pink-500 to-rose-600",
        "preset-mind": "bg-gradient-to-br from-violet-600 to-indigo-700",
        "preset-aura": "bg-gradient-to-br from-emerald-400 to-teal-600",
        "preset-sunset": "bg-gradient-to-br from-amber-500 to-orange-600",
        "preset-cosmic": "bg-gradient-to-br from-fuchsia-600 to-primary"
      }
      const bgClass = presetBgMap[session.user.image] || "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
      return (
        <div className={`w-full h-full flex items-center justify-center ${bgClass}`}>
          <span className="text-2xl font-bold text-white uppercase">{getInitials(name)}</span>
        </div>
      )
    }

    // Default premium gradient fallback
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <span className="text-2xl font-bold text-white uppercase">{getInitials(name)}</span>
      </div>
    )
  }

  // File input upload handler (Converts local file to base64 Data URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) { // 3MB limit for Base64 sizes
        setProfileMessage({ type: "error", text: "Image size must be smaller than 3MB." })
        return
      }
      
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        const base64String = uploadEvent.target?.result as string
        setCustomAvatarUrl(base64String)
        setProfileMessage(null) // clear any errors
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up select-none pb-12">
      
      {/* Settings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-bold tracking-wider uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Account & Preference Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Configure your AI Coach tone, update credentials, manage your billing tier, and structure relationship analytics.
          </p>
        </div>
      </div>

      {/* Tabs Navigation Container */}
      <div className="flex border-b border-white/[0.06] gap-1 overflow-x-auto pb-px">
        {[
          { id: "profile", label: "👤 Profile details", icon: User },
          { id: "preferences", label: "🧠 AI & Relationship Preferences", icon: Heart },
          { id: "subscription", label: "👑 Plan & Billing Info", icon: Crown }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider relative transition-all duration-300 border-b-2 whitespace-nowrap ${
                isActive 
                  ? "text-primary border-primary font-bold" 
                  : "text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-white/[0.01]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Main Settings Tabs Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 gap-8"
        >
          
          {/* ========================================================== */}
          {/* TAB 1: PERSONAL PROFILE                                    */}
          {/* ========================================================== */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Profile Image & Direct Uploader (Left / Top Column) */}
              <div className="lg:col-span-4 rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-6 space-y-6 flex flex-col items-center glass-strong">
                <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 self-start w-full">
                  <Camera className="w-4 h-4 text-zinc-400" />
                  Your Profile Picture
                </h3>

                <div className="flex flex-col items-center justify-center py-2 space-y-4 w-full">
                  {/* Interactive Selected Photo Preview (Acts as upload label trigger) */}
                  <label 
                    htmlFor="avatar-file-upload" 
                    className="relative group w-24 h-24 rounded-full flex items-center justify-center shadow-lg border border-white/10 overflow-hidden bg-zinc-900 cursor-pointer hover:border-primary/50 transition-all duration-300"
                    title="Click to change photo"
                  >
                    {renderAvatarPreview()}
                    {/* Visual Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1 text-white">
                      <Camera className="w-4 h-4" />
                      <span className="text-[8px] font-bold uppercase tracking-wider">Upload</span>
                    </div>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Live Preview</span>
                </div>

                {/* Direct Upload Trigger Button */}
                <div className="w-full flex justify-center pb-2">
                  <label
                    htmlFor="avatar-file-upload"
                    className="cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs text-primary font-bold tracking-wider uppercase bg-primary/10 hover:bg-primary/20 px-4 py-2.5 rounded-xl border border-primary/20 transition-all duration-300 w-full text-center"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Select From Device
                  </label>
                  <input
                    id="avatar-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

              </div>

              {/* Form Input Section (Right Column) */}
              <div className="lg:col-span-8 rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-6 glass-strong">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                      <User className="w-4 h-4 text-zinc-400" />
                      Personal Information
                    </h3>

                    {/* Notification Message */}
                    <AnimatePresence>
                      {profileMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                            profileMessage.type === "success" 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          }`}
                        >
                          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                          <span className="font-semibold leading-relaxed">{profileMessage.text}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Inputs Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Full Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full text-xs bg-zinc-950/60 border border-white/[0.06] rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all"
                          />
                          <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Email Address</label>
                          {(session?.user as any)?.emailVerified ? (
                            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 select-none">
                              Verified
                            </span>
                          ) : (
                            <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 select-none">
                              Pending verification
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            placeholder="your.email@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-xs bg-zinc-950/60 border border-white/[0.06] rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all"
                          />
                          <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Birthdate & Age Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Birthdate</label>
                        <div className="relative">
                          <input
                            type="date"
                            placeholder="YYYY-MM-DD"
                            value={birthdate}
                            onChange={(e) => handleBirthdateChange(e.target.value)}
                            className="w-full text-xs bg-zinc-950/60 border border-white/[0.06] rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          />
                          <Calendar className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Age (Auto-calculated)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="150"
                            placeholder="e.g. 25"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full text-xs bg-zinc-950/60 border border-white/[0.06] rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          />
                          <Activity className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={profileSaving}
                      className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-5 py-2.5 h-10 rounded-xl flex items-center gap-2 border border-white/5 shadow-md shadow-primary/10 transition-all duration-300"
                    >
                      {profileSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          Saving Profile...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save Profile Details
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: AI PSYCHOLOGY & PREFERENCES                         */}
          {/* ========================================================== */}
          {activeTab === "preferences" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Preferences Form (Left Column) */}
              <div className="lg:col-span-8 rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-6 space-y-6 glass-strong">
                <form onSubmit={handleSavePreferences} className="space-y-6">
                  
                  {/* AI Personality Selector */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                      <Compass className="w-4 h-4 text-zinc-400" />
                      AI Coach Personality & Tone
                    </h3>
                    <p className="text-[10px] text-zinc-400">Configure how the relationship coach frames dialogues, advice, and tips.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: "empathetic", label: "❤️ Empathetic Partner", desc: "Gentle, supportive, warm. Maximizes emotional support.", icon: Heart },
                        { id: "psychologist", label: "🔬 Clinical Psychologist", desc: "Analytical, clinical terms, structural. Evaluates behavior loops.", icon: Activity },
                        { id: "mediator", label: "🕊️ Soft Mediator", desc: "Peaceful, conversational neutralizer. Minimizes relationship tension.", icon: MessageSquare },
                        { id: "direct", label: "⚡ Truth-Teller (Direct)", desc: "Blunt, honest, fast. Highlights communication errors immediately.", icon: Volume2 }
                      ].map((preset) => {
                        const PIcon = preset.icon
                        const isToneSelected = coachTone === preset.id
                        return (
                          <div
                            key={preset.id}
                            onClick={() => setCoachTone(preset.id)}
                            className={`rounded-xl border p-4 cursor-pointer transition-all duration-300 relative overflow-hidden flex items-start gap-3 ${
                              isToneSelected 
                                ? "bg-primary/5 border-primary shadow-md shadow-primary/5" 
                                : "bg-zinc-950/50 border-white/[0.04] hover:border-white/[0.08]"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                              isToneSelected ? "bg-primary/10 border-primary/20 text-primary" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}>
                              <PIcon className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <span className={`text-xs font-bold block ${isToneSelected ? "text-primary" : "text-zinc-200"}`}>{preset.label}</span>
                              <span className="text-[9px] text-zinc-400 leading-normal block">{preset.desc}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Relationship Baseline Calibration */}
                  <div className="space-y-4 pt-4 border-t border-white/[0.04]">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                      <Shield className="w-4 h-4 text-zinc-400" />
                      Relationship Baseline Calibration
                    </h3>
                    <p className="text-[10px] text-zinc-400">Calibrate how the AI should interpret your conversational dynamics. Sarcastic banter or heated pacing won't trigger false flags if configured below.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Playfulness / Banter Level */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Playful Banter & Teasing Level
                        </label>
                        <div className="flex gap-2">
                          {[
                            { id: "low", label: "Low 🌿", desc: "Literal tone" },
                            { id: "medium", label: "Medium ⚖️", desc: "Balanced humor" },
                            { id: "high", label: "High 🎭", desc: "Frequent teasing" }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setBanterLevel(opt.id)}
                              className={`flex-1 p-2.5 rounded-xl border text-center transition-all ${
                                banterLevel === opt.id
                                  ? "bg-primary/10 border-primary text-white text-[11px] font-bold"
                                  : "bg-zinc-950/40 border-white/[0.03] text-zinc-400 text-[10px] hover:border-white/[0.06]"
                              }`}
                            >
                              <span className="block">{opt.label}</span>
                              <span className="block text-[8px] opacity-60 leading-normal">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Conflict Baseline */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Normal Conflict Pacing Style
                        </label>
                        <div className="flex gap-2">
                          {[
                            { id: "calm", label: "Calm 🍃", desc: "Low voice/text shifts" },
                            { id: "expressive", label: "Expressive 📣", desc: "Excitable, vocal" },
                            { id: "heated", label: "Heated 🔥", desc: "High emotion disputes" }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setConflictBaseline(opt.id)}
                              className={`flex-1 p-2.5 rounded-xl border text-center transition-all ${
                                conflictBaseline === opt.id
                                  ? "bg-primary/10 border-primary text-white text-[11px] font-bold"
                                  : "bg-zinc-950/40 border-white/[0.03] text-zinc-400 text-[10px] hover:border-white/[0.06]"
                              }`}
                            >
                              <span className="block">{opt.label}</span>
                              <span className="block text-[8px] opacity-60 leading-normal">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reassurance Baseline */}
                      <div className="space-y-2 col-span-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Reassurance & Vulnerability Interpretation
                        </label>
                        <div className="flex gap-2">
                          {[
                            { id: "standard", label: "Standard ⚖️", desc: "Default codependency scans" },
                            { id: "vulnerable", label: "Vulnerable (Recommended) 🍃", desc: "Frames reassurance as healthy vulnerability & deep attachment" },
                            { id: "strict", label: "Strict 🎯", desc: "Strictly flags validation seeking" }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setReassuranceBaseline(opt.id)}
                              className={`flex-1 p-2.5 rounded-xl border text-center transition-all ${
                                reassuranceBaseline === opt.id
                                  ? "bg-primary/10 border-primary text-white text-[11px] font-bold"
                                  : "bg-zinc-950/40 border-white/[0.03] text-zinc-400 text-[10px] hover:border-white/[0.06]"
                              }`}
                            >
                              <span className="block">{opt.label}</span>
                              <span className="block text-[8px] opacity-60 leading-normal">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Relationship Information */}
                  <div className="space-y-4 pt-4 border-t border-white/[0.04]">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                      <Heart className="w-4 h-4 text-zinc-400" />
                      Relationship Context (Dynamic personalization)
                    </h3>
                    <p className="text-[10px] text-zinc-400">Context used server-side by AI engines to draft relationship suggestions and tips.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Partner's Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah"
                          value={partnerName}
                          onChange={(e) => setPartnerName(e.target.value)}
                          className="w-full text-xs bg-zinc-950/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Relationship Status</label>
                        <select
                          value={relationshipStatus}
                          onChange={(e) => setRelationshipStatus(e.target.value)}
                          className="w-full text-xs bg-zinc-950/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all select-none appearance-none"
                        >
                          <option value="dating">Dating</option>
                          <option value="married">Married</option>
                          <option value="long-distance">Long Distance</option>
                          <option value="complicated">It's Complicated</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Anniversary Date</label>
                        <input
                          type="date"
                          value={anniversaryDate}
                          onChange={(e) => setAnniversaryDate(e.target.value)}
                          className="w-full text-xs bg-zinc-950/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Settings Saver Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                    <div>
                      <AnimatePresence>
                        {prefSaved && (
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            AI Preferences Saved Successfully!
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Button
                      type="submit"
                      disabled={prefSaving}
                      className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-5 py-2.5 h-10 rounded-xl flex items-center gap-2 border border-white/5 shadow-md shadow-primary/10 transition-all duration-300"
                    >
                      {prefSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          Saving Preferences...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Toggles Panel (Right Column) */}
              <div className="lg:col-span-4 rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-6 space-y-6 glass-strong">
                <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                  <Bell className="w-4 h-4 text-zinc-400" />
                  Notifications & Alerts
                </h3>

                <div className="space-y-5">
                  {[
                    {
                      title: "💡 Daily Relationship Tips",
                      desc: "Display customizable coaching prompts directly in dashboard drawer cycles.",
                      checked: tipsEnabled,
                      onChange: () => setTipsEnabled(!tipsEnabled)
                    },
                    {
                      title: "📊 Analysis Finished Alerts",
                      desc: "Get dynamic bell icon notification summaries whenever chat parses conclude.",
                      checked: analysisAlerts,
                      onChange: () => setAnalysisAlerts(!analysisAlerts)
                    },
                    {
                      title: "📢 Updates & Feature Notes",
                      desc: "Allow system announcements for novel tools like Voice Analyzer stress trackers.",
                      checked: marketingEmails,
                      onChange: () => setMarketingEmails(!marketingEmails)
                    }
                  ].map((toggle, idx) => (
                    <div key={idx} className="flex gap-4 items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-zinc-200 block">{toggle.title}</span>
                        <span className="text-[9px] text-zinc-400 leading-normal block">{toggle.desc}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={toggle.onChange}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                          toggle.checked ? "bg-primary" : "bg-zinc-800"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                          toggle.checked ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: SUBSCRIPTION & BILLING                              */}
          {/* ========================================================== */}
          {activeTab === "subscription" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Active Plan Card (Left/Main Column) */}
              <div className="lg:col-span-8 rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-6 space-y-6 glass-strong">
                <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                  <Crown className="w-4 h-4 text-zinc-400" />
                  Your Active Intelligence Plan
                </h3>

                {subLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-[10px] text-zinc-500">Checking active privileges...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Visual Plan Display */}
                    <div className={`rounded-2xl border p-6 relative overflow-hidden bg-gradient-to-br ${
                      subscription?.isTrialActive 
                        ? "from-pink-500/10 via-rose-500/5 to-transparent border-primary/30"
                        : subscription?.tier === "premium" 
                        ? "from-amber-500/10 via-yellow-500/5 to-transparent border-amber-500/30"
                        : subscription?.tier === "pro"
                        ? "from-indigo-500/10 via-purple-500/5 to-transparent border-accent/30"
                        : "from-zinc-800/20 via-zinc-900/10 to-transparent border-white/[0.04]"
                    }`}>
                      <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[150%] bg-white/[0.01] rotate-12 pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                        <div className="space-y-1">
                          <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border select-none ${
                            subscription?.isTrialActive 
                              ? "bg-primary/20 border-primary/30 text-primary animate-pulse"
                              : subscription?.tier === "premium"
                              ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                              : subscription?.tier === "pro"
                              ? "bg-accent/20 border-accent/30 text-accent"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400"
                          }`}>
                            {subscription?.isTrialActive ? "Premium Trial Active" : `${subscription?.tier || "Free"} Account`}
                          </span>
                          
                          <h4 className="text-xl font-black text-white pt-1">
                            {subscription?.isTrialActive 
                              ? "24-Hour Premium Experience" 
                              : subscription?.tier === "premium" 
                              ? "Enterprise Relationship Intelligence" 
                              : subscription?.tier === "pro"
                              ? "Pro Connection Mapping Suite"
                              : "Standard Connections Core"}
                          </h4>
                          
                          <p className="text-[10px] text-zinc-400 leading-normal max-w-md pt-0.5">
                            {subscription?.isTrialActive 
                              ? "Enjoy unlocked emotional mapping, voice acoustic markers, compatibility tests, and full histories completely free for 24 hours."
                              : subscription?.tier === "premium"
                              ? "Unlimited, enterprise-grade connection monitoring, expert coach modules, and complete diagnostic analytics."
                              : subscription?.tier === "pro"
                              ? "Unlimited chat logs, red-flag scanning, and standard emotional metric tracking."
                              : "Basic insights on 5 chats a month, always free. Upgrade options unlocked below."}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Status</span>
                          <span className={`text-xs font-bold uppercase block ${
                            subscription?.status === "active" || subscription?.isTrialActive ? "text-emerald-400" : "text-zinc-400"
                          }`}>
                            {subscription?.isTrialActive ? "Active Trial" : subscription?.status === "active" ? "Active Subscription" : "Standard Fallback"}
                          </span>
                          {subscription?.expiresAt && (
                            <span className="text-[8.5px] text-zinc-500 block pt-0.5 font-mono">
                              Renews/Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                          {subscription?.isTrialActive && subscription?.trialExpiresAt && (
                            <span className="text-[8.5px] text-primary block pt-0.5 font-bold font-mono">
                              Ends: {new Date(subscription.trialExpiresAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Usage Progress Tracker */}
                    {usage && (
                      <div className="space-y-2.5 pt-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-zinc-400" />
                            Monthly Analysis Volume Metrics
                          </span>
                          <span className="font-bold text-zinc-200">
                            {subscription?.tier !== "free" || subscription?.isTrialActive 
                              ? "Unlimited (Active)" 
                              : `${usage.monthlyAnalysisCount} / ${usage.monthlyLimit} free analyses used`}
                          </span>
                        </div>
                        
                        {(subscription?.tier === "free" && !subscription?.isTrialActive) ? (
                          <div className="w-full h-2 bg-zinc-900 border border-white/[0.04] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min((usage.monthlyAnalysisCount / usage.monthlyLimit) * 100, 100)}%` }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-2 bg-primary/20 border border-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full w-full" />
                          </div>
                        )}
                        <p className="text-[9px] text-zinc-500">
                          Usage thresholds reset automatically on a monthly schedule. Premium trials have infinite capabilities during active hours.
                        </p>
                      </div>
                    )}

                    {/* Manage Billing Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/[0.04]">
                      {subscription?.tier === "free" && !subscription?.isTrialActive && (
                        <Button
                          type="button"
                          onClick={() => window.location.href = "/dashboard/trial"}
                          className="bg-gradient-to-r from-primary to-accent text-white font-bold text-xs h-10 rounded-xl border border-white/5 shadow-md shadow-primary/10 flex-1 hover:brightness-110 transition-all flex items-center justify-center gap-1"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          Explore Full Premium (Activate Free Trial)
                        </Button>
                      )}
                      
                      {subscription?.tier !== "free" && (
                        <Button
                          type="button"
                          onClick={() => alert("Redirecting safely to Stripe/Razorpay customer billing center. (Sandbox simulation).")}
                          className="bg-zinc-900 hover:bg-zinc-800/80 border border-white/[0.06] text-zinc-200 font-bold text-xs h-10 rounded-xl flex-1 transition-all"
                        >
                          Manage subscription billing
                        </Button>
                      )}

                      <Button
                        type="button"
                        onClick={() => window.location.href = "/dashboard/upgrade"}
                        className="bg-zinc-950 hover:bg-zinc-900 border border-white/[0.04] text-zinc-400 hover:text-zinc-200 font-semibold text-xs h-10 rounded-xl px-4 transition-all"
                      >
                        Compare plans
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Resources & Support Help Desk (Right Column) */}
              <div className="lg:col-span-4 rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-6 space-y-6 glass-strong">
                <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                  <HelpCircle className="w-4 h-4 text-zinc-400" />
                  Support & Resources
                </h3>

                <div className="space-y-3">
                  {[
                    { id: "privacy", title: "🔒 Sensitive Data Privacy Guard", desc: "Detailed breakdown on local-first processing and SHA-256 fingerprint hashing." },
                    { id: "science", title: "🧩 Relationship Conflict Science", desc: "Scientific literature behind our communication volume models." },
                    { id: "support", title: "💌 Dispatch Support Ticket", desc: "Simulate a live emotional dispatch helper directly." }
                  ].map((res) => (
                    <button
                      key={res.id}
                      onClick={() => {
                        if (res.id === "privacy") setIsPrivacyModalOpen(true)
                        if (res.id === "science") setIsScienceModalOpen(true)
                        if (res.id === "support") setIsSupportModalOpen(true)
                      }}
                      className="w-full text-left block p-3 rounded-xl bg-zinc-950/50 border border-white/[0.03] hover:border-white/[0.08] transition-all hover:translate-x-0.5 duration-300 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-zinc-200 block">{res.title}</span>
                        <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                      </div>
                      <span className="text-[9px] text-zinc-400 leading-normal block pt-0.5">{res.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}



        </motion.div>
      </AnimatePresence>

      {/* 1. Sensitive Data Privacy Guard Modal */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPrivacyModalOpen(false)}
              className="absolute inset-0 cursor-default"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-xl bg-zinc-950/95 border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden glass-strong flex flex-col max-h-[90vh] z-10"
            >
              {/* Glowing top line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.05] relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Sensitive Data Privacy Guard
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Technical breakdown of local-first cryptographic protection
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsPrivacyModalOpen(false)}
                  variant="ghost" 
                  size="icon" 
                  className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-zinc-300">
                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Local-First Sanitization Pipeline
                  </h4>
                  <p className="text-zinc-400 leading-relaxed text-[11px] pl-3">
                    Your conversation transcripts, text fragments, and raw vocal files are processed purely in ephemeral RAM buffers. We never write unencrypted raw conversation data to any persistent database. Only high-level mathematical vectors and metadata tags are persisted.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    SHA-256 Identification Hashing
                  </h4>
                  <p className="text-zinc-400 leading-relaxed text-[11px] pl-3">
                    We sanitize user identifiers, contact nicknames, and message timestamps using a salt-key cryptographic hash. This ensures that even if database data is exposed, no human relation patterns can be back-traced to actual names or identities.
                  </p>
                </div>

                {/* Hashing Encoder Sandbox */}
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.04] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-emerald-400" />
                      Live SHA-256 Sandbox
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                      Client-Side Active
                    </span>
                  </div>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value)
                      computeHash(e.target.value)
                    }}
                    placeholder="Type sample text to compute SHA-256..."
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950/80 border border-white/[0.06] text-[11px] text-zinc-200 placeholder-zinc-650 focus:border-emerald-500/50 outline-none transition-all"
                  />
                  {hashedText && (
                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-500 block">SHA-256 Hash Output:</span>
                      <code className="block p-2 rounded bg-zinc-950 text-[10px] text-emerald-300 font-mono break-all border border-emerald-950/40 select-all">
                        {hashedText}
                      </code>
                    </div>
                  )}
                </div>

                {/* Security Badges */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="p-2.5 rounded-xl bg-zinc-900/20 border border-white/[0.02] text-center">
                    <Database className="w-4 h-4 text-zinc-400 mx-auto mb-1.5" />
                    <span className="font-semibold text-zinc-200 block text-[9px]">Zero-Log Policy</span>
                    <span className="text-zinc-500 block text-[8px] mt-0.5">Raw texts deleted</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/20 border border-white/[0.02] text-center">
                    <Lock className="w-4 h-4 text-zinc-400 mx-auto mb-1.5" />
                    <span className="font-semibold text-zinc-200 block text-[9px]">AES-256 Storage</span>
                    <span className="text-zinc-500 block text-[8px] mt-0.5">Rest encrypted</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/20 border border-white/[0.02] text-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
                    <span className="font-semibold text-emerald-400 block text-[9px]">HIPAA Compliant</span>
                    <span className="text-zinc-500 block text-[8px] mt-0.5">Privacy standards</span>
                  </div>
                </div>
              </div>

              {/* Close Button Footer */}
              <div className="p-4 border-t border-white/[0.05] flex justify-end bg-zinc-900/10">
                <Button 
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-white/[0.06] text-zinc-200 font-bold text-xs h-9 px-4 rounded-xl transition-all"
                >
                  Close Guard
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Relationship Conflict Science Modal */}
      <AnimatePresence>
        {isScienceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScienceModalOpen(false)}
              className="absolute inset-0 cursor-default"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-xl bg-zinc-950/95 border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden glass-strong flex flex-col max-h-[90vh] z-10"
            >
              {/* Glowing top line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.05] relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <Activity className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Relationship Conflict Science
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Empirical psychology models driving our algorithm matching
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsScienceModalOpen(false)}
                  variant="ghost" 
                  size="icon" 
                  className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-zinc-300">
                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    Dr. John Gottman's "Four Horsemen"
                  </h4>
                  <p className="text-zinc-400 leading-relaxed text-[11px] pl-3">
                    Our Red Flag detection scans linguistic markers corresponding to Dr. Gottman’s research: <strong className="text-violet-300">Criticism</strong> (blaming character), <strong className="text-violet-300">Contempt</strong> (sarcasm/mockery), <strong className="text-violet-300">Defensiveness</strong> (counter-attacking), and <strong className="text-violet-300">Stonewalling</strong> (withdrawing/silence). Contempt remains the single largest predictor of divorce/breakups.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    Linguistic Ratio & Sentiment Indices
                  </h4>
                  <p className="text-zinc-400 leading-relaxed text-[11px] pl-3">
                    Healthy dynamics maintain a <strong className="text-emerald-400">5:1 ratio</strong> of positive-to-negative interactions during conflict, and a <strong className="text-emerald-400">20:1 ratio</strong> during daily conversations. Our sentiment tracker analyzes negative qualifiers, passive-aggressive tone markers, and supportive micro-affirmations to map your specific index.
                  </p>
                </div>


              </div>

              {/* Close Button Footer */}
              <div className="p-4 border-t border-white/[0.05] flex justify-end bg-zinc-900/10">
                <Button 
                  onClick={() => setIsScienceModalOpen(false)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-white/[0.06] text-zinc-200 font-bold text-xs h-9 px-4 rounded-xl transition-all"
                >
                  Close Science Center
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Dispatch Support Ticket Modal */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSupportModalOpen(false)
                setTicketStatus("idle")
                setTicketMessage("")
              }}
              className="absolute inset-0 cursor-default"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-xl bg-zinc-950/95 border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden glass-strong flex flex-col max-h-[90vh] z-10"
            >
              {/* Glowing top line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 via-rose-500 to-red-500" />
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.05] relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                    <Mail className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Dispatch Support Ticket
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Submit billing issues, emotional conflict dilemmas, or app bugs
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setIsSupportModalOpen(false)
                    setTicketStatus("idle")
                    setTicketMessage("")
                  }}
                  variant="ghost" 
                  size="icon" 
                  className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-zinc-300">
                {ticketStatus === "success" ? (
                  <div className="space-y-4 py-8 text-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-[13px]">Ticket Dispatched Successfully!</h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Ticket Ref: <span className="font-mono text-zinc-300 font-bold select-all">{lastGeneratedTicketId}</span>. 
                        Our emotional dispatch agent has received your request and is reviewing the relational metrics.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.04] text-[11px] text-left space-y-1.5 text-zinc-300">
                      <span className="font-bold text-zinc-200 block text-[10px] uppercase tracking-wider text-pink-400">Initial Assessment of Your Issue:</span>
                      <p className="leading-relaxed text-[10px] text-zinc-400 italic">
                        {getDynamicAssessment(ticketCategory, ticketMessage)}
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setIsSupportModalOpen(false)
                        setTicketStatus("idle")
                        setTicketMessage("")
                      }}
                      className="bg-zinc-900 hover:bg-zinc-800 border border-white/[0.06] text-zinc-200 font-bold text-xs h-9 px-6 rounded-xl transition-all"
                    >
                      Submitted (Close)
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    if (!ticketMessage.trim()) return
                    setTicketStatus("submitting")
                    const generatedId = "#HM-" + (Math.floor(Math.random() * 9000) + 1000);
                    try {
                      const res = await fetch("/api/support/ticket", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          category: ticketCategory,
                          message: ticketMessage,
                          ticketId: generatedId,
                        }),
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setLastGeneratedTicketId(generatedId);
                        setTicketStatus("success");
                        sendClientEvent("support_ticket_submitted", { category: ticketCategory });
                      } else {
                        throw new Error(data.error || "Failed to submit ticket");
                      }
                    } catch (err) {
                      setTicketStatus("error");
                    }
                  }} className="space-y-4">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Select Ticket Subject / Department
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "emotional", label: "🚨 Emotional Coach Dispatch", desc: "Relationship crisis or advice" },
                          { id: "billing", label: "💳 Plan / Billing Issue", desc: "Trial status, checkout help" },
                          { id: "bug", label: "🛠️ Technical App Bug", desc: "Features not loading properly" },
                          { id: "feedback", label: "💡 Feature Feedback", desc: "Suggest ideas to team" }
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setTicketCategory(cat.id)}
                            className={`p-3 rounded-xl text-left border transition-all ${
                              ticketCategory === cat.id
                                ? "bg-pink-500/10 border-pink-500/30 text-white"
                                : "bg-zinc-900/20 border-white/[0.03] hover:border-white/[0.06] text-zinc-400"
                            }`}
                          >
                            <span className="font-bold text-[10px] block">{cat.label}</span>
                            <span className="text-[8px] text-zinc-500 block leading-normal pt-0.5">{cat.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Message Details
                      </label>
                      <textarea
                        required
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder={
                          ticketCategory === "emotional" 
                            ? "Describe what conflict you're going through, so our AI agent can guide you..."
                            : ticketCategory === "billing"
                            ? "Provide subscription billing/payment info context..."
                            : "Provide step-by-step notes on how to trigger the issue..."
                        }
                        rows={5}
                        className="w-full p-3 rounded-xl bg-zinc-900/40 border border-white/[0.04] text-[11px] text-zinc-200 placeholder-zinc-600 focus:border-pink-500/40 outline-none transition-all resize-none"
                      />
                    </div>

                    {ticketStatus === "error" && (
                      <p className="text-[10px] text-rose-400 text-center font-semibold pb-1.5">
                        ⚠️ Error submitting ticket. Please try again.
                      </p>
                    )}

                    {/* Submit Button */}
                    <Button 
                      type="submit"
                      disabled={ticketStatus === "submitting" || !ticketMessage.trim()}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-110 text-white font-bold text-xs h-10 rounded-xl border border-white/5 shadow-md shadow-pink-500/10 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {ticketStatus === "submitting" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Sending Support Ticket...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Submit Support Ticket
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Close Button Footer */}
              {ticketStatus !== "success" && (
                <div className="p-4 border-t border-white/[0.05] flex justify-end bg-zinc-900/10">
                  <Button 
                    type="button"
                    onClick={() => {
                      setIsSupportModalOpen(false)
                      setTicketStatus("idle")
                      setTicketMessage("")
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-white/[0.06] text-zinc-200 font-bold text-xs h-9 px-4 rounded-xl transition-all"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
