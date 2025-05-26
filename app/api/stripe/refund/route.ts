import { type NextRequest, NextResponse } from "next/server"
import { refundPublication } from "@/lib/stripe/publication-service"
import { updatePage, getPageById } from "@/lib/firebase/firestore-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, pageId, paymentIntentId, reason } = await request.json()

    if (!userId || !pageId || !paymentIntentId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify page exists and belongs to user
    const page = await getPageById(userId, pageId)
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Check if page is eligible for refund
    if (page.paymentStatus !== "paid") {
      return NextResponse.json({ error: "Page is not paid or already refunded" }, { status: 400 })
    }

    // Process refund
    const refund = await refundPublication(paymentIntentId, reason)

    // Update page status
    await updatePage(userId, pageId, {
      paymentStatus: "refunded",
      published: false,
      publishedUrl: null,
      refundedAt: new Date(),
      refundId: refund.id,
    })

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100, // Convert back to dollars
    })
  } catch (error) {
    console.error("Refund error:", error)
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 })
  }
}
