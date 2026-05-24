# SpendLens — Development Log

## Day 1 — 2026-05-19
**Hours worked:** 5

**What I did:** Set up the project from scratch. Initialized Next.js 14 with App Router and TypeScript strict mode. Created the Supabase project and ran the schema SQL — had to iterate twice because I forgot to enable RLS before writing the policies (Supabase silently ignores policies on tables without RLS enabled). Scaffolded the basic form on `app/page.tsx` and got a working dev server.

**What I learned:** `shadcn/ui` had a peer dependency conflict with Next.js 14 — it expects React 18.2.x but the template installs `react@18.3.1`. Fixed by pinning `"react": "18.2.0"` in package.json. Also learned that Supabase's service role client should never be exposed client-side — the anon key is safe, service key is not.

**Blockers / what I'm stuck on:** The Supabase anon key is safe to expose in the browser (it's designed for that), but I kept second-guessing myself. Spent 30 minutes reading the Supabase docs on RLS before convincing myself the architecture is correct.

**Plan for tomorrow:** Build the full audit engine in `lib/auditEngine.ts`. Start with the type definitions so the test file compiles even before the logic is complete.

---

## Day 2 — 2026-05-20
**Hours worked:** 7

**What I did:** Built the entire `lib/auditEngine.ts` from scratch. Implemented all four checks: seat overpayment, cross-tool redundancy, API overspend, and credits opportunity notes. Also wrote `lib/types.ts` with all shared interfaces and started on `__tests__/auditEngine.test.ts`.

**What I learned:** TypeScript discriminated unions (`RecommendationType = 'optimal' | 'downgrade' | 'switch' | 'consolidate' | 'credits'`) make the recommendation types much safer than plain string literals. The compiler catches `'upgarde'` (typo) but not `const rec = 'upgarde'`. With the union type it's a compile error immediately.

**Blockers / what I'm stuck on:** The cross-tool redundancy check was tricky because it needs to run *after* all per-tool checks are done, then potentially overwrite a tool's recommendation. I initially tried to do it in a single pass and ended up with incorrect savings numbers. Rewrote to a two-pass approach: per-tool checks first, then cross-tool on the collected results array.

**Plan for tomorrow:** Complete the test suite (target: all 10 passing), then move to the Anthropic API integration in `lib/generateSummary.ts`. Push everything to GitHub once the tests are green.

---

## Day 3 — 2026-05-21
**Hours worked:** 6

**What I did:** All 10 unit tests passing. Built `lib/generateSummary.ts` with the Anthropic SDK. Built `app/api/audit/route.ts`. Initialized the GitHub repository and pushed the first commit covering days 1–3 of work. Started on `app/audit/[id]/page.tsx` — the results page is more complex than I expected due to the server/client component split.

**What I learned:** The Anthropic SDK timeout handling is not obvious. The SDK doesn't expose a built-in timeout parameter — I initially tried `AbortController` but the SDK ignores the signal in some versions. The reliable pattern is `Promise.race([apiCall, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))])`. Tried increasing `max_tokens` first (thought the model was hanging on token generation), tried switching to `claude-haiku` (faster but worse quality), then realized the issue was network latency on cold Lambda starts, not model speed. `Promise.race` with 5s solved it.

**Blockers / what I'm stuck on:** The `generateMetadata` export in the results page conflicts with the `'use client'` directive. Solution: split into a Server Component (`page.tsx`) that handles `generateMetadata` and data fetching, plus a Client Component (`AuditResultsClient.tsx`) that handles all interactivity (share button, lead form).

**Plan for tomorrow:** Complete the results page client component, lead capture API route, and Resend email integration.
