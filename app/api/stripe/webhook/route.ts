import { type NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe/stripe-config";
import { updateUserData } from "@/lib/firebase/firestore-service";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.warn("Missing userId in subscription metadata:", subscription.metadata);
      return;
    }

    const price = subscription.items.data[0]?.price;
    const planName = Object.entries(STRIPE_CONFIG.plans).find(([, plan]) => plan.priceId === price?.id)?.[0] || "free";

    await updateUserData(userId, {
      plan: planName,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      stripeCustomerId: subscription.customer as string,
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    });

    console.log(`Subscription updated for user ${userId}: ${planName}`);
  } catch (error) {
    console.error("Error handling subscription change:", error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.warn("Missing userId in subscription metadata:", subscription.metadata);
      return;
    }

    await updateUserData(userId, {
      plan: "free",
      subscriptionId: null,
      subscriptionStatus: "canceled",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });

    console.log(`Subscription deleted for user ${userId}`);
  } catch (error) {
    console.error("Error handling subscription deletion:", error);
    throw error;
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if ((invoice as any).subscription) {
      const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
      await handleSubscriptionChange(subscription);
    }
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
    throw error;
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const userId = invoice.metadata?.userId;
    if (!userId) {
      console.warn("Missing userId in invoice metadata:", invoice.metadata);
      return;
    }

    // You might want to send an email notification here
    console.log(`Payment failed for user ${userId}`);
  } catch (error) {
    console.error("Error handling payment failed:", error);
    throw error;
  }
}
