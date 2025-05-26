import { type NextRequest, NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe/stripe-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, priceId } = await request.json()

    if (!userId || !priceId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const origin = request.headers.get("origin") || "http://localhost:3000"
    const successUrl = `${origin}/dashboard/billing?success=true`
    const cancelUrl = `${origin}/dashboard/billing?canceled=true`

    const { sessionId, url } = await createCheckoutSession(userId, priceId, successUrl, cancelUrl)

    return NextResponse.json({ sessionId, url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
