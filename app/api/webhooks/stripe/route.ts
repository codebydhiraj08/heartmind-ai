import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { stripe } from "@/lib/subscription-service";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripeClient = stripe;
  if (!stripeClient) {
    return NextResponse.json({ error: "Stripe not initialized" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook secret missing in backend .env" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await connectToDatabase();

  try {
    const session = event.data.object as any;

    switch (event.type) {
      case "checkout.session.completed": {
        const userId = session.metadata?.userId;
        const planKey = session.metadata?.planKey;
        
        if (userId && (planKey === "pro" || planKey === "premium")) {
          const subscriptionId = session.subscription as string;
          let expiresAt = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000); // 31 days fallback
          
          if (subscriptionId) {
            const stripeSubscription = (await stripeClient.subscriptions.retrieve(subscriptionId)) as any;
            expiresAt = new Date(stripeSubscription.current_period_end * 1000);
          }

          const user = await User.findOne({ _id: userId });
          if (user) {
            user.subscriptionTier = planKey;
            user.subscriptionStatus = "active";
            user.paymentProvider = "stripe";
            user.customerId = session.customer as string;
            user.subscriptionId = subscriptionId;
            user.subscriptionExpiresAt = expiresAt;
            user.billingRegion = user.billingRegion || "US";
            user.currency = "USD";
            await user.save();
            console.log(`User ${userId} successfully upgraded to ${planKey} via Stripe.`);
          }
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const subscriptionId = session.subscription as string;
        if (subscriptionId) {
          const stripeSubscription = (await stripeClient.subscriptions.retrieve(subscriptionId)) as any;
          const expiresAt = new Date(stripeSubscription.current_period_end * 1000);
          
          const user = await User.findOne({ subscriptionId });
          if (user) {
            user.subscriptionStatus = "active";
            user.subscriptionExpiresAt = expiresAt;
            await user.save();
            console.log(`Stripe subscription ${subscriptionId} payment succeeded. Renewed until ${expiresAt}.`);
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscriptionId = session.id as string;
        const user = await User.findOne({ subscriptionId });
        if (user) {
          user.subscriptionTier = "free";
          user.subscriptionStatus = "none";
          user.subscriptionExpiresAt = null;
          await user.save();
          console.log(`Stripe subscription ${subscriptionId} was deleted. Downgraded user ${user._id} to free.`);
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscriptionId = session.id as string;
        const status = session.status;
        const user = await User.findOne({ subscriptionId });
        if (user) {
          if (status === "active" || status === "trialing") {
            user.subscriptionStatus = "active";
          } else if (status === "unpaid" || status === "past_due") {
            user.subscriptionStatus = "past_due";
          } else {
            user.subscriptionStatus = "none";
            user.subscriptionTier = "free";
            user.subscriptionExpiresAt = null;
          }
          await user.save();
          console.log(`Stripe subscription ${subscriptionId} status updated to ${status}.`);
        }
        break;
      }
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook execution error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
