import { Receiver } from "@upstash/qstash";
import { NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    // Verify QStash signature at runtime (not at module load time)
    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

    if (!currentSigningKey || !nextSigningKey) {
      console.error("QStash signing keys not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Get the signature from headers
    const signature = req.headers.get("upstash-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Get the raw body for verification
    const body = await req.text();
    
    // Verify the signature
    const receiver = new Receiver({
      currentSigningKey,
      nextSigningKey,
    });

    try {
      await receiver.verify({
        signature,
        body,
      });
    } catch (error) {
      console.error("Invalid signature:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse the verified body
    const payload = JSON.parse(body);
    const { userId, title, body: messageBody, url } = payload;

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
