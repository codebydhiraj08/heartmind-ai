"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff, 
  Brain, 
  Shield, 
  Heart, 
  Sparkles, 
  ChevronLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Static particle data matching Login page to prevent hydration mismatch
const backgroundParticles = [
  { top: "5%", left: "10%", x: [0, 80, -40, 0], y: [0, -60, 40, 0], duration: 18 },
  { top: "15%", left: "60%", x: [0, -90, 50, 0], y: [0, 80, -70, 0], duration: 24 },
  { top: "25%", left: "30%", x: [0, 50, -80, 0], y: [0, -70, 50, 0], duration: 20 },
  { top: "35%", left: "80%", x: [0, -60, 90, 0], y: [0, 50, -80, 0], duration: 28 },
  { top: "45%", left: "15%", x: [0, 70, -50, 0], y: [0, -80, 60, 0], duration: 22 },
  { top: "50%", left: "70%", x: [0, -80, 70, 0], y: [0, 60, -90, 0], duration: 26 },
  { top: "60%", left: "40%", x: [0, 90, -40, 0], y: [0, -50, 80, 0], duration: 19 },
  { top: "70%", left: "85%", x: [0, -50, 60, 0], y: [0, 80, -50, 0], duration: 25 },
  { top: "80%", left: "20%", x: [0, 80, -70, 0], y: [0, -60, 70, 0], duration: 21 },
  { top: "85%", left: "65%", x: [0, -70, 80, 0], y: [0, 50, -80, 0], duration: 27 },
  { top: "90%", left: "5%", x: [0, 60, -90, 0], y: [0, -80, 50, 0], duration: 23 },
  { top: "95%", left: "50%", x: [0, -80, 60, 0], y: [0, 70, -60, 0], duration: 29 },
  { top: "8%", left: "88%", x: [0, 50, -50, 0], y: [0, -40, 50, 0], duration: 17 },
  { top: "18%", left: "22%", x: [0, -50, 50, 0], y: [0, 40, -50, 0], duration: 23 },
  { top: "58%", left: "92%", x: [0, 60, -60, 0], y: [0, -60, 60, 0], duration: 25 }
];

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred during signup.");
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const checkRes = await fetch("/api/auth/google-check");
      const { isPlaceholder } = await checkRes.json();

      const isRawNetworkIP = window.location.hostname.startsWith("192.168.") || 
                            window.location.hostname.startsWith("10.") || 
                            (window.location.hostname.startsWith("172.") && 
                             parseInt(window.location.hostname.split(".")[1]) >= 16 &&
                             parseInt(window.location.hostname.split(".")[1]) <= 31);

      if (isPlaceholder || isRawNetworkIP) {
        const googleEmail = prompt(
          "🛡️ Google OAuth Mock Sign-in (Network IP Mode)\n\n" +
          "Aap local network IP se connect hain jahan Google OAuth redirect setup impossible hai.\n" +
          "Local testing ke liye koi bhi mock Google Email enter karein:",
          "dhiraj.google@gmail.com"
        );

        if (!googleEmail) {
          setLoading(false);
          return;
        }

        const emailClean = googleEmail.trim().toLowerCase();
        if (!emailClean.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          setError("Please enter a valid email address for mock login.");
          setLoading(false);
          return;
        }

        const mockName = emailClean.split("@")[0]
          .split(/[\._-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") + " (Google)";

        const mockPassword = "google_mock_password_bypass_123";

        const result = await signIn("credentials", {
          email: emailClean,
          password: mockPassword,
          redirect: false,
        });

        if (result?.error) {
          const signupRes = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: mockName,
              email: emailClean,
              password: mockPassword,
            }),
          });

          if (signupRes.ok) {
            const loginResult = await signIn("credentials", {
              email: emailClean,
              password: mockPassword,
              redirect: false,
            });

            if (loginResult?.error) {
              setError(loginResult.error);
            } else {
              router.push("/dashboard");
              router.refresh();
            }
          } else {
            const signupData = await signupRes.json();
            setError(signupData.error || "Mock Google registration failed.");
          }
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        await signIn("google", { callbackUrl: "/dashboard" });
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError("An error occurred during Google Sign-in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden bg-[#07080c] animated-gradient grid grid-cols-12 relative select-none font-sans">
      
      {/* Decorative ambient backgrounds matching mockup space theme */}
      <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-indigo-500/[0.04] blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[60%] h-[60%] rounded-full bg-pink-500/[0.04] blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute top-[35%] left-[25%] w-[450px] h-[450px] rounded-full bg-purple-500/[0.03] blur-[120px] pointer-events-none" />

      {/* Dynamic Flying/Floating Light Particles matching Login and Home Page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {backgroundParticles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#04c7f0] opacity-35 blur-[0.5px]"
            style={{
              top: p.top,
              left: p.left,
            }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: [0.15, 0.6, 0.15]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Global Top Navbar */}
      <header className="absolute top-0 inset-x-0 h-16 px-6 sm:px-12 flex items-center justify-between z-30 pointer-events-auto">
        {/* LOGO ICON BACKGROUND AND TEXT GRADIENT MATCHING HOME/LOGIN PAGES */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Brain className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-wide">
            HeartMind <span className="bg-gradient-to-r from-[#ea409b] to-[#04c7f0] bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        <Link 
          href="/" 
          className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
      </header>

      {/* Left Panel: Value Props & Chat Mockups (Col-8 - Transparent Combined background layout - NO SCROLL) */}
      <div className="hidden xl:flex xl:col-span-8 flex-col justify-between p-12 pt-20 pb-8 bg-transparent relative h-full max-h-screen overflow-hidden">
        
        {/* Main Content wrapper */}
        <div className="w-full space-y-4">
          {/* Header text */}
          <div className="space-y-2 text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-[1.15]">
              Start understanding <br />
              what truly <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">matters.</span>
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Create your account and unlock AI-powered insights to build healthier, happier relationships.
            </p>
          </div>

          {/* Grid: Value Props (Left) & Chat Mockup (Right) */}
          <div className="grid grid-cols-12 gap-8 items-center pt-2">
            
            {/* Value props (Left side of left panel - INCREASED ICON SIZES) */}
            <div className="col-span-6 space-y-5 text-left">
              <div className="space-y-4.5">
                {[
                  {
                    title: "AI-Powered Insights",
                    desc: "Advanced AI analyzes conversations to reveal hidden patterns.",
                    icon: Brain,
                    color: "bg-[#14122d] border border-indigo-500/20 text-indigo-400"
                  },
                  {
                    title: "Relationship Intelligence",
                    desc: "Understand emotional dynamics and communication style.",
                    icon: Heart,
                    color: "bg-[#281223] border border-pink-500/20 text-pink-400"
                  },
                  {
                    title: "Private & Secure",
                    desc: "Your data is encrypted and always stays private.",
                    icon: Shield,
                    color: "bg-[#10192e] border border-blue-500/20 text-blue-455"
                  },
                  {
                    title: "Actionable Guidance",
                    desc: "Get personalized suggestions to improve your relationships.",
                    icon: Sparkles,
                    color: "bg-[#1a122e] border border-purple-500/20 text-purple-400"
                  }
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-4">
                      {/* INCREASED ICON CONTAINER TO w-12 h-12 AND ICON TO w-6.5 h-6.5 */}
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-md ${item.color}`}>
                        <ItemIcon className="w-6.5 h-6.5" />
                      </div>
                      <div className="pt-0.5">
                        <h3 className="text-xs font-bold text-zinc-200 tracking-wide">{item.title}</h3>
                        <p className="text-[10.5px] text-zinc-500 leading-normal mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trusted card below the list */}
              <div className="bg-zinc-950/30 border border-zinc-900/60 rounded-2xl p-3.5 flex items-center justify-between gap-4 max-w-xs pt-3">
                <div className="text-left">
                  <h4 className="text-[11px] font-bold text-zinc-200 leading-none">Trusted by thousands</h4>
                  <p className="text-[9.5px] text-zinc-555 leading-normal mt-1">People choose HeartMind AI for deeper connections.</p>
                </div>
                <div className="flex items-center shrink-0">
                  <div className="flex -space-x-2.5 select-none">
                    {[
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80"
                    ].map((src, i) => (
                      <img key={i} src={src} alt="Client" className="w-7.5 h-7.5 rounded-full border-2 border-[#030408] object-cover" />
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-[#030408] bg-indigo-650 flex items-center justify-center text-[8.5px] font-black text-white shrink-0 select-none">
                      +5K
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Mockup visual (Right side of left panel - middle screen area - LARGER SIZE & ANIMATED) */}
            <div className="col-span-6 relative flex flex-col items-center justify-center w-full max-w-[440px] mx-auto pt-2">
              
              {/* Glowing ring connector behind */}
              <div className="absolute inset-0 bg-indigo-500/5 blur-[55px] rounded-full pointer-events-none" />

              <div className="w-full space-y-6 relative z-10">
                {/* Chats bubbles */}
                <div className="flex flex-col gap-4 relative">
                  
                  {/* Central connector thread */}
                  <div className="absolute left-1/2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-500/20 via-pink-500/20 to-indigo-500/10 -translate-x-1/2 z-0 hidden sm:block" />

                  {/* Bubble 1 (Left) */}
                  <div className="flex justify-start animate-float-you">
                    <div className="bg-[#0e0c1b]/95 border border-indigo-500/15 rounded-2xl rounded-tl-none p-3.5 max-w-[230px] text-left shadow-2xl relative z-10 transition-transform">
                      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400">You</span>
                      <p className="text-[11px] text-zinc-200 font-semibold mt-0.5 leading-normal">I feel like we don&apos;t talk anymore...</p>
                      <span className="text-[8.5px] text-zinc-550 block text-right mt-1.5">10:24 AM ✓✓</span>
                    </div>
                  </div>

                  {/* Central Glowing Heart Symbol (LARGER & INTENSE GLOW) */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-25 flex items-center justify-center pointer-events-none">
                    <Heart className="w-14 h-14 text-pink-500 fill-pink-500/20 animate-heart-glow" />
                  </div>

                  {/* Bubble 2 (Right) */}
                  <div className="flex justify-end animate-float-partner">
                    <div className="bg-[#09121f]/95 border border-blue-500/15 rounded-2xl rounded-tr-none p-3.5 max-w-[230px] text-left shadow-2xl relative z-10 transition-transform">
                      <span className="text-[9px] font-black uppercase tracking-wider text-blue-400">Partner</span>
                      <p className="text-[11px] text-zinc-200 font-semibold mt-0.5 leading-normal">I&apos;m just tired, it&apos;s not you.</p>
                      <span className="text-[8.5px] text-zinc-555 block text-right mt-1.5">10:25 AM ✓✓</span>
                    </div>
                  </div>
                </div>

                {/* Heart rhythm path with SVG definition gradient (EXTENDED LENGTH) */}
                <div className="py-1 opacity-80 select-none w-full">
                  <svg className="w-full h-10" viewBox="0 0 400 40" fill="none">
                    <path 
                      d="M0 20 L50 20 L58 10 L66 30 L74 20 L110 20 L118 5 L126 35 L134 20 L170 20 L178 8 L186 32 L194 20 L230 20 L238 3 L246 37 L254 20 L290 20 L298 12 L306 28 L314 20 L400 20" 
                      stroke="url(#waveGrad)" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      className="animate-ecg" 
                    />
                    <defs>
                      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                        <stop offset="35%" stopColor="#ec4899" stopOpacity="0.9" />
                        <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* AI Insight Card (LARGER SIZE) */}
                <div className="bg-[#05060b]/90 border border-indigo-950/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden text-left mx-auto max-w-[390px] flex items-center justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1 text-[8.5px] font-black text-indigo-400 uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 fill-indigo-400/20" />
                      AI Insight
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_6px_#f43f5e]" />
                        <span className="text-[10.5px] text-zinc-300 font-semibold leading-none truncate max-w-[170px]">Emotional distance increasing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_6px_#f59e0b]" />
                        <span className="text-[10.5px] text-zinc-300 font-semibold leading-none truncate max-w-[170px]">Communication balance</span>
                      </div>
                    </div>
                    <div className="text-[9.5px] text-zinc-555 leading-none">
                      Room to grow together 🚀
                    </div>
                  </div>

                  {/* Relationship progress circle (Larger size) */}
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center select-none">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="5.5" fill="none" className="text-zinc-950" />
                      <circle cx="40" cy="40" r="32" stroke="url(#insightsGrad)" strokeWidth="5.5" fill="none" strokeDasharray="201" strokeDashoffset="201" strokeLinecap="round" className="animate-ring-draw drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                      <defs>
                        <linearGradient id="insightsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4338ca" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center mt-0.5">
                      <span className="text-sm font-black text-white leading-none">72%</span>
                      <span className="text-[6.5px] font-black uppercase text-zinc-500 tracking-wider mt-1 scale-90">Score</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Right Panel: Sign-up Card View (Col-4 - Transparent overlay matching unified theme - NO SCROLL) */}
      <div className="col-span-12 xl:col-span-4 flex flex-col justify-center items-center p-6 sm:p-12 pt-20 pb-8 relative h-full max-h-screen overflow-hidden bg-transparent">
        
        {/* Container box */}
        <div className="w-full max-w-sm space-y-4">
          {/* Gradient Glowing Wrapper Border */}
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-tr from-blue-500/35 via-[#1a1c28] to-indigo-500/40 shadow-2xl">
            <div className="bg-[#05060b]/98 rounded-[23px] p-5.5 relative overflow-hidden backdrop-blur-xl">
              {success ? (
                <div className="text-center py-6 space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Registration Successful!</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-sm mx-auto">
                      Your account has been created! To complete registration, please check your **development terminal logs** to retrieve and copy the printed email verification link.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link href="/login">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 h-10 rounded-xl border border-white/5 shadow-md shadow-indigo-500/10 transition-all duration-300">
                        Go to Login
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Logo & Headline (UPDATED LOGO STYLE MATCHING HOME/LOGIN PAGES) */}
                  <div className="text-center mb-4.5 select-none">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 mx-auto mb-3">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight leading-none">
                      Create your account 👋
                    </h2>
                    <p className="text-xs text-zinc-450 mt-1.5 leading-normal">
                      Get started with your relationship intelligence helper
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2 leading-normal relative z-10 text-left">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Form fields */}
                  <form className="space-y-3 relative z-10 text-left" onSubmit={handleSignup}>
                    <div>
                      <label htmlFor="name" className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 select-none">
                        Your Name
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none select-none">
                          <User className="h-4 w-4 text-zinc-455" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          disabled={loading}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="block w-full pl-9 pr-3 py-2 bg-[#06060a] border border-[#1a1c24] focus:border-indigo-550 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all duration-300 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 select-none">
                        Email Address
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none select-none">
                          <Mail className="h-4 w-4 text-zinc-455" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          disabled={loading}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="block w-full pl-9 pr-3 py-2 bg-[#06060a] border border-[#1a1c24] focus:border-indigo-550 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all duration-300 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 select-none">
                        Password
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none select-none">
                          <Lock className="h-4 w-4 text-zinc-455" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          disabled={loading}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="block w-full pl-9 pr-9 py-2 bg-[#06060a] border border-[#1a1c24] focus:border-indigo-550 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all duration-300 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors select-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 select-none">
                        Confirm Password
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none select-none">
                          <Lock className="h-4 w-4 text-zinc-455" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          disabled={loading}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="block w-full pl-9 pr-9 py-2 bg-[#06060a] border border-[#1a1c24] focus:border-indigo-550 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all duration-300 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-555 hover:text-zinc-350 transition-colors select-none cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-500 text-white font-bold text-xs py-2.5 h-10 rounded-xl border border-white/5 shadow-lg shadow-indigo-500/10 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Register Account</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Continue With Separator */}
                  <div className="flex items-center my-3 select-none">
                    <div className="flex-grow border-t border-[#1a1c24]" />
                    <span className="px-2 text-[8px] font-black text-zinc-650 tracking-wider uppercase">Or Continue With</span>
                    <div className="flex-grow border-t border-[#1a1c24]" />
                  </div>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-zinc-950/80 hover:bg-[#0c0d12] border border-[#1a1c24] hover:border-zinc-800 text-zinc-200 font-bold text-xs py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer select-none"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.336 0 3.327 2.673 1.345 6.573L5.266 9.765z"
                      />
                      <path
                        fill="#34A853"
                        d="M16.04 15.327c-1.109.736-2.509 1.182-4.04 1.182a7.077 7.077 0 0 1-6.734-4.855L1.345 14.83C3.327 18.727 7.336 21.4 12 21.4c3.09 0 5.864-1.018 7.827-2.773l-3.787-3.3z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.273c0-.818-.082-1.609-.227-2.373H12v4.518h6.464a5.536 5.536 0 0 1-2.4 3.636l3.787 3.3c2.209-2.036 3.639-5.027 3.639-8.811z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.266 11.655a7.03 7.03 0 0 1 0-1.89L1.345 6.573A11.93 11.93 0 0 0 0 12c0 1.918.455 3.736 1.345 5.427l3.921-3.172c-.227-.7-.345-1.464-.345-2.2z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bottom Login Redirect */}
          <div className="text-center text-xs text-zinc-550 select-none">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-indigo-400 hover:text-indigo-350 transition-colors"
            >
              Sign in here
            </Link>
          </div>

          {/* Footer disclaimer */}
          <div className="flex items-center justify-center gap-1.5 text-[8.5px] text-zinc-650 select-none pt-2.5 leading-normal">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="hover:text-zinc-400 transition-colors underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="hover:text-zinc-400 transition-colors underline">Privacy Policy</Link>
            </span>
          </div>
        </div>

      </div>

      {/* CSS Keyframes for glowing animations */}
      <style jsx global>{`
        @keyframes float-you {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-0.5deg); }
        }
        @keyframes float-partner {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(8px) rotate(0.5deg); }
        }
        @keyframes heart-pulse-glow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(236,72,153,0.6)) drop-shadow(0 0 20px rgba(99,102,241,0.3)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 25px rgba(236,72,153,0.9)) drop-shadow(0 0 45px rgba(99,102,241,0.6)); }
        }
        @keyframes ecg-flow {
          0% { stroke-dashoffset: 400; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ring-draw {
          from { stroke-dashoffset: 201; }
          to { stroke-dashoffset: 56.28; }
        }
        .animate-float-you {
          animation: float-you 6s ease-in-out infinite;
        }
        .animate-float-partner {
          animation: float-partner 6s ease-in-out infinite;
        }
        .animate-heart-glow {
          animation: heart-pulse-glow 3s ease-in-out infinite;
        }
        .animate-ecg {
          stroke-dasharray: 60 340;
          animation: ecg-flow 4s linear infinite;
        }
        .animate-ring-draw {
          stroke-dasharray: 201;
          animation: ring-draw 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

    </div>
  );
}
