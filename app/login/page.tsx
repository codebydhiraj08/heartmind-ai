"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Sparkles, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (errorParam) {
      if (errorParam === "OAuthSignin" || errorParam === "OAuthCallback") {
        setError("An error occurred during Google Sign-In. Please try again.");
      } else {
        setError("Authentication failed. Please verify your credentials.");
      }
    }
  }, [errorParam]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

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
      // 1. Check if Google OAuth credentials are placeholders
      const checkRes = await fetch("/api/auth/google-check");
      const { isPlaceholder } = await checkRes.json();

      // Only use mock mode for raw network IPs (192.168.x.x, 10.x.x.x, 172.x.x.x)
      // localhost/127.0.0.1 pe REAL Google OAuth kaam karta hai (Google Console ne authorize kiya hai)
      const isRawNetworkIP = window.location.hostname.startsWith("192.168.") || 
                              window.location.hostname.startsWith("10.") || 
                              (window.location.hostname.startsWith("172.") && 
                               parseInt(window.location.hostname.split(".")[1]) >= 16 &&
                               parseInt(window.location.hostname.split(".")[1]) <= 31);

      if (isPlaceholder || isRawNetworkIP) {
        // 2. Active Local Mock Google Login! (only for raw IPs)
        const googleEmail = prompt(
          "🛡️ Google OAuth Mock Sign-in (Network IP Mode)\n\n" +
          "Aap local network IP se connect hain jahan Google OAuth redirect setup impossible hai.\n" +
          "Local testing ke liye koi bhi mock Google Email enter karein:",
          "dhiraj.google@gmail.com"
        );

        if (!googleEmail) {
          setLoading(false);
          return; // Cancelled
        }

        const emailClean = googleEmail.trim().toLowerCase();
        if (!emailClean.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          setError("Please enter a valid email address for mock login.");
          setLoading(false);
          return;
        }

        // Generate a nice name from the email prefix
        const mockName = emailClean.split("@")[0]
          .split(/[\._-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") + " (Google)";

        const mockPassword = "google_mock_password_bypass_123";

        // Try signing in using mock credentials
        const result = await signIn("credentials", {
          email: emailClean,
          password: mockPassword,
          redirect: false,
        });

        if (result?.error) {
          // Auto-register mock user if they don't exist in local DB
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
            // Log in again
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
        // 3. Real Google OAuth is configured, run normal redirect
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
    <div className="min-h-screen bg-[#0a0a12] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white font-display">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-xs text-zinc-400">
          Enter your credentials or sign in using Google
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div
          onMouseMove={handleMouseMove}
          className="premium-card spotlight-glow rounded-2xl border border-white/[0.04] shadow-2xl p-8 relative overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/60"
        >
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 leading-normal relative z-10">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4 relative z-10" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                  className="block w-full pl-9 pr-3 py-2 bg-zinc-950/60 border border-white/[0.06] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="text-[10px] font-semibold text-primary hover:text-primary/95 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 bg-zinc-950/60 border border-white/[0.06] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs py-2 h-9 rounded-lg border border-white/5 shadow-md shadow-primary/10 transition-all duration-300 flex items-center justify-center gap-1.5"
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
              <span className="px-3 bg-transparent text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Or Continue With
              </span>
            </div>
          </div>

          <div className="mt-4 relative z-20">
            <button
              onClick={handleGoogleLogin}
              type="button"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-zinc-950/50 hover:bg-zinc-900 border border-white/[0.06] hover:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span>Google OAuth Login</span>
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:text-primary/95 transition-colors"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center text-xs text-zinc-500">
        <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
        <span>Loading Login Form...</span>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
