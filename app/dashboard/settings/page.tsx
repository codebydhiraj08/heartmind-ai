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
  CheckCircle2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/use-subscription"
import { sendClientEvent } from "@/lib/analytics"

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const { subscription, usage, loading: subLoading, refreshSubscription } = useSubscription()

  // Active settings tab state
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "subscription" | "diagnostics">("profile")

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
          { id: "subscription", label: "👑 Plan & Billing Info", icon: Crown },
          { id: "diagnostics", label: "🔌 DB Diagnostics", icon: Database }
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
                    { title: "📄 Platform User Manual", link: "#", desc: "Step-by-step guides on how to export WhatsApp/Telegram/Slack chats." },
                    { title: "🔒 Sensitive Data Privacy Guard", link: "#", desc: "Detailed breakdown on local-first processing and SHA-256 fingerprint hashing." },
                    { title: "🧩 Relationship Conflict Science", link: "#", desc: "Scientific literature behind our communication volume models." },
                    { title: "💌 Dispatch Support Ticket", link: "#", desc: "Simulate a live emotional dispatch helper directly." }
                  ].map((res, idx) => (
                    <a
                      key={idx}
                      href={res.link}
                      onClick={(e) => {
                        e.preventDefault()
                        alert(`Opening Resource: "${res.title}" inside a simulated sandbox preview!`)
                      }}
                      className="block p-3 rounded-xl bg-zinc-950/50 border border-white/[0.03] hover:border-white/[0.08] transition-all hover:translate-x-0.5 duration-300"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-zinc-200 block">{res.title}</span>
                        <ChevronRight className="w-3 h-3 text-zinc-500" />
                      </div>
                      <span className="text-[9px] text-zinc-400 leading-normal block pt-0.5">{res.desc}</span>
                    </a>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: DATABASE & CONNECTION DIAGNOSTICS                   */}
          {/* ========================================================== */}
          {activeTab === "diagnostics" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Connection Status Panel (Left/Main Column) */}
              <div className="lg:col-span-8 rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-6 space-y-6 glass-strong">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Database className="w-4 h-4 text-zinc-400" />
                    Database Connection Diagnostics
                  </h3>
                  <Button
                    type="button"
                    disabled={diagLoading || diagRetrying}
                    onClick={() => fetchDiagnostics(true)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold px-3 py-1.5 h-8 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`w-3 h-3 ${diagRetrying ? "animate-spin" : ""}`} />
                    Test & Retry Connection
                  </Button>
                </div>

                {diagLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Scanning Database Access...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Glowing Connection Card */}
                    {diagData && (
                      <div className={`rounded-2xl border p-5 relative overflow-hidden bg-gradient-to-br ${
                        diagData.diagnostics?.connection_successful 
                          ? "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30"
                          : "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30"
                      }`}>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              {/* Pulsing Status Orb */}
                              <span className="relative flex h-3 w-3 shrink-0">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                  diagData.diagnostics?.connection_successful ? "bg-emerald-400" : "bg-amber-400"
                                }`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                                  diagData.diagnostics?.connection_successful ? "bg-emerald-500" : "bg-amber-500"
                                }`}></span>
                              </span>
                              
                              <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border select-none ${
                                diagData.diagnostics?.connection_successful 
                                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                                  : "bg-amber-500/20 border-amber-500/30 text-amber-400 animate-pulse"
                              }`}>
                                {diagData.diagnostics?.connection_successful ? "Live MongoDB Atlas Connected" : "Local JSON Offline Fallback (db.json)"}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-white pt-1">
                              {diagData.diagnostics?.connection_successful 
                                ? "Database connection active and synchronized!" 
                                : "MongoDB Atlas connection is currently offline."}
                            </h4>
                            
                            <p className="text-[10px] text-zinc-400 leading-normal max-w-lg">
                              {diagData.diagnostics?.connection_successful
                                ? "Your project is securely storing profiles, chats, timelines, and payment histories directly in your cloud-hosted MongoDB Atlas cluster."
                                : "Database connection failed or MONGODB_URI is not configured properly. The application is running on an offline JSON fallback database (db.json) so features still work locally, but changes will NOT persist in production or on mobile deployments."}
                            </p>
                          </div>

                          <div className="shrink-0">
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Mode</span>
                            <span className={`text-xs font-black uppercase ${
                              diagData.diagnostics?.connection_successful ? "text-emerald-400" : "text-amber-400"
                            }`}>
                              {diagData.diagnostics?.connection_successful ? "Production Atlas" : "Local db.json"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Environment Details */}
                    <div className="rounded-xl border border-white/[0.04] bg-zinc-950/40 p-4 space-y-4">
                      <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Environment Setup Details</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block">Configured Environment URI</span>
                          <code className="text-[10px] font-mono text-zinc-300 bg-black/60 px-2 py-1 rounded border border-white/5 block truncate font-semibold">
                            {diagData?.diagnostics?.mongodb_uri_masked || "No URI found"}
                          </code>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block">Active Storage State</span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300 font-bold bg-zinc-900 border border-white/[0.04] px-2.5 py-1 rounded-lg">
                            <Database className="w-3.5 h-3.5 text-primary" />
                            {diagData?.diagnostics?.global_use_mock_db ? "Offline JSON (db.json)" : "Live Cloud Cluster (MongoDB)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Connection Error Message Visualizer (Console Block) */}
                    {diagData?.diagnostics?.connection_error && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Detailed Connection Error Message</span>
                        </div>

                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.02] p-4 font-mono text-[10px] leading-relaxed text-rose-300 overflow-x-auto relative">
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-[8px] uppercase tracking-wider font-bold">
                            Mongoose Error Log
                          </div>
                          <span className="block text-zinc-500 select-none pb-1">$ npm run dev --db-verbose</span>
                          <span className="block select-text white-space-pre-wrap">{diagData.diagnostics.connection_error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step-by-Step Whitelisting Guide (Right Column) */}
              <div className="lg:col-span-4 rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-6 space-y-6 glass-strong">
                <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                  <HelpCircle className="w-4 h-4 text-zinc-400" />
                  Atlas Connection Troubleshooting
                </h3>

                <div className="space-y-4">
                  {/* Whitelisting Steps Card */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.03] space-y-3">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block">🔒 Step 1: Atlas IP Whitelisting</span>
                    <p className="text-[9px] text-zinc-400 leading-relaxed font-normal">
                      MongoDB Atlas strictly blocks unknown IPs. Because Vercel and some ISPs rotate client IPs constantly, you must allow connection access:
                    </p>
                    <ol className="list-decimal pl-4 text-[9px] text-zinc-300 space-y-1.5 leading-relaxed font-normal">
                      <li>Log in to your <strong>MongoDB Atlas Console</strong>.</li>
                      <li>Navigate to <strong>Security</strong> ➡️ <strong>Network Access</strong>.</li>
                      <li>Click <strong>Add IP Address</strong>.</li>
                      <li>Select <strong>Allow Access From Anywhere</strong> (inputs <code>0.0.0.0/0</code>).</li>
                      <li>Click <strong>Confirm</strong> and wait 1 minute for updates.</li>
                    </ol>
                  </div>

                  {/* Password Verification Card */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.03] space-y-3">
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">🔑 Step 2: Database Password</span>
                    <p className="text-[9px] text-zinc-400 leading-relaxed font-normal">
                      A common error is using your Atlas web account password instead of your <strong>Database User Password</strong> (created in Database Access tab).
                    </p>
                    <p className="text-[9px] text-zinc-400 leading-relaxed font-normal">
                      Also ensure password does not contain special characters like <code>@</code>, <code>/</code>, or <code>:</code> unless they are properly URI-encoded.
                    </p>
                  </div>

                  {/* Vercel Environment Variables Guide */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.03] space-y-3">
                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block">🚀 Step 3: Vercel Deployments</span>
                    <p className="text-[9px] text-zinc-400 leading-relaxed font-normal">
                      Vercel builds are fully stateless. Ensure you copy your verified <code>MONGODB_URI</code> into the <strong>Vercel Project Settings ➡️ Environment Variables</strong> and trigger a redeployment!
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  )
}
