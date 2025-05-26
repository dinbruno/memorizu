import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe/stripe-config"
import { updatePage } from "@/lib/firebase/firestore-service"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case "charge.dispute.created":
        await handleChargeDispute(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Publication webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, pageId } = session.metadata || {}
  if (!userId || !pageId) return

  // Update page with payment information
  await updatePage(userId, pageId, {
    paymentStatus: "paid",
    paymentIntentId: session.payment_intent as string,
    paidAt: new Date(),
    published: true,
    publishedUrl: `${userId}/${pageId}`,
    publishedAt: new Date(),
  })

  console.log(`Page ${pageId} published successfully for user ${userId}`)
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { userId, pageId } = paymentIntent.metadata || {}
  if (!userId || !pageId) return

  // Ensure page is marked as paid and published
  await updatePage(userId, pageId, {
    paymentStatus: "paid",
    paymentIntentId: paymentIntent.id,
    paidAt: new Date(),
    published: true,
    publishedUrl: `${userId}/${pageId}`,
    publishedAt: new Date(),
  })
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { userId, pageId } = paymentIntent.metadata || {}
  if (!userId || !pageId) return

  // Mark payment as failed
  await updatePage(userId, pageId, {
    paymentStatus: "failed",
    paymentIntentId: paymentIntent.id,
    published: false,
    publishedUrl: null,
  })

  console.log(`Payment failed for page ${pageId}, user ${userId}`)
}

async function handleChargeDispute(dispute: Stripe.Dispute) {
  const charge = await stripe.charges.retrieve(dispute.charge as string)
  const { userId, pageId } = charge.metadata || {}

  if (!userId || !pageId) return

  // Handle dispute - unpublish page
  await updatePage(userId, pageId, {
    paymentStatus: "disputed",
    published: false,
    publishedUrl: null,
    disputedAt: new Date(),
    disputeId: dispute.id,
  })

  console.log(`Dispute created for page ${pageId}, user ${userId}`)
}
