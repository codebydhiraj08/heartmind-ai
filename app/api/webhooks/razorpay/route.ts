import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook secret missing in backend .env" }, { status: 500 });
  }

  // Verify Razorpay signature securely on the server
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("Razorpay webhook signature verification failed.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  await connectToDatabase();

  try {
    const payload = event.payload;

    switch (event.event) {
      case "order.paid": {
        const order = payload.order.entity;
        const userId = order.notes?.userId;
        const planKey = order.notes?.planKey;

        if (userId && (planKey === "pro" || planKey === "premium")) {
          const user = await User.findOne({ _id: userId });
          if (user) {
            user.subscriptionTier = planKey;
            user.subscriptionStatus = "active";
            user.paymentProvider = "razorpay";
            user.subscriptionId = order.id;
            user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            user.billingRegion = "IN";
            user.currency = "INR";
            await user.save();
            console.log(`User ${userId} successfully upgraded to ${planKey} via Razorpay Order.`);
          }
        }
        break;
      }
      case "subscription.activated":
      case "subscription.charged": {
        const sub = payload.subscription.entity;
        const userId = sub.notes?.userId || sub.notes?.user_id;
        const planKey = sub.notes?.planKey || sub.notes?.plan_key;

        if (userId && (planKey === "pro" || planKey === "premium")) {
          const user = await User.findOne({ _id: userId });
          if (user) {
            user.subscriptionTier = planKey;
            user.subscriptionStatus = "active";
            user.paymentProvider = "razorpay";
            user.subscriptionId = sub.id;
            user.subscriptionExpiresAt = sub.end_at ? new Date(sub.end_at * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            user.billingRegion = "IN";
            user.currency = "INR";
            await user.save();
            console.log(`Razorpay subscription ${sub.id} charged/activated. User ${userId} tier: ${planKey}`);
          }
        }
        break;
      }
      case "subscription.cancelled":
      case "subscription.halted": {
        const sub = payload.subscription.entity;
        const subscriptionId = sub.id;
        const user = await User.findOne({ subscriptionId });
        if (user) {
          user.subscriptionTier = "free";
          user.subscriptionStatus = "none";
          user.subscriptionExpiresAt = null;
          await user.save();
          console.log(`Razorpay subscription ${subscriptionId} cancelled. Downgraded user ${user._id} to free.`);
        }
        break;
      }
      default:
        console.log(`Unhandled Razorpay event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Razorpay webhook processing error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
