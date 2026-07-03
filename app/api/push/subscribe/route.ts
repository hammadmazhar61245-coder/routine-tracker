import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/push/redis";

export async function POST(req: NextRequest) {
  const subscription = await req.json();
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }
  await redis.set("push:subscription", JSON.stringify(subscription));
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await redis.del("push:subscription");
  return NextResponse.json({ ok: true });
}
