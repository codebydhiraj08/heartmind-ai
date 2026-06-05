import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import {
  createStripeCheckoutSession,
  createRazorpayOrder,
  PLANS
} from "@/lib/subscription-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { plan, region } = body as { plan: string; region?: string };

    if (!plan || (plan !== "pro" && plan !== "premium")) {
      return NextResponse.json({ success: false, error: "Invalid plan selected" }, { status: 400 });
    }

    // After validation, plan is guaranteed to be "pro" | "premium"
    const validPlan = plan as keyof typeof PLANS;

    await connectToDatabase();
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const userEmail = user.email;
    
    // Secure billing region resolution: database value is the single source of truth.
    // If not set, check geolocation headers before falling back to request param.
    const countryHeader = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "";
    let activeRegion = "US";

    if (user.billingRegion && (user.billingRegion === "IN" || user.billingRegion === "US")) {
      activeRegion = user.billingRegion;
    } else if (countryHeader.toUpperCase() === "IN") {
      activeRegion = "IN";
    } else if (region && (region.toUpperCase() === "IN" || region.toUpperCase() === "US")) {
      activeRegion = region.toUpperCase();
    }

    if (activeRegion === "IN") {
      // Indian regional flow: Razorpay Test Mode
      try {
        const order = await createRazorpayOrder(userId, validPlan);
        
        return NextResponse.json({
          success: true,
          gateway: "razorpay",
          orderId: order.id,
          amount: order.amount,
          currency: "INR",
          key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
          name: PLANS[validPlan].name,
          description: `Unlock ${PLANS[validPlan].name} Access`,
          prefill: {
            name: user.name,
            email: user.email,
          }
        });
      } catch (err: any) {
        console.error("Razorpay order creation failed:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
      }
    } else {
      // Global flow: Stripe Test Mode
      try {
        const stripeSession = await createStripeCheckoutSession(userId, userEmail, validPlan);
        return NextResponse.json({
          success: true,
          gateway: "stripe",
          url: stripeSession.url
        });
      } catch (err: any) {
        console.error("Stripe session creation failed:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
