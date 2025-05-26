import { type NextRequest, NextResponse } from "next/server";
import { updatePublicationPricing } from "@/lib/firebase/firestore-service";

export async function POST(request: NextRequest) {
  try {
    // Initialize with default pricing
    await updatePublicationPricing({
      price: 1.0,
      currency: "brl",
      description: "Page Publication Fee",
    });

    return NextResponse.json({
      success: true,
      message: "Publication pricing initialized successfully",
      pricing: {
        price: 1.0,
        currency: "brl",
        description: "Page Publication Fee",
      },
    });
  } catch (error) {
    console.error("Error initializing pricing:", error);
    return NextResponse.json({ error: "Failed to initialize pricing" }, { status: 500 });
  }
}
