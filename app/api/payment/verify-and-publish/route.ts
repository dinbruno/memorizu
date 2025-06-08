import { type NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe-config";
import { serverUpdatePage, serverGetPageById, serverGetUserData } from "@/lib/firebase/server-service";

export async function POST(request: NextRequest) {
  try {
    const { userId, pageId } = await request.json();

    if (!userId || !pageId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    console.log(`Verifying payment for page ${pageId}, user ${userId}`);

    // Get user data to find Stripe customer ID
    const userData = await serverGetUserData(userId);
    if (!userData?.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
    }

    // Check for successful payments for this page
    const charges = await stripe.charges.list({
      customer: userData.stripeCustomerId,
      limit: 100,
    });

    // Find a successful payment for this specific page
    const successfulPayment = charges.data.find(
      (charge) =>
        charge.status === "succeeded" &&
        charge.metadata?.pageId === pageId &&
        charge.metadata?.userId === userId &&
        charge.metadata?.type === "page_publication"
    );

    if (!successfulPayment) {
      return NextResponse.json({ error: "No successful payment found for this page" }, { status: 404 });
    }

    console.log("Found successful payment:", {
      chargeId: successfulPayment.id,
      amount: successfulPayment.amount / 100,
      paymentIntentId: successfulPayment.payment_intent,
    });

    // Update page to published status
    const updateData = {
      paymentStatus: "paid",
      paymentIntentId: successfulPayment.payment_intent as string,
      paidAt: new Date(successfulPayment.created * 1000),
      published: true,
      publishedUrl: pageId,
      publishedAt: new Date(),
      recoveredAt: new Date(), // Mark as recovered
    };

    await serverUpdatePage(userId, pageId, updateData);

    // Verify the update
    const updatedPage = await serverGetPageById(userId, pageId);

    console.log("Page updated successfully:", {
      id: pageId,
      published: (updatedPage as any)?.published,
      paymentStatus: (updatedPage as any)?.paymentStatus,
    });

    return NextResponse.json({
      success: true,
      page: {
        id: pageId,
        published: (updatedPage as any)?.published,
        paymentStatus: (updatedPage as any)?.paymentStatus,
        recoveredAt: new Date(),
      },
      payment: {
        chargeId: successfulPayment.id,
        amount: successfulPayment.amount / 100,
        date: new Date(successfulPayment.created * 1000),
      },
    });
  } catch (error) {
    console.error("Error verifying and publishing page:", error);
    return NextResponse.json(
      {
        error: "Failed to verify and publish page",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
