import { type NextRequest, NextResponse } from "next/server";
import { updatePage, getPageById } from "@/lib/firebase/firestore-service";

export async function POST(request: NextRequest) {
  try {
    const { userId, pageId, paymentIntentId } = await request.json();

    if (!userId || !pageId) {
      return NextResponse.json({ error: "Missing userId or pageId" }, { status: 400 });
    }

    // Verify page exists and belongs to user
    const page = await getPageById(userId, pageId);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Force update page to published status
    await updatePage(userId, pageId, {
      paymentStatus: "paid",
      paymentIntentId: paymentIntentId || "manual-override",
      paidAt: new Date(),
      published: true,
      publishedUrl: pageId,
      publishedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Page forced to published status",
      pageId,
      publishedUrl: pageId,
    });
  } catch (error) {
    console.error("Force publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
