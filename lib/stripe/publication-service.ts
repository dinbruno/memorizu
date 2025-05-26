import { stripe } from "./stripe-config";
import { getUserData, updateUserData, getPublicationPricing } from "@/lib/firebase/firestore-service";

interface UserData {
  id: string;
  stripeCustomerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export interface PublicationPayment {
  id: string;
  pageId: string;
  userId: string;
  amount: number;
  status: string;
  paymentIntentId: string;
  createdAt: Date;
  refundedAt?: Date;
}

export const PUBLICATION_CONFIG = {
  price: 1.0, // $4.99 per page publication
  currency: "brl",
  description: "Page Publication Fee",
};

export async function createPublicationPayment(userId: string, pageId: string, pageTitle: string, successUrl: string, cancelUrl: string) {
  try {
    // Get pricing configuration from Firebase (NEVER from client-side!)
    const pricingConfig = await getPublicationPricing();

    if (!pricingConfig || !pricingConfig.price) {
      throw new Error("Publication pricing not configured");
    }

    // Get or create user data
    let userData: UserData | null = await getUserData(userId);

    if (!userData) {
      // Create user document if it doesn't exist
      await updateUserData(userId, {
        createdAt: new Date(),
      });
      userData = await getUserData(userId);
    }

    let customerId = userData?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to user data
      await updateUserData(userId, {
        stripeCustomerId: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: pricingConfig.currency,
            product_data: {
              name: `Publish Page: ${pageTitle}`,
              description: pricingConfig.description,
              metadata: {
                pageId,
                userId,
              },
            },
            unit_amount: Math.round(pricingConfig.price * 100), // Convert to cents
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
        price: pricingConfig.price.toString(),
      },
      payment_intent_data: {
        metadata: {
          userId,
          pageId,
          type: "page_publication",
          price: pricingConfig.price.toString(),
        },
      },
      billing_address_collection: "auto",
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error("Error creating publication payment:", error);
    throw new Error("Failed to create publication payment");
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
    });

    return refund;
  } catch (error) {
    console.error("Error creating refund:", error);
    throw new Error("Failed to process refund");
  }
}

export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    return null;
  }
}

export async function getCustomerPayments(customerId: string, limit = 50) {
  try {
    const charges = await stripe.charges.list({
      customer: customerId,
      limit,
    });

    return charges.data.filter((charge) => charge.metadata?.type === "page_publication");
  } catch (error) {
    console.error("Error getting customer payments:", error);
    return [];
  }
}
