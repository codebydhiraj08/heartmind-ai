"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Module-level cache to prevent React 18 Strict Mode double-render issues in dev
const verifiedTokens = new Set<string>();

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const hasCalled = useRef(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleVerification = useCallback(async () => {
    if (!token) {
      setError("Email activation token is missing in the URL.");
      setLoading(false);
      return;
    }

    // If already verified in this session (React Strict Mode double-render fix)
    if (verifiedTokens.has(token)) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed. The link may be expired.");
        setLoading(false);
      } else {
        verifiedTokens.add(token);
        setSuccess(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError("An unexpected connection error occurred. Please try again.");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!hasCalled.current) {
      hasCalled.current = true;
      handleVerification();
    }
  }, [handleVerification]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white font-display">
          Account activation
        </h2>
        <p className="mt-2 text-center text-xs text-zinc-400">
          Email ownership validation and security check
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.05 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div
          onMouseMove={handleMouseMove}
          className="premium-card spotlight-glow rounded-2xl border border-white/[0.04] shadow-2xl p-8 relative overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/60"
        >
          <div className="relative z-10 py-4 flex flex-col items-center">
            {loading ? (
              <div className="space-y-4 text-center">
                <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Verifying activation token...</h3>
                  <p className="text-[11px] text-zinc-500 mt-1">Checking secure verification logs</p>
                </div>
              </div>
            ) : success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 text-center w-full"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Email Verified!</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Thank you! Your email address has been successfully verified, and your profile is now fully active.
                  </p>
                </div>
                <div className="pt-4">
                  <Link href="/login" className="w-full block">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs py-2 h-9 rounded-lg border border-white/5 shadow-md shadow-primary/10 transition-all duration-300 flex items-center justify-center gap-1.5">
                      <span>Proceed to Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 text-center w-full"
              >
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Verification Failed</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    {error}
                  </p>
                </div>
                <div className="pt-4">
                  <Link href="/signup" className="w-full block">
                    <Button className="w-full bg-zinc-950/50 hover:bg-zinc-900 border border-white/[0.06] hover:border-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs py-2 h-9 rounded-lg transition-all duration-300">
                      Create new account
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-xs text-zinc-500">
        <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
        <span>Loading Verification...</span>
      </div>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
