import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { v4 as uuidv4 } from "uuid";

interface Params {
  params: Promise<{ id: string }>;
}

interface ParticipantInput {
  id: string;
  totalMoneyPerUser: number;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: tripId } = await params;
    if (!redis) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
    }

    const body = await request.json();

    const trip = (await redis.get(`trip:${tripId}`)) as Record<string, unknown> | null;
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const activityId = uuidv4();
    const now = new Date().toISOString();

    const activity = {
      id: activityId,
      tripId,
      name: body.name,
      totalMoney: body.totalMoney || 0,
      payerId: body.payerId,
      createdAt: now,
      updatedAt: now,
    };

    const activityParticipants = (body.participants || []).map(
      (p: ParticipantInput) => ({
        id: p.id,
        userId: p.id,
        totalMoneyPerUser: p.totalMoneyPerUser || 0,
      })
    );

    const pipeline = redis.pipeline();
    pipeline.set(`activity:${activityId}`, activity);
    pipeline.set(`activity:${activityId}:participants`, activityParticipants);
    pipeline.sadd(`trip:${tripId}:activities:index`, activityId);
    await pipeline.exec();

    // Update trip participants totals
    const currentParticipants =
      ((await redis.get(`trip:${tripId}:participants`)) as Array<{
        userId: string;
        isPaid: boolean;
        totalMoneyPerUser: number;
        paidAmount: number;
      }>) || [];

    for (const ap of body.participants || []) {
      const idx = currentParticipants.findIndex(
        (p: { userId: string }) => p.userId === ap.id
      );
      if (idx >= 0) {
        currentParticipants[idx].totalMoneyPerUser += ap.totalMoneyPerUser || 0;
      }
    }
    await redis.set(`trip:${tripId}:participants`, currentParticipants);

    // Update trip payers
    const currentPayers =
      ((await redis.get(`trip:${tripId}:payers`)) as Array<{
        userId: string;
        spentMoney: number;
      }>) || [];

    if (body.payerId) {
      const payerIdx = currentPayers.findIndex(
        (p: { userId: string }) => p.userId === body.payerId
      );
      if (payerIdx >= 0) {
        currentPayers[payerIdx].spentMoney += body.totalMoney || 0;
      } else {
        currentPayers.push({
          userId: body.payerId,
          spentMoney: body.totalMoney || 0,
        });
      }
      await redis.set(`trip:${tripId}:payers`, currentPayers);
    }

    // Update trip totalMoney
    const updatedTotal = ((trip.totalMoney as number) || 0) + (body.totalMoney || 0);
    const participantCount = currentParticipants.length || 1;
    await redis.set(`trip:${tripId}`, {
      ...trip,
      totalMoney: updatedTotal,
      moneyPerUser: updatedTotal / participantCount,
    });

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
