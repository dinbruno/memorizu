import { stripe, STRIPE_CONFIG } from "./stripe-config"
import { updateUserData, getUserData } from "@/lib/firebase/firestore-service"

export interface SubscriptionData {
  id: string
  status: string
  priceId: string
  planName: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  customerId: string
}

export async function createCheckoutSession(userId: string, priceId: string, successUrl: string, cancelUrl: string) {
  try {
    // Get or create customer
    const userData = await getUserData(userId)
    let customerId = userData?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId,
        },
      })
      customerId = customer.id

      // Save customer ID to user data
      await updateUserData(userId, {
        stripeCustomerId: customerId,
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw new Error("Failed to create checkout session")
  }
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  } catch (error) {
    console.error("Error creating portal session:", error)
    throw new Error("Failed to create portal session")
  }
}

export async function getSubscription(subscriptionId: string): Promise<SubscriptionData | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    if (!subscription) return null

    const price = subscription.items.data[0]?.price
    const planName = Object.values(STRIPE_CONFIG.plans).find((plan) => plan.priceId === price?.id)?.name || "Unknown"

    return {
      id: subscription.id,
      status: subscription.status,
      priceId: price?.id || "",
      planName,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      customerId: subscription.customer as string,
    }
  } catch (error) {
    console.error("Error getting subscription:", error)
    return null
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
    return subscription
  } catch (error) {
    console.error("Error canceling subscription:", error)
    throw new Error("Failed to cancel subscription")
  }
}

export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
    return subscription
  } catch (error) {
    console.error("Error reactivating subscription:", error)
    throw new Error("Failed to reactivate subscription")
  }
}

export async function getPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    })
    return paymentMethods.data
  } catch (error) {
    console.error("Error getting payment methods:", error)
    return []
  }
}

export async function getInvoices(customerId: string, limit = 10) {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    })
    return invoices.data
  } catch (error) {
    console.error("Error getting invoices:", error)
    return []
  }
}
