import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface SubscriptionState {
  tier: "free" | "pro" | "premium";
  status: string;
  paymentProvider: string;
  billingRegion: string;
  currency: string;
  expiresAt: string | null;
  // Refined Premium Trial fields
  isTrialActive: boolean;
  trialExpiresAt: string | null;
  trialActivatedAt: string | null;
  hasUsedTrial: boolean;
  premiumAccessSource: "trial" | "subscription" | "none";
}

export interface UsageState {
  freeAnalysisUsed: boolean;
  monthlyAnalysisCount: number;
  monthlyLimit: number;
}

export function useSubscription() {
  const { status: authStatus } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (authStatus !== "authenticated") {
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/subscription/status?_t=" + Date.now(), { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to reach subscription API");
      }
      const data = await res.json();
      
      if (data.success) {
        setSubscription(data.subscription);
        setUsage(data.usage);
        setError(null);
      } else {
        setError(data.error || "Failed to load subscription details");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch subscription");
    } finally {
      setLoading(false);
    }
  }, [authStatus]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    usage,
    loading,
    error,
    refreshSubscription: fetchSubscription,
  };
}
