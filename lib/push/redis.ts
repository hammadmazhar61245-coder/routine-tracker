import { Redis } from "@upstash/redis";

// Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN from env.
// Free tier at https://upstash.com — see README for setup.
export const redis = Redis.fromEnv();

// Keys used:
// push:subscription              -> JSON of the single saved PushSubscription (personal single-user app)
// reminders (sorted set)         -> member = taskId (string), score = due timestamp (ms)
// reminder:<taskId> (hash)       -> { title, time, date }
