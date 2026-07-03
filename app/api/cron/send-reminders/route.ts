import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/push/redis";
import { getWebPush } from "@/lib/push/vapid";

// Called by Vercel Cron (see vercel.json) roughly once a minute.
// Protect with CRON_SECRET so randoms can't trigger sends.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const dueTaskIds = await redis.zrange<string[]>("reminders", 0, now, { byScore: true });

  if (!dueTaskIds || dueTaskIds.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const subRaw = await redis.get<string>("push:subscription");
  if (!subRaw) {
    // No device subscribed yet — clear the due items so they don't pile up.
    for (const id of dueTaskIds) {
      await redis.zrem("reminders", id);
      await redis.del(`reminder:${id}`);
    }
    return NextResponse.json({ sent: 0, reason: "no subscription" });
  }

  const subscription = typeof subRaw === "string" ? JSON.parse(subRaw) : subRaw;
  const webpush = getWebPush();
  let sent = 0;

  for (const taskId of dueTaskIds) {
    const details = await redis.hgetall<{ title: string; date: string; time: string }>(
      `reminder:${taskId}`
    );
    if (details?.title) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: "PlanFlow",
            body: `${details.title} · ${details.time}`,
            tag: `task-${taskId}`,
            data: { taskId },
          })
        );
        sent++;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Subscription expired/revoked — remove it so we stop retrying.
          await redis.del("push:subscription");
        }
      }
    }
    await redis.zrem("reminders", taskId);
    await redis.del(`reminder:${taskId}`);
  }

  return NextResponse.json({ sent });
}
