import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { PLANS } from "@/lib/subscription-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !plan) {
      return NextResponse.json({ success: false, error: "Missing required verification parameters" }, { status: 400 });
    }

    if (plan !== "pro" && plan !== "premium") {
      return NextResponse.json({ success: false, error: "Invalid plan selected" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ success: false, error: "Razorpay credentials not configured in backend .env" }, { status: 500 });
    }

    // Verify signature securely
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("Razorpay signature verification failed. Generated:", generatedSignature, "Received:", razorpay_signature);
      return NextResponse.json({ success: false, error: "Invalid signature. Transaction verification failed." }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ success: false, error: "User profile not found" }, { status: 404 });
    }

    // Upgrade subscription state
    user.subscriptionTier = plan;
    user.subscriptionStatus = "active";
    user.paymentProvider = "razorpay";
    user.subscriptionId = razorpay_order_id;
    user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    user.billingRegion = "IN";
    user.currency = "INR";
    await user.save();

    console.log(`Razorpay signature verification success. User ${userId} upgraded to ${plan}.`);

    return NextResponse.json({ success: true, message: `Successfully upgraded to ${PLANS[plan as keyof typeof PLANS].name}` });
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
