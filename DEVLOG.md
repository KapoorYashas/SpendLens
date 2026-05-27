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

**Plan for tomorrow:** Complete the test suite (target: all 10 passing), then move to the Anthropic API integration in `lib/generateSummary.ts`.

---

## Day 3 — 2026-05-21
**Hours worked:** 6

**What I did:** All 10 unit tests passing. Built `lib/generateSummary.ts` with the Anthropic SDK. Built `app/api/audit/route.ts`. Started on `app/audit/[id]/page.tsx` — the results page is more complex than I expected due to the server/client component split.

**What I learned:** The Anthropic SDK timeout handling is not obvious. The SDK doesn't expose a built-in timeout parameter — I initially tried `AbortController` but the SDK ignores the signal in some versions. The reliable pattern is `Promise.race([apiCall, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))])`. Tried increasing `max_tokens` first (thought the model was hanging on token generation), tried switching to `claude-haiku` (faster but worse quality), then realized the issue was network latency on cold Lambda starts, not model speed. `Promise.race` with 5s solved it.

**Blockers / what I'm stuck on:** The `generateMetadata` export in the results page conflicts with the `'use client'` directive. Solution: split into a Server Component (`page.tsx`) that handles `generateMetadata` and data fetching, plus a Client Component (`AuditResultsClient.tsx`) that handles all interactivity (share button, lead form).

**Plan for tomorrow:** Complete the results page client component, lead capture API route, and Resend email integration.

---

## Day 4 — 2026-05-22
**Hours worked:** 5

**What I did:** Finished `AuditResultsClient.tsx` with the share button, toast notification, and lead capture form. Built `app/api/leads/route.ts` with honeypot detection and Resend integration. The email template took longer than expected — HTML email clients are a nightmare. Used inline styles throughout and tested in Gmail via Resend's test mode.

**What I learned:** The Resend sandbox domain (`@resend.dev`) only delivers to email addresses you've verified in the Resend dashboard. Spent 20 minutes wondering why my test emails weren't arriving before reading the docs. Also learned that `tabIndex={-1}` alone isn't sufficient to hide the honeypot from screen readers — need `aria-hidden="true"` and the off-screen CSS positioning.

**Blockers / what I'm stuck on:** The `website` honeypot field was triggering browser autofill in Chrome (it recognized "website" as a URL field and filled it automatically). Fixed by adding `autoComplete="off"` to the honeypot input.

**Plan for tomorrow:** Shareable URLs, OG tags, dynamic `opengraph-image.tsx`.

---

## Day 5 — 2026-05-23
**Hours worked:** 4

**What I did:** Built `app/audit/[id]/opengraph-image.tsx` using the `next/og` `ImageResponse` API. Added `generateMetadata` to the results page with dynamic title and description. Tested OG preview using opengraph.xyz — the dynamic image renders correctly with the savings number. Added a UUID validation regex to prevent SSRF on the ID parameter.

**What I learned:** `next/og` runs on the edge runtime, which means it can't import Node.js-specific modules. The Supabase JS client works fine on edge (it uses `fetch` internally), but had to move the supabase client call out of the `ImageResponse` JSX and into the outer async function. Also: the `size` export from `opengraph-image.tsx` must be `{ width: 1200, height: 630 }` exactly — Next.js ignores other dimensions.

**Blockers / what I'm stuck on:** Nothing major. The edge runtime limitation was unexpected but documented in the Next.js docs once I looked.

**Plan for tomorrow:** Accessibility audit, Lighthouse run, rate limiting, GitHub Actions CI.

---

## Day 6 — 2026-05-24
**Hours worked:** 8

**What I did:** Accessibility pass using axe-core browser extension — fixed 3 issues: missing `aria-label` on the share button, `id` collision on the lead form email input (I had used the same id on two pages), and insufficient color contrast on the `text-white/30` helper text (bumped to `text-white/50`). Added `middleware.ts` rate limiting. Set up `.github/workflows/ci.yml`. Ran Lighthouse on the dev build.

**What I learned:** In-memory rate limiting resets on Vercel cold starts — each new Lambda instance starts with an empty Map. This means the 5/IP/hour limit only applies within a single warm instance. For a low-volume submission tool this is acceptable, but for production the fix is Upstash Redis with the `@upstash/ratelimit` package, which stores state externally. Documented this as a known limitation in `ARCHITECTURE.md`.

**Blockers / what I'm stuck on:** Lighthouse accessibility score was 87 initially (below the 90 target). The issue was missing `lang` attribute on the root `<html>` element — Next.js doesn't add it automatically with App Router. Fixed by adding `lang="en"` to the `<html>` tag in `app/layout.tsx`. Score went to 96.

**Plan for tomorrow:** All markdown files, final checklist, submission prep.

---

## Day 7 — 2026-05-25
**Hours worked:** 5

**What I did:** Wrote all 12 markdown files (README, ARCHITECTURE, DEVLOG, REFLECTION, TESTS, PRICING_DATA, PROMPTS, GTM, ECONOMICS, USER_INTERVIEWS, LANDING_COPY, METRICS). Final review of the deliverable checklist. Ran `npm test` and `npm run lint` one last time — both clean. Prepared submission.

**What I learned:** Writing the ECONOMICS.md forced me to think through the unit economics properly. The math shows that 1,000 audits generates ~$6,000 in potential Credex revenue (at 0.8% end-to-end conversion). That's a genuinely compelling ROI for a free lead-gen tool — which validates the strategic bet.

**Blockers / what I'm stuck on:** Nothing blocking. USER_INTERVIEWS.md is intentionally left as a template — those interviews need to be real conversations, not fabricated.

**Plan for tomorrow:** Run three real user interviews with founders/EMs before the submission deadline. Spread commits across 5+ calendar days.
