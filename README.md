# PlanFlow — Daily Planner PWA

## Local setup
```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev
```
Open http://localhost:3000

## Real push notifications (fire even when the app is fully closed)

This uses actual Web Push — the same mechanism iOS uses to deliver push
notifications to native apps — via a small serverless backend + a cron job
that checks for due reminders every minute. No paid services required.

### 1. Generate VAPID keys (one-time, free, no signup)
```bash
npx web-push generate-vapid-keys
```
Copy the public/private key into `.env.local`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
VAPID_PRIVATE_KEY=<private key>
VAPID_SUBJECT=mailto:you@example.com
```

### 2. Create a free Upstash Redis database
This stores your push subscription and pending reminders (tiny amounts of
data — free tier is more than enough for personal use).
1. Go to https://upstash.com → sign up free → **Create Database** (Redis, any region)
2. Open the database → **REST API** tab → copy the URL and token into `.env.local`:
```
UPSTASH_REDIS_REST_URL=<from Upstash>
UPSTASH_REDIS_REST_TOKEN=<from Upstash>
```

### 3. Set a cron secret
Any random string, used to stop strangers from hitting your cron endpoint:
```
CRON_SECRET=<any random string, e.g. openssl rand -hex 16>
```

### 4. Deploy to Vercel
```bash
npm i -g vercel
vercel
```
Add all five environment variables above in the Vercel dashboard
(Project → Settings → Environment Variables), then redeploy.

**About the cron schedule:** `vercel.json` is set to run every minute
(`* * * * *`). Vercel's free Hobby plan currently limits cron jobs to a
lower frequency than that (check your dashboard — Vercel's cron limits
have changed over time, so confirm what your plan currently allows). If
per-minute isn't available on your plan, either:
- Upgrade to Vercel Pro, or
- Use a free external cron pinger like https://cron-job.org to hit
  `https://your-app.vercel.app/api/cron/send-reminders` every minute,
  with header `Authorization: Bearer <your CRON_SECRET>`.

### 5. Enable it on your iPhone
Open the deployed URL in Safari → Share → **Add to Home Screen** → open
the installed app → Settings → **Enable** under Push notifications →
allow the permission prompt. From then on, task reminders are scheduled
on the server the moment you create a task, and delivered by Apple's
push service at the right time — whether or not PlanFlow is open.

## How it works
- Creating a task also POSTs `{taskId, title, dueAt}` to `/api/push/schedule`,
  which stores it in a Redis sorted set keyed by due timestamp.
- Completing or deleting a task calls `DELETE /api/push/schedule` to cancel it.
- The `/api/cron/send-reminders` route runs on schedule, finds anything due,
  and sends a real Web Push via the `web-push` library to your subscribed device.
- The service worker's existing `push` event listener displays the notification.
- A local `setTimeout`-based fallback (from the previous version) still runs
  too, so you also get an immediate in-app toast if the app happens to be
  open when a reminder fires — the server push is what covers the closed-app case.

## Stack
Next.js 16 (App Router, Turbopack) · Tailwind CSS v4 · shadcn-style components
(hand-copied, not the CLI) · Framer Motion (`motion` package) · Dexie.js
(IndexedDB) · date-fns · lucide-react · web-push · Upstash Redis · Vercel Cron
