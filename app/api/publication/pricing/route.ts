import { type NextRequest, NextResponse } from "next/server";
import { getPublicationPricing } from "@/lib/firebase/firestore-service";

export async function GET(request: NextRequest) {
  try {
    const pricing = await getPublicationPricing();

    if (!pricing) {
      return NextResponse.json({ error: "Pricing configuration not found" }, { status: 404 });
    }

    return NextResponse.json(pricing);
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}
