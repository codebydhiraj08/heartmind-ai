"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Check,
  Sparkles,
  Globe,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Lock,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useSubscription, SubscriptionState } from "@/hooks/use-subscription";

interface PlanInfo {
  name: string;
  description: string;
  priceINR: number;
  priceUSD: number;
  features: string[];
  buttonText: string;
  badge?: string;
  disabled?: boolean;
}

// Pricing structure
const PLANS: Record<"free" | "pro" | "premium", PlanInfo> = {
  free: {
    name: "HeartMind Free",
    description: "Begin exploring your relationship dynamics and understanding core communication patterns.",
    priceINR: 0,
    priceUSD: 0,
    features: [
      "✔ 3 initial relationship insight sessions",
      "✔ Basic communication tone detection",
      "✔ Baseline attachment pattern outline",
      "✔ Partial dashboard visibility preview",
      "🔒 Voice emotional sentiment decoding",
      "🔒 Shared relationship timeline mapping",
      "🔒 Live AI coaching & compatibility charts",
    ],
    buttonText: "Your current clarity journey",
    disabled: true,
  },
  pro: {
    name: "HeartMind Pro",
    description: "Step into profound clarity. Uncover underlying communication trends, map subtle emotional patterns, and receive naturally aligned AI guidance for everyday connections.",
    priceINR: 499,
    priceUSD: 29,
    features: [
      "✔ Continuous relationship insight sessions",
      "✔ Sub-surface emotional behavior & pattern detection",
      "✔ Subtle voice sentiment & tone stress decoding",
      "✔ Naturally aligned, empathetic AI communication reframing",
      "✔ Meaningful long-term communication trends & visibility",
    ],
    buttonText: "Step into emotional visibility",
    badge: "Complete Experience",
  },
  premium: {
    name: "HeartMind Premium",
    description: "For conscious couples seeking ultimate alignment. Map your shared emotional timeline, engage with your personal AI Relationship Coach, and chart deep relationship dynamics.",
    priceINR: 999,
    priceUSD: 49,
    features: [
      "✔ Expanded relationship coaching sessions",
      "✔ Live, emotionally intelligent guidance with your AI Relationship Coach",
      "✔ Full relationship picture compatibility & alignment charting",
      "✔ Shared emotional growth timeline & memory logs",
      "✔ Advanced behavioral mapping & interaction style analysis",
      "✔ Expanded long-term relationship insights",
    ],
    buttonText: "Begin shared relationship mapping",
    badge: "Deepest Understanding",
  },
};

