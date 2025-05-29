import { NextResponse } from "next/server";
import { getUserPayments } from "@/lib/stripe/stripe-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const transactions = await getUserPayments(userId);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
