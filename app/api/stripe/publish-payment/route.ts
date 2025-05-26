import { type NextRequest, NextResponse } from "next/server"
import { createPublicationPayment } from "@/lib/stripe/publication-service"
import { getPageById } from "@/lib/firebase/firestore-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, pageId } = await request.json()

    if (!userId || !pageId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify page exists and belongs to user
    const page = await getPageById(userId, pageId)
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Check if page is already published and paid
    if (page.published && page.paymentStatus === "paid") {
      return NextResponse.json({ error: "Page is already published and paid" }, { status: 400 })
    }

    const origin = request.headers.get("origin") || "http://localhost:3000"
    const successUrl = `${origin}/builder/${pageId}?payment=success`
    const cancelUrl = `${origin}/builder/${pageId}?payment=canceled`

    const { sessionId, url } = await createPublicationPayment(
      userId,
      pageId,
      page.title || "Untitled Page",
      successUrl,
      cancelUrl,
    )

    return NextResponse.json({ sessionId, url })
  } catch (error) {
    console.error("Publication payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
