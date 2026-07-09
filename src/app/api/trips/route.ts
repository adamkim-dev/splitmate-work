import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json({ data: [] });
    }
    const ids = await redis.smembers("trips:index");
    if (!ids || ids.length === 0) {
      return NextResponse.json({ data: [] });
    }
    const pipeline = redis.pipeline();
    for (const id of ids) {
      pipeline.get(`trip:${id}`);
    }
    const results = await pipeline.exec();
    const trips = results.filter(Boolean);
    return NextResponse.json({ data: trips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!redis) {
      return NextResponse.json(
        { error: "Redis not configured. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local" },
        { status: 503 }
      );
    }
    const body = await request.json();
    const id = uuidv4();

    const trip = {
      id,
      name: body.name,
      date: body.date,
      status: body.status || "planed",
      totalMoney: body.totalMoney || 0,
      moneyPerUser: body.moneyPerUser || 0,
    };

    const participants = (body.tripParticipants || body.participants || []).map(
      (p: { userId: string; isPaid?: boolean; totalMoneyPerUser?: number; paidAmount?: number }) => ({
        userId: p.userId,
        isPaid: p.isPaid || false,
        totalMoneyPerUser: p.totalMoneyPerUser || 0,
        paidAmount: p.paidAmount || 0,
      })
    );

    const pipeline = redis.pipeline();
    pipeline.set(`trip:${id}`, trip);
    pipeline.sadd("trips:index", id);
    pipeline.set(`trip:${id}:participants`, participants);
    pipeline.set(`trip:${id}:payers`, []);
    await pipeline.exec();

    return NextResponse.json({ data: { ...trip, tripParticipants: participants, tripPayers: [], activities: [] } }, { status: 201 });
  } catch (error) {
    console.error("Error creating trip:", error);
    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 500 }
    );
  }
}
