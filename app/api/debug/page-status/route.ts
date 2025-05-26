import { type NextRequest, NextResponse } from "next/server";
import { getPageById } from "@/lib/firebase/firestore-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const pageId = searchParams.get("pageId");

    if (!userId || !pageId) {
      return NextResponse.json({ error: "Missing userId or pageId" }, { status: 400 });
    }

    const page = await getPageById(userId, pageId);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      pageId: page.id,
      title: (page as any).title,
      published: (page as any).published,
      paymentStatus: (page as any).paymentStatus,
      publishedUrl: (page as any).publishedUrl,
      paymentIntentId: (page as any).paymentIntentId,
      paidAt: (page as any).paidAt,
      publishedAt: (page as any).publishedAt,
      updatedAt: (page as any).updatedAt,
    });
  } catch (error) {
    console.error("Debug page status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
