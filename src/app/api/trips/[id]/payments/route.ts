import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { v4 as uuidv4 } from "uuid";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id: tripId } = await params;
    if (!redis) {
      return NextResponse.json({ data: [] });
    }

    const paymentIds = await redis.smembers(`trip:${tripId}:payments:index`);
    if (!paymentIds || paymentIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const pipeline = redis.pipeline();
    for (const pid of paymentIds) {
      pipeline.get(`payment:${pid}`);
    }
    const results = await pipeline.exec();
    const payments = results.filter(Boolean);

    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: tripId } = await params;
    if (!redis) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
    }
    const body = await request.json();

    const id = uuidv4();
    const payment = {
      id,
      tripId,
      userId: body.userId,
      amount: body.amount,
      paymentDate: body.paymentDate || new Date().toISOString(),
      note: body.note || "",
    };

    const pipeline = redis.pipeline();
    pipeline.set(`payment:${id}`, payment);
    pipeline.sadd(`trip:${tripId}:payments:index`, id);
    await pipeline.exec();

    // Update participant paidAmount
    const participants =
      ((await redis.get(`trip:${tripId}:participants`)) as Array<{
        userId: string;
        isPaid: boolean;
        totalMoneyPerUser: number;
        paidAmount: number;
      }>) || [];

    const idx = participants.findIndex((p) => p.userId === body.userId);
    if (idx >= 0) {
      participants[idx].paidAmount += body.amount;
      if (participants[idx].paidAmount >= participants[idx].totalMoneyPerUser) {
        participants[idx].isPaid = true;
      }
      await redis.set(`trip:${tripId}:participants`, participants);
    }

    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
