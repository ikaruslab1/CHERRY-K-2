import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/notifications";

async function handler(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, body: messageBody, url } = body;

    if (!userId || !title || !messageBody) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`Processing certificate notification for user ${userId}`);

    await sendPushToUser(userId, {
      title,
      body: messageBody,
      url,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing QStash message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);

// Disable body parsing by Next.js if needed? No, verifySignatureAppRouter handles it.
// Actually, for verifySignatureAppRouter to work, it might need the raw body. 
// But in App Router, req.text() or req.json() reads the body.
// The wrapper handles verification.
