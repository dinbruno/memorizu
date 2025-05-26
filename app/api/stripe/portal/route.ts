import { type NextRequest, NextResponse } from "next/server"
import { createPortalSession } from "@/lib/stripe/stripe-service"
import { getUserData } from "@/lib/firebase/firestore-service"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const userData = await getUserData(userId)
    const customerId = userData?.stripeCustomerId

    if (!customerId) {
      return NextResponse.json({ error: "No customer found" }, { status: 404 })
    }

    const origin = request.headers.get("origin") || "http://localhost:3000"
    const returnUrl = `${origin}/dashboard/billing`

    const { url } = await createPortalSession(customerId, returnUrl)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Portal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
