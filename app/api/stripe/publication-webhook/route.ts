import { type NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe/stripe-config";
import { updatePage } from "@/lib/firebase/firestore-service";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_PUBLICATION_WEBHOOK_SECRET || STRIPE_CONFIG.webhookSecret;
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    console.error("Body length:", body.length);
    console.error("Signature:", signature?.substring(0, 20) + "...");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.dispute.created":
        await handleChargeDispute(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Publication webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("Checkout completed webhook received:", {
    sessionId: session.id,
    metadata: session.metadata,
    paymentStatus: session.payment_status,
    paymentIntent: session.payment_intent,
  });

  const { userId, pageId } = session.metadata || {};
  if (!userId || !pageId) {
    console.error("Missing metadata in checkout session:", session.metadata);
    return;
  }

  try {
    const updateData = {
      paymentStatus: "paid",
      paymentIntentId: session.payment_intent as string,
      paidAt: new Date(),
      published: true,
      publishedUrl: pageId,
      publishedAt: new Date(),
    };

    console.log("Attempting to update page with data:", updateData);

    // Update page with payment information
    await updatePage(userId, pageId, updateData);

    console.log(`Page ${pageId} published successfully for user ${userId}`);

    // Verify the update was successful
    const { getPageById } = await import("@/lib/firebase/firestore-service");
    const updatedPage = await getPageById(userId, pageId);
    console.log("Page after update:", {
      id: (updatedPage as any)?.id,
      published: (updatedPage as any)?.published,
      paymentStatus: (updatedPage as any)?.paymentStatus,
      paymentIntentId: (updatedPage as any)?.paymentIntentId,
    });
  } catch (error) {
    console.error("Error updating page in checkout completed:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      userId,
      pageId,
    });
    throw error;
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { userId, pageId } = paymentIntent.metadata || {};
    if (!userId || !pageId) {
      console.warn("Missing metadata in payment intent:", paymentIntent.metadata);
      return;
    }

    // Ensure page is marked as paid and published
    await updatePage(userId, pageId, {
      paymentStatus: "paid",
      paymentIntentId: paymentIntent.id,
      paidAt: new Date(),
      published: true,
      publishedUrl: pageId,
      publishedAt: new Date(),
    });

    console.log(`Payment succeeded for page ${pageId}, user ${userId}`);
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { userId, pageId } = paymentIntent.metadata || {};
    if (!userId || !pageId) {
      console.warn("Missing metadata in payment intent:", paymentIntent.metadata);
      return;
    }

    // Mark payment as failed
    await updatePage(userId, pageId, {
      paymentStatus: "failed",
      paymentIntentId: paymentIntent.id,
      published: false,
      publishedUrl: null,
    });

    console.log(`Payment failed for page ${pageId}, user ${userId}`);
  } catch (error) {
    console.error("Error handling payment failed:", error);
    throw error;
  }
}

async function handleChargeDispute(dispute: Stripe.Dispute) {
  try {
    const charge = await stripe.charges.retrieve(dispute.charge as string);
    const { userId, pageId } = charge.metadata || {};

    if (!userId || !pageId) {
      console.warn("Missing metadata in charge:", charge.metadata);
      return;
    }

    // Handle dispute - unpublish page
    await updatePage(userId, pageId, {
      paymentStatus: "disputed",
      published: false,
      publishedUrl: null,
      disputedAt: new Date(),
      disputeId: dispute.id,
    });

    console.log(`Dispute created for page ${pageId}, user ${userId}`);
  } catch (error) {
    console.error("Error handling charge dispute:", error);
    throw error;
  }
}
