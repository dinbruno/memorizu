import { stripe } from "./stripe-config";
import { getUserData, updateUserData, getPublicationPricing } from "@/lib/firebase/firestore-service";

interface UserData {
  id: string;
  stripeCustomerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export interface PaymentData {
  id: string;
  pageId: string;
  userId: string;
  amount: number;
  status: string;
  paymentIntentId: string;
  createdAt: Date;
  refundedAt?: Date;
  receiptUrl?: string;
}

export async function createPagePublicationPayment(userId: string, pageId: string, pageTitle: string, successUrl: string, cancelUrl: string) {
  try {
    // Get pricing configuration
    const pricing = await getPublicationPricing();
    const priceInCents = Math.round(pricing.price * 100); // Convert to cents

    // Get or create user data
    let userData: UserData | null = await getUserData(userId);

    if (!userData) {
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
            currency: pricing.currency,
            product_data: {
              name: `Publicação da Página: ${pageTitle}`,
              description: pricing.description,
              metadata: {
                pageId,
                userId,
              },
            },
            unit_amount: priceInCents,
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
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error("Error creating publication payment:", error);
    throw new Error("Failed to create publication payment");
  }
}

export async function refundPagePublication(paymentIntentId: string, reason?: string) {
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

export async function getUserPayments(userId: string) {
  try {
    const userData = await getUserData(userId);
    if (!userData?.stripeCustomerId) return [];

    const charges = await stripe.charges.list({
      customer: userData.stripeCustomerId,
      limit: 100,
    });

    return charges.data
      .filter((charge) => charge.metadata?.type === "page_publication")
      .map((charge) => ({
        id: charge.id,
        amount: charge.amount / 100,
        status: charge.status,
        description: charge.description || "Publicação de Página",
        createdAt: new Date(charge.created * 1000),
        receiptUrl: charge.receipt_url,
        pageId: charge.metadata?.pageId,
        paymentIntentId: charge.payment_intent as string,
      }));
  } catch (error) {
    console.error("Error getting user payments:", error);
    return [];
  }
}
