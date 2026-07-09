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

    const [trip, participants, payers] = await Promise.all([
      redis.get(`trip:${id}`),
      redis.get(`trip:${id}:participants`),
      redis.get(`trip:${id}:payers`),
    ]);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const activityIds = await redis.smembers(`trip:${id}:activities:index`);
    let activities: unknown[] = [];
    if (activityIds && activityIds.length > 0) {
      const pipeline = redis.pipeline();
      for (const aid of activityIds) {
        pipeline.get(`activity:${aid}`);
      }
      const results = await pipeline.exec();
      activities = results.filter(Boolean);
    }

    const fullTrip = {
      ...(trip as Record<string, unknown>),
      tripParticipants: participants || [],
      tripPayers: payers || [],
      activities,
    };

    return NextResponse.json({ data: fullTrip });
  } catch (error) {
    console.error("Error fetching trip:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
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

    const existing = await redis.get(`trip:${id}`) as Record<string, unknown> | null;
    if (!existing) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const updated = { ...existing };
    if (body.name !== undefined) updated.name = body.name;
    if (body.date !== undefined) updated.date = body.date;
    if (body.status !== undefined) updated.status = body.status;
    if (body.totalMoney !== undefined) updated.totalMoney = body.totalMoney;
    if (body.moneyPerUser !== undefined) updated.moneyPerUser = body.moneyPerUser;

    const pipeline = redis.pipeline();
    pipeline.set(`trip:${id}`, updated);

    if (body.tripParticipants) {
      const participants = body.tripParticipants.map(
        (p: { userId: string; isPaid?: boolean; totalMoneyPerUser?: number; paidAmount?: number }) => ({
          userId: p.userId,
          isPaid: p.isPaid || false,
          totalMoneyPerUser: p.totalMoneyPerUser || 0,
          paidAmount: p.paidAmount || 0,
        })
      );
      pipeline.set(`trip:${id}:participants`, participants);
    }

    await pipeline.exec();

    const [participants, payers] = await Promise.all([
      redis.get(`trip:${id}:participants`),
      redis.get(`trip:${id}:payers`),
    ]);

    return NextResponse.json({
      data: {
        ...updated,
        tripParticipants: participants || [],
        tripPayers: payers || [],
      },
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    return NextResponse.json(
      { error: "Failed to update trip" },
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

    const activityIds = await redis.smembers(`trip:${id}:activities:index`);
    const paymentIds = await redis.smembers(`trip:${id}:payments:index`);

    const pipeline = redis.pipeline();
    pipeline.del(`trip:${id}`);
    pipeline.del(`trip:${id}:participants`);
    pipeline.del(`trip:${id}:payers`);
    pipeline.del(`trip:${id}:activities:index`);
    pipeline.del(`trip:${id}:payments:index`);
    pipeline.srem("trips:index", id);

    if (activityIds && activityIds.length > 0) {
      for (const aid of activityIds) {
        pipeline.del(`activity:${aid}`);
        pipeline.del(`activity:${aid}:participants`);
      }
    }

    if (paymentIds && paymentIds.length > 0) {
      for (const pid of paymentIds) {
        pipeline.del(`payment:${pid}`);
      }
    }

    await pipeline.exec();

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}
