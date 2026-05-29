import Stripe from "stripe";

// Load Razorpay dynamically inside a try-catch block to prevent fatal compilation errors
// if the local node_modules have not been fully synchronized yet.
let RazorpayClient: any = null;
try {
  RazorpayClient = require("razorpay");
} catch (e) {
  console.warn("Razorpay package not found in node_modules.");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any,
    })
  : null;

export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && RazorpayClient
  ? new RazorpayClient({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export const FREE_PLAN = {
  name: "HeartMind Free",
  monthlyLimit: 5,
};

export const PLANS = {
  pro: {
    name: "HeartMind Pro",
    inr: 499,
    usd: 29,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_1QproTestID123",
    razorpayPlanId: process.env.NEXT_PUBLIC_RAZORPAY_PRO_PLAN_ID || "plan_proTestID123",
    monthlyLimit: 100,
  },
  premium: {
    name: "HeartMind Premium",
    inr: 999,
    usd: 49,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || "price_1QpremiumTestID123",
    razorpayPlanId: process.env.NEXT_PUBLIC_RAZORPAY_PREMIUM_PLAN_ID || "plan_premiumTestID123",
    monthlyLimit: 500,
  },
};

/**
 * Validates a user's active subscription status based on database metadata and current time.
 */
export function isSubscriptionActive(
  tier: "free" | "pro" | "premium",
  status: string,
  expiresAt?: Date | string | null
): boolean {
  if (tier === "free") return true; // Free tier is technically always "active" but limited by feature gates
  
  const activeStatuses = ["active", "trialing", "canceled"]; // "canceled" but not yet expired is active
  if (!activeStatuses.includes(status)) return false;

  if (expiresAt) {
    const expiry = new Date(expiresAt);
    return expiry.getTime() > Date.now();
  }

  return true;
}

/**
 * Creates an official Stripe Checkout Session for subscription billing.
 */
export async function createStripeCheckoutSession(userId: string, email: string, planKey: "pro" | "premium") {
  if (!stripe) {
    throw new Error("Stripe secret key is missing in your .env file.");
  }

  const plan = PLANS[planKey];
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: email,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/upgrade?canceled=true`,
    metadata: {
      userId,
      planKey,
    },
  });

  return session;
}

/**
 * Creates an official Razorpay Subscription for recurring Indian billing.
 */
export async function createRazorpaySubscription(userId: string, planKey: "pro" | "premium") {
  if (!razorpay) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID / SECRET) are missing in your .env file.");
  }

  const plan = PLANS[planKey];
  const subscription = await razorpay.subscriptions.create({
    plan_id: plan.razorpayPlanId,
    customer_notify: 1,
    total_count: 12, // 1 Year of monthly billing
    notes: {
      userId,
      planKey,
    },
  });

  return subscription;
}

/**
 * Creates an official Razorpay Order (as a highly reliable fallback/local test method).
 */
export async function createRazorpayOrder(userId: string, planKey: "pro" | "premium") {
  if (!razorpay) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID / SECRET) are missing in your .env file.");
  }

  const plan = PLANS[planKey];
  const order = await razorpay.orders.create({
    amount: plan.inr * 100, // Amount in paisa
    currency: "INR",
    receipt: `receipt_${userId.substring(0, 10)}_${Date.now()}`,
    notes: {
      userId,
      planKey,
    },
  });

  return order;
}

export interface UserAccess {
  tier: "free" | "pro" | "premium";
  currentPlan: "free" | "trial" | "pro" | "premium";
  isTrialActive: boolean;
  trialStartedAt: Date | null;
  trialExpiresAt: Date | null;
  trialActivatedAt: Date | null;
  hasUsedTrial: boolean;
  premiumAccessSource: "trial" | "subscription" | "none";
}

export function getUserAccess(user: any): UserAccess {
  if (!user) {
    return {
      tier: "free",
      currentPlan: "free",
      isTrialActive: false,
      trialStartedAt: null,
      trialExpiresAt: null,
      trialActivatedAt: null,
      hasUsedTrial: false,
      premiumAccessSource: "none",
    };
  }

  const currentPlan = user.currentPlan || "free";
  const hasUsedTrial = user.hasUsedTrial === true || user.hasUsedTrial === "true";
  const trialStartedAt = user.trialStartedAt ? new Date(user.trialStartedAt) : null;
  const trialExpiresAt = user.trialExpiresAt ? new Date(user.trialExpiresAt) : null;
  const trialActivatedAt = user.trialActivatedAt ? new Date(user.trialActivatedAt) : null;

  // 1. Check if paid subscription is active
  const activeStatuses = ["active", "trialing", "canceled"];
  const isPaidActive =
    (user.subscriptionTier === "pro" || user.subscriptionTier === "premium") &&
    activeStatuses.includes(user.subscriptionStatus || "none") &&
    (!user.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt).getTime() > Date.now());

  // 2. Check if premium trial is active
  let isTrialActive = false;
  if (currentPlan === "trial" && trialExpiresAt) {
    isTrialActive = trialExpiresAt.getTime() > Date.now();
  }

  // 3. Resolve unified active tier
  let activeTier: "free" | "pro" | "premium" = "free";
  let premiumAccessSource: "trial" | "subscription" | "none" = "none";

  if (isPaidActive) {
    activeTier = user.subscriptionTier as "pro" | "premium";
    premiumAccessSource = "subscription";
  } else if (isTrialActive) {
    activeTier = "premium"; // Full premium unlocked
    premiumAccessSource = "trial";
  }

  return {
    tier: activeTier,
    currentPlan: isPaidActive ? (user.subscriptionTier as any) : (isTrialActive ? "trial" : "free"),
    isTrialActive,
    trialStartedAt,
    trialExpiresAt,
    trialActivatedAt,
    hasUsedTrial,
    premiumAccessSource,
  };
}
