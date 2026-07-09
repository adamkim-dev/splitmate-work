import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json({ data: [] });
    }
    const ids = await redis.smembers("users:index");
    if (!ids || ids.length === 0) {
      return NextResponse.json({ data: [] });
    }
    const pipeline = redis.pipeline();
    for (const id of ids) {
      pipeline.get(`user:${id}`);
    }
    const results = await pipeline.exec();
    const users = results.filter(Boolean);
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!redis) {
      return NextResponse.json(
        { error: "Redis not configured" },
        { status: 503 }
      );
    }
    const body = await request.json();
    const id = uuidv4();
    const now = new Date().toISOString();

    const user = {
      id,
      name: body.name,
      email: body.email,
      phoneNumber: body.phoneNumber || "",
      spentMoney: 0,
      salary: body.salary ?? null,
      dailyAllowance: body.dailyAllowance ?? null,
      payday: body.payday ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await redis.set(`user:${id}`, user);
    await redis.sadd("users:index", id);

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