export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { subscription, usage, loading: subLoading, refreshSubscription } = useSubscription();

  const [selectedRegion, setSelectedRegion] = useState<"IN" | "US">("US");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Region detection logic
  useEffect(() => {
    // 1. Check for manual override in localStorage
    const savedRegion = localStorage.getItem("heartmind_billing_region");
    if (savedRegion === "IN" || savedRegion === "US") {
      setSelectedRegion(savedRegion);
      return;
    }

    // 2. Check from API returned database subscription region
    if (subscription?.billingRegion) {
      const dbRegion = subscription.billingRegion.toUpperCase();
      if (dbRegion === "IN" || dbRegion === "US") {
        setSelectedRegion(dbRegion as "IN" | "US");
        return;
      }
    }

    // 3. Fallback to browser locale
    try {
      const locale = navigator.language || "";
      if (locale.includes("IN") || locale.toLowerCase().includes("hi") || locale.toLowerCase().includes("-in")) {
        setSelectedRegion("IN");
      } else {
        setSelectedRegion("US");
      }
    } catch (e) {
      setSelectedRegion("US");
    }
  }, [subscription]);

  // Dynamically load Razorpay SDK script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Poll server-side database user subscription state to verify webhook has completed activation
  const verifySubscriptionStatus = async (targetTier: string) => {
    setIsVerifying(true);
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkStatus = async () => {
      attempts++;
      const current = await refreshSubscription();
      // Fetch latest state directly
      try {
        const res = await fetch("/api/subscription/status");
        const data = await res.json();
        if (data.success && data.subscription.tier === targetTier) {
          setPaymentSuccess(true);
          setIsVerifying(false);
          setLoadingPlan(null);
          return;
        }
      } catch (err) {
        console.error("Error polling subscription status:", err);
      }

      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 1500);
      } else {
        setIsVerifying(false);
        setLoadingPlan(null);
        setPaymentError(
          "Your transaction succeeded, but database sync is taking longer than expected. Please wait a moment and refresh the dashboard."
        );
      }
    };

    checkStatus();
  };

  // Handle plan upgrade trigger
  const handleUpgrade = async (planKey: "pro" | "premium") => {
    setLoadingPlan(planKey);
    setPaymentError(null);

    try {
      // Post request to initiate checkout
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planKey,
          region: selectedRegion,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize secure checkout session");
      }

      // Check payment gateway returned
      if (data.gateway === "stripe") {
        if (data.url) {
          // Stripe checkout redirect
          window.location.href = data.url;
        } else {
          throw new Error("Stripe checkout URL is missing.");
        }
      } else if (data.gateway === "razorpay") {
        // Razorpay checkout flow
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay Payment Gateway SDK. Please check your network.");
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: "HeartMind.ai",
          description: data.description,
          order_id: data.orderId,
          handler: async function (response: any) {
            // Success handler callback
            setIsVerifying(true);
            // Razorpay payment successfully authorized client-side. Webhook will process the capture securely,
            // but we poll the server status to dynamically unlock without hard refreshes.
            verifySubscriptionStatus(planKey);
          },
          prefill: {
            name: data.prefill?.name || "",
            email: data.prefill?.email || "",
          },
          theme: {
            color: "#ec4899", // Primary pink color accent
          },
          modal: {
            ondismiss: function () {
              setLoadingPlan(null);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      console.error("Upgrade error:", err);
      setPaymentError(err.message || "An unexpected error occurred during checkout setup.");
      setLoadingPlan(null);
    }
  };

  // Change region preference and update DB/localStorage
  const handleRegionChange = async (region: "IN" | "US") => {
    setSelectedRegion(region);
    localStorage.setItem("heartmind_billing_region", region);

    // Persist user region setting in the database securely
    try {
      await fetch("/api/subscription/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ region }),
      });
      await refreshSubscription();
    } catch (e) {
      console.error("Failed to update user database region preference:", e);
    }
  };

  const activeTier = subscription?.tier || "free";

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Elevate Your Connections
        </motion.div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Choose your level of <span className="gradient-text">emotional clarity</span>
        </h1>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto">
          Deepen your communication, understand relationship patterns, and build lasting, healthy connections.
        </p>

        {/* Region selector manually controlled */}
        <div className="pt-4 flex justify-center">
          <div className="p-1 rounded-xl bg-zinc-900 border border-white/[0.04] inline-flex items-center gap-1 shadow-inner">
            <button
              onClick={() => handleRegionChange("IN")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                selectedRegion === "IN"
                  ? "bg-primary text-white shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              India (₹ INR)
            </button>
            <button
              onClick={() => handleRegionChange("US")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                selectedRegion === "US"
                  ? "bg-primary text-white shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              International ($ USD)
            </button>
          </div>
        </div>
      </div>

      {/* Verification / Loading overlay */}
      <AnimatePresence>
        {(isVerifying || paymentSuccess || paymentError) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md p-6 bg-zinc-950 border border-white/[0.06] rounded-2xl text-center space-y-6 shadow-2xl glass-strong"
            >
              {isVerifying && (
                <div className="space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-2 border-t-primary rounded-full animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Verifying Payment Status</h3>
                  <p className="text-xs text-zinc-400">
                    Securely connecting with payment networks to provision your premium access credentials. Please wait...
                  </p>
                </div>
              )}

              {paymentSuccess && (
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white">A New Level of Clarity Active</h3>
                  <p className="text-xs text-zinc-300">
                    Welcome to your expanded clarity journey. Your advanced emotional intelligence suite is now active and ready to guide your connection path.
                  </p>
                  <Button
                    onClick={() => {
                      setPaymentSuccess(false);
                      router.push("/dashboard");
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-10 rounded-xl"
                  >
                    Enter Dashboard
                    <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Button>
                </div>
              )}

              {paymentError && (
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/20 text-danger flex items-center justify-center mx-auto shadow-md">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Checkout Incomplete</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{paymentError}</p>
                  <Button
                    onClick={() => setPaymentError(null)}
                    className="w-full bg-zinc-900 border border-white/[0.06] hover:bg-zinc-800 text-white text-xs font-semibold h-10 rounded-xl"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {Object.entries(PLANS).map(([key, plan], idx) => {
          const isCurrentPlan = activeTier === key;
          const isFree = key === "free";
          const price = selectedRegion === "IN" ? plan.priceINR : plan.priceUSD;
          const currencySymbol = selectedRegion === "IN" ? "₹" : "$";
          const priceDisplay = isFree ? "Free" : `${currencySymbol}${price}`;

          const isPro = key === "pro";
          const isPremium = key === "premium";

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`rounded-2xl border relative overflow-hidden transition-all duration-300 ${
                isPremium
                  ? "border-primary bg-zinc-950/90 shadow-2xl md:scale-105 md:-translate-y-1 neon-glow-pink"
                  : isPro
                  ? "border-accent/40 bg-zinc-950/80 shadow-xl"
                  : "border-white/[0.04] bg-zinc-950/60"
              }`}
            >
              {/* Premium Glow Top Bar */}
              {isPremium && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-accent to-neon-cyan" />
              )}

              {/* Plan Badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <span className={`text-[9px] font-extrabold uppercase py-1 px-2.5 rounded-full tracking-widest ${
                    isPremium 
                      ? "bg-primary text-white border border-primary/20 animate-pulse" 
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                      Subscription Plan
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
                      {plan.name}
                      {isPremium && <Crown className="w-4 h-4 text-primary fill-primary" />}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="pt-2 flex items-baseline">
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {priceDisplay}
                    </span>
                    {!isFree && (
                      <span className="text-xs text-zinc-400 font-semibold ml-1.5 uppercase tracking-wide">
                        / month
                      </span>
                    )}
                  </div>

                  <hr className="border-white/[0.04]" />

                  {/* Features List */}
                  <ul className="space-y-3 pt-2">
                    {plan.features.map((feature, idx) => {
                      const hasCheckIcon = feature.startsWith("✔ ");
                      const hasLockIcon = feature.startsWith("🔒 ");
                      const cleanFeature = hasCheckIcon || hasLockIcon ? feature.substring(2) : feature;
                      const isLocked = hasLockIcon;

                      return (
                        <li key={idx} className={`flex items-start gap-2.5 text-xs ${isLocked ? "text-zinc-500" : "text-zinc-300"}`}>
                          <div className={`w-4.5 h-4.5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                            isLocked
                              ? "bg-zinc-950/80 text-zinc-600 border border-zinc-900"
                              : isPremium 
                              ? "bg-primary/10 text-primary" 
                              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                          }`}>
                            {isLocked ? (
                              <Lock className="w-2.5 h-2.5" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                          <span className="leading-relaxed">{cleanFeature}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Call To Action Button */}
                <div className="pt-6">
                  {isCurrentPlan ? (
                    <Button
                      disabled
                      className="w-full bg-zinc-900 border border-white/[0.06] text-zinc-400 text-xs font-semibold h-11 rounded-xl"
                    >
                      Active Subscription
                    </Button>
                  ) : isFree ? (
                    <Button
                      disabled
                      className="w-full bg-zinc-950 border border-white/[0.03] text-zinc-500 text-xs font-semibold h-11 rounded-xl"
                    >
                      Included by Default
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(key as "pro" | "premium")}
                      disabled={loadingPlan !== null}
                      className={`w-full text-xs font-semibold h-11 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        isPremium
                          ? "bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white border border-white/5 shadow-md shadow-primary/10 hover:scale-[1.01]"
                          : "bg-zinc-900 border border-white/[0.06] hover:bg-zinc-850 text-white"
                      }`}
                    >
                      {loadingPlan === key ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                          Processing checkout...
                        </>
                      ) : (
                        <>
                          {plan.buttonText}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </motion.div>
          );
        })}
      </div>

      {/* Safe check stamp badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 text-zinc-500 text-[10px] sm:text-xs font-medium border-t border-white/[0.03]"
      >
        <span className="flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-zinc-400" />
          Secured transactions processed by Stripe & Razorpay
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-zinc-400" />
          SSL secure encryption and test mode compliance
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-zinc-400" />
          Instant activation and hassle-free cancellation
        </span>
      </motion.div>
    </div>
  );
}
