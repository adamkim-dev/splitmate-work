import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (url && token) {
  try {
    redis = new Redis({ url, token });
  } catch {
    console.error("Failed to initialize Redis client");
  }
}

export function isRedisConfigured(): boolean {
  return redis !== null;
}

export default redis;
