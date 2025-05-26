import { stripe } from "./stripe-config"
import { getUserData, updateUserData } from "@/lib/firebase/firestore-service"

export interface PublicationPayment {
  id: string
  pageId: string
  userId: string
  amount: number
  status: string
  paymentIntentId: string
  createdAt: Date
  refundedAt?: Date
}

export const PUBLICATION_CONFIG = {
  price: 4.99, // $4.99 per page publication
  currency: "usd",
  description: "Page Publication Fee",
}

export async function createPublicationPayment(
  userId: string,
  pageId: string,
  pageTitle: string,
  successUrl: string,
  cancelUrl: string,
) {
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
      payment_method_types: ["card", "apple_pay", "google_pay"],
      line_items: [
        {
          price_data: {
            currency: PUBLICATION_CONFIG.currency,
            product_data: {
              name: `Publish Page: ${pageTitle}`,
              description: PUBLICATION_CONFIG.description,
              metadata: {
                pageId,
                userId,
              },
            },
            unit_amount: Math.round(PUBLICATION_CONFIG.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        pageId,
        type: "page_publication",
      },
      payment_intent_data: {
        metadata: {
          userId,
          pageId,
          type: "page_publication",
        },
      },
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "IT", "ES", "NL", "BR"],
      },
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error("Error creating publication payment:", error)
    throw new Error("Failed to create publication payment")
  }
}

export async function refundPublication(paymentIntentId: string, reason?: string) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason as any,
      metadata: {
        type: "page_publication_refund",
        refund_reason: reason || "requested_by_customer",
      },
    })

    return refund
  } catch (error) {
    console.error("Error creating refund:", error)
    throw new Error("Failed to process refund")
  }
}

export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error("Error retrieving payment intent:", error)
    return null
  }
}

export async function getCustomerPayments(customerId: string, limit = 50) {
  try {
    const charges = await stripe.charges.list({
      customer: customerId,
      limit,
    })

    return charges.data.filter((charge) => charge.metadata?.type === "page_publication")
  } catch (error) {
    console.error("Error getting customer payments:", error)
    return []
  }
}
