import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/push/redis";

// Schedule (or reschedule) a reminder for a task.
export async function POST(req: NextRequest) {
  const { taskId, title, date, time, dueAt } = await req.json();
  if (!taskId || !title || !dueAt) {
    return NextResponse.json({ error: "taskId, title, and dueAt are required" }, { status: 400 });
  }
  const key = String(taskId);
  await redis.hset(`reminder:${key}`, { title, date, time });
  await redis.zadd("reminders", { score: dueAt, member: key });
  return NextResponse.json({ ok: true });
}

// Cancel a scheduled reminder (task completed or deleted).
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }
  await redis.zrem("reminders", taskId);
  await redis.del(`reminder:${taskId}`);
  return NextResponse.json({ ok: true });
}
