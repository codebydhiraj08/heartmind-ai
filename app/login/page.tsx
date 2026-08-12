"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Mail, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Brain, 
  Shield, 
  Activity, 
  Check, 
  MessageCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Static particle data to prevent Next.js SSR hydration mismatch
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
  { top: "85%", left: "65%", x: [0, -70, 80, 0], y: [0, 50, -80, 0], duration: 27 }
];

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (errorParam) {
      if (errorParam === "OAuthSignin" || errorParam === "OAuthCallback") {
        setError("An error occurred during Google Sign-In. Please try again.");
      } else {
        setError("Authentication failed. Please verify your credentials.");
      }
    }
  }, [errorParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
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
              router.push(callbackUrl);
              router.refresh();
            }
          } else {
            const signupData = await signupRes.json();
            setError(signupData.error || "Mock Google registration failed.");
          }
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        await signIn("google", { callbackUrl });
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError("An error occurred during Google Sign-in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] animated-gradient relative overflow-x-hidden flex flex-col justify-center pt-24 pb-12 px-4 sm:px-8 lg:px-12">
      {/* Decorative ambient backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -80, 40, 0],
            scale: [1, 1.1, 0.95, 1]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[380px] h-[380px] bg-[#ea409b]/10 rounded-full blur-[130px]"
        />
        <motion.div 
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 60, -70, 0],
            scale: [1, 0.95, 1.05, 1]
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[10%] w-[380px] h-[380px] bg-[#04c7f0]/10 rounded-full blur-[130px]"
        />

        {/* Dynamic Flying/Floating Light Particles */}
        {backgroundParticles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent opacity-30 blur-[0.5px]"
            style={{
              top: p.top,
              left: p.left,
            }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: [0.15, 0.5, 0.15]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Top Navbar */}
      <nav className="absolute top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 sm:px-8 lg:px-12 bg-transparent select-none">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            HeartMind <span className="bg-gradient-to-r from-[#ea409b] to-[#04c7f0] bg-clip-text text-transparent">AI</span>
          </span>
        </Link>
        <Link href="/" className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-medium">
          <span>←</span> Back to Home
        </Link>
      </nav>

      {/* Split Screen Container */}
      <div className="max-w-7xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Copy & Feature Badges */}
        <div className="lg:col-span-4 flex flex-col items-start space-y-8 text-left">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl font-extrabold leading-[1.12] tracking-tight mb-4 text-white"
            >
              Your conversations <br />
              deserve to be <br />
              <span className="bg-gradient-to-r from-[#ea409b] via-[#9f60f6] to-[#04c7f0] bg-clip-text text-transparent">understood.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm"
            >
              HeartMind AI helps you uncover the emotional patterns, red flags, and hidden signals in your conversations.
            </motion.p>
          </div>

          {/* Features list */}
          <div className="space-y-4 w-full">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400 shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI-Powered Insights</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">Advanced AI understands emotions and communication patterns.</p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0 text-pink-400 shadow-inner">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Deep Relationship Analysis</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">Detects patterns, highlights red flags, and tracks relationship health.</p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400 shadow-inner">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Private & Secure</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">Your conversations are encrypted and never shared with anyone.</p>
              </div>
            </motion.div>
          </div>

          {/* Privacy card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="w-full max-w-sm border border-zinc-800/40 bg-zinc-950/40 rounded-2xl p-4 flex items-center gap-3.5 select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-inner">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Your privacy is our priority.</p>
              <p className="text-[10px] text-zinc-500 leading-normal">We never store or display your private conversations.</p>
            </div>
          </motion.div>
        </div>

        {/* Middle Column: Chat Simulation Mockup */}
        <div className="lg:col-span-3 hidden lg:flex flex-col justify-center items-center relative pr-4">
          <motion.div 
            animate={{
              y: [0, -6, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full max-w-[280px] space-y-6"
          >
            {/* You bubble */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="bg-[#121620] border border-[#1d2433] rounded-2xl rounded-tr-none p-3.5 shadow-md relative"
            >
              <span className="text-[10px] font-bold text-purple-400 block mb-0.5">You</span>
              <p className="text-[11px] text-zinc-200">Are you okay? You seem a little distant.</p>
              <span className="text-[8px] text-zinc-600 absolute bottom-1.5 right-2.5 flex items-center gap-0.5">
                10:24 AM <Check className="w-2.5 h-2.5 text-blue-400" />
              </span>
            </motion.div>

            {/* Visualizer wave line */}
            <div className="relative h-10 flex items-center justify-center overflow-hidden my-4 select-none">
              <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-25" />
              <svg className="w-full h-8 stroke-[#8b5cf6] fill-none opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M 0,5 Q 15,2 30,5 T 60,8 T 100,5" strokeWidth="0.5" className="animate-pulse" />
              </svg>
            </div>

            {/* Partner bubble */}
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="bg-[#18121f] border border-[#2b1d38] rounded-2xl rounded-tl-none p-3.5 shadow-md relative"
            >
              <span className="text-[10px] font-bold text-pink-400 block mb-0.5">Partner</span>
              <p className="text-[11px] text-zinc-200">I'm fine, just tired.</p>
              <span className="text-[8px] text-zinc-600 absolute bottom-1.5 right-2.5">
                10:25 AM
              </span>
            </motion.div>

            {/* AI Insight Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.4 }}
              className="bg-[#0c0d12]/95 border border-[#1d2331] rounded-2xl p-3.5 shadow-xl select-none"
            >
              <div className="flex items-center gap-1.5 text-zinc-400 text-[9px] font-bold mb-2">
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                <span>AI Insight</span>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[8px] text-zinc-500 mb-0.5">Emotional tone detected</p>
                  <p className="text-[10px] font-bold text-white mb-1.5">
                    <span className="text-zinc-400">Calm</span>
                    <span className="mx-1 text-zinc-600">→</span>
                    <span className="text-pink-400 font-semibold">Slightly Distant</span>
                  </p>
                  <div className="flex items-center gap-0.5">
                    <span className="text-[7px] font-bold px-1 py-0.2 bg-blue-950/40 text-blue-400 border border-blue-900/30 rounded">Shift</span>
                    <span className="text-[7px] font-bold px-1 py-0.2 bg-purple-950/40 text-purple-400 border border-purple-900/30 rounded">Distance</span>
                  </div>
                </div>

                {/* mini Circular indicator */}
                <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" fill="none" />
                    <circle cx="16" cy="16" r="13" stroke="#8b5cf6" strokeWidth="2.5" fill="none" strokeDasharray="81.6" strokeDashoffset="10.6" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[8px] font-bold text-white">87%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column: Login Card Wrapper */}
        <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full max-w-[420px] rounded-[24px] bg-[#0b0c10]/95 border border-[#161b26] p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Glowing corner border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />

            {/* Error box */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 leading-normal relative z-10">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Header Brand elements */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 select-none">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-center text-xl font-bold tracking-tight text-white">
                Welcome back 👋
              </h2>
              <p className="mt-1 text-center text-xs text-zinc-400">
                Continue to your relationship insights
              </p>
            </div>

            {/* Login Credentials Form */}
            <form className="space-y-4 relative z-10" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-500" />
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
                    className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950/60 border border-white/[0.06] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-90 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-zinc-950/60 border border-white/[0.06] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#ea409b] to-[#04c7f0] hover:opacity-95 text-white font-bold text-xs py-2.5 h-auto rounded-full shadow-md shadow-purple-500/10 transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 relative z-10 pointer-events-none">
              <div className="absolute inset-0 flex items-center pointer-events-none" aria-hidden="true">
                <div className="w-full border-t border-white/[0.04]"></div>
              </div>
              <div className="relative flex justify-center text-xs pointer-events-none">
                <span className="px-3 bg-transparent text-[8px] font-bold text-zinc-500 uppercase tracking-wider">
                  Or Continue With
                </span>
              </div>
            </div>

            {/* Google OAuth action */}
            <div className="mt-4 relative z-20">
              <button
                onClick={handleGoogleLogin}
                type="button"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2.5 px-4 py-2.5 bg-zinc-950/40 hover:bg-zinc-900 border border-white/[0.06] hover:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-zinc-500">
              New to HeartMind AI?{" "}
              <Link
                href="/signup"
                className="font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-90 transition-colors"
              >
                Create your free account →
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center text-xs text-zinc-500">
        <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
        <span>Loading Login Form...</span>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
