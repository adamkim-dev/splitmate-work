import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    if (!redis) {
      return NextResponse.json({ data: [] });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("tripId");

    if (tripId) {
      const activityIds = await redis.smembers(`trip:${tripId}:activities:index`);
      if (!activityIds || activityIds.length === 0) {
        return NextResponse.json({ data: [] });
      }
      const pipeline = redis.pipeline();
      for (const id of activityIds) {
        pipeline.get(`activity:${id}`);
      }
      const results = await pipeline.exec();
      return NextResponse.json({ data: results.filter(Boolean) });
    }

    const tripIds = await redis.smembers("trips:index");
    if (!tripIds || tripIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const allActivities: unknown[] = [];
    for (const tid of tripIds) {
      const activityIds = await redis.smembers(`trip:${tid}:activities:index`);
      if (activityIds && activityIds.length > 0) {
        const pipeline = redis.pipeline();
        for (const aid of activityIds) {
          pipeline.get(`activity:${aid}`);
        }
        const results = await pipeline.exec();
        allActivities.push(...results.filter(Boolean));
      }
    }

    return NextResponse.json({ data: allActivities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ data: [] });
  }
}
