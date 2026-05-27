# SpendLens

**SpendLens** is a free AI spend audit tool for startups. It takes your team's AI tool subscriptions and outputs savings recommendations plus a shareable report — built as a lead-gen asset for [Credex](https://credex.rocks), which sells discounted AI credits to startups and scale-ups.

**Who it's for:** Engineering managers, CTOs, and founders at 10–50 person startups who approve the monthly tooling budget but rarely audit AI SaaS line items.

---

## Screenshots

- [screenshot-1: homepage form]
- [screenshot-2: results page]
- [screenshot-3: mobile view]

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#          SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, RESEND_API_KEY

# 3. Set up the database
# Go to https://supabase.com → SQL Editor → paste contents of supabase/schema.sql

# 4. Run locally
npm run dev
# Open http://localhost:3000
```

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → select your repo
3. Add all env vars from `.env.example` in Vercel dashboard → Settings → Environment Variables
4. Click Deploy
5. Update `README.md` with your Vercel URL below

**Live URL:** YOUR_VERCEL_URL

---

## Key Decisions (Trade-offs)

1. **Hardcoded audit rules vs ML model** — Chose hardcoded for auditability and speed. A rules engine is verifiable, testable, and deployable in seconds. An ML model would require training data we don't have and would produce opaque recommendations that can't be defended line-by-line to a skeptical CTO.

2. **In-memory rate limiting vs Redis** — Chose in-memory (`Map<string, {count, resetAt}>`) for zero-dependency submission setup. Production limitation: the map resets on Vercel cold starts, so the 5/IP/hour window can be gamed by waiting for a cold start. Fix: use Upstash Redis with `@upstash/ratelimit` which survives process restarts.

3. **Supabase vs PlanetScale** — Chose Supabase for built-in Row Level Security (RLS), which lets us enforce "leads are insert-only, no public read" at the database layer rather than trusting application code. PlanetScale has no RLS. Supabase also has a generous free tier and a Next.js SDK.

4. **Dynamic OG images vs static** — Chose dynamic via `next/og` so each audit URL gets a unique social preview showing its specific savings number. A static image would be the same for every audit URL, reducing click-through on shares. The edge runtime makes generation fast (~50ms).

5. **Resend sandbox vs real domain** — Using `audit@resend.dev` (sandbox) for submission to avoid DNS setup delays. Production change required: verify a custom domain in Resend, update the `from` field in `app/api/leads/route.ts`, and add SPF/DKIM records. Sandbox emails deliver only to verified addresses.

---

## Running Tests

```bash
npm test           # Run all tests once (Vitest)
npm run test:watch # Watch mode
npm run lint       # ESLint check
```

All 10 unit tests in `__tests__/auditEngine.test.ts` should pass.
