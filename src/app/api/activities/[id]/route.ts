import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!redis) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
    }
    const activity = await redis.get(`activity:${id}`);
    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const participants = (await redis.get(`activity:${id}:participants`)) || [];

    return NextResponse.json({
      data: { ...(activity as Record<string, unknown>), activityParticipants: participants },
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!redis) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
    }
    const body = await request.json();

    const existing = (await redis.get(`activity:${id}`)) as Record<string, unknown> | null;
    if (!existing) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const updated = { ...existing };
    if (body.name !== undefined) updated.name = body.name;
    if (body.totalMoney !== undefined) updated.totalMoney = body.totalMoney;
    if (body.payerId !== undefined) updated.payerId = body.payerId;
    updated.updatedAt = new Date().toISOString();

    await redis.set(`activity:${id}`, updated);

    if (body.activityParticipants) {
      await redis.set(`activity:${id}:participants`, body.activityParticipants);
    }

    const participants = (await redis.get(`activity:${id}:participants`)) || [];

    return NextResponse.json({
      data: { ...updated, activityParticipants: participants },
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!redis) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
    }
    const activity = (await redis.get(`activity:${id}`)) as Record<string, unknown> | null;
    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const tripId = activity.tripId as string;
    const pipeline = redis.pipeline();
    pipeline.del(`activity:${id}`);
    pipeline.del(`activity:${id}:participants`);
    if (tripId) {
      pipeline.srem(`trip:${tripId}:activities:index`, id);
    }
    await pipeline.exec();

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}
