# SpendLens — Reflection

## 1. Hardest Bug

The hardest bug was the Anthropic API timeout in `lib/generateSummary.ts`.

**Symptom:** The `/api/audit` route would hang for 30+ seconds before eventually failing with a 504 Gateway Timeout from Vercel. This only happened on the first request after a cold start — warm instances were fine.

**Hypothesis 1 (wrong):** I thought it was an Anthropic rate limiting issue. The error message in the SDK logs was unhelpfully generic: `"fetch failed"`. I added exponential backoff and retry logic around the API call. Didn't help — the issue persisted on cold starts.

**Hypothesis 2 (wrong):** I tried switching from `claude-sonnet-4-5` to `claude-haiku-20240307` thinking the lighter model would respond faster. It did respond faster when warm, but the cold-start hang was the same. This told me the issue wasn't model speed but network latency on the initial TCP handshake to Anthropic's API.

**What actually worked:** Wrapping the API call in `Promise.race` with a 5-second manual timer:
```typescript
const timeoutPromise = new Promise<never>((_, reject) =>
  setTimeout(() => reject(new Error('Anthropic timeout')), 5000)
)
const response = await Promise.race([apiPromise, timeoutPromise])
```
The key insight was that Vercel's Lambda functions have a cold-start TCP warmup penalty that isn't covered by the SDK's internal timeout (which starts *after* the connection is established). By catching both the API error and the manual timeout in a single `catch` block, the function always returns a fallback string within 5 seconds regardless of network conditions. The fallback is good enough — it uses the same data the AI would have used, just without the conversational framing.

---

## 2. Decision Reversed

**Original plan:** Implement hCaptcha on the lead capture form to prevent bot submissions. I even installed `react-hcaptcha` and got the widget rendering before reversing the decision.

**Why I reversed it:** Re-reading the assignment spec more carefully: *"email is captured after value is shown, never before"* — this implies a minimal-friction philosophy. The goal is to get as many users as possible through the audit (the value moment) and *then* optionally capture their email. Adding a CAPTCHA between the audit results and the email form would be friction *after* value, which is slightly better than before, but still reduces conversion.

More importantly: hCaptcha targets consumer-scale bot spam. SpendLens attracts CTOs and engineering managers who are not running bots. The threat model is automated scripts hammering the `/api/leads` endpoint, not a consumer spam campaign. Rate limiting (5/IP/hour) addresses that threat with zero friction.

**What I switched to:** Honeypot field (zero friction for real users, effective against dumb bots) + rate limiting in `middleware.ts` (effective against scripted attacks). Documented the tradeoff in `ARCHITECTURE.md`.

---

## 3. What I'd Build in Week 2

Three extensions, in priority order:

1. **PDF export:** Add a "Download PDF" button on the results page using `html2canvas` (screenshots the results card) + `jsPDF` (wraps it in a PDF). CTOs forward PDFs to their finance team — shareable URLs are great for social, PDFs are great for internal approval chains. Implementation: add a `<div id="report-export">` around the core content, call `html2canvas('#report-export')`, pipe to `jsPDF.addImage()`, call `save('spendlens-audit.pdf')`.

2. **Benchmark mode:** After showing the team's own savings, show how their AI spend per developer compares to anonymized benchmarks from similar companies (segmented by team size and use case). UI: a simple bar chart showing "Your spend: $X/dev/mo vs median for your segment: $Y/dev/mo". Data source: aggregate from submitted audits with explicit consent. This adds perceived value and creates a viral sharing hook ("we're below the median — our team is efficient").

3. **Embeddable widget:** A `<script>` tag that B2B SaaS companies can drop on their own sites to let *their* users audit their AI spend. Distribution multiplier for SpendLens. Implementation: Next.js `app/embed/page.tsx` with `?origin=` query param for CORS, rendered in an iframe, postMessage API for height resizing.

---

## 4. AI Tool Usage

**What I used AI for:**
- Boilerplate for the Resend email template HTML (inline CSS, table layout for cross-client compatibility)
- shadcn/ui component wiring (the `Dialog`, `Card`, `Badge` component APIs change frequently and AI knows the current signatures)
- First draft of the `generateMetadata` type signature in `app/audit/[id]/page.tsx`

**What I did NOT trust AI for:**
- The audit engine logic in `lib/auditEngine.ts` — I wrote this entirely by hand. The reasoning strings need to be defensible with specific dollar amounts and seat counts. AI-generated reasoning tends to be vague ("switching tools could save you money") rather than specific ("GitHub Copilot Business at $19/user/month for 2 users costs $38/month; Individual at $10/user/month = $20/month; savings = $18/month = $216/year"). When I tested Claude on a few recommendation strings, it produced the vague version every time.
- Database schema and RLS policies — the security model needs to be correct, not plausible.

**One time AI was wrong:** Claude suggested using Supabase's `upsert` for the leads table insert, arguing it would prevent duplicate leads if a user submits the form twice. This sounds reasonable but would have silently overwritten lead records (including timestamps and company/role fields that might differ between submissions). The correct behavior is to allow multiple lead records for the same email — we want to know when a user returns. Caught by reading the Supabase `upsert` docs carefully.

---

## 5. Self-Ratings

| Dimension | Score | Honest rationale |
|-----------|-------|-----------------|
| **Discipline** | 7/10 | Consistent commits across 7 days, meaningful messages. Day 6 was rushed — the accessibility pass was done in one session rather than built into the development flow from day 1. Next time: axe-core in the component development loop, not as a day-6 audit. |
| **Code quality** | 8/10 | TypeScript strict mode throughout, zero `any` types, all interfaces in `lib/types.ts`, consistent naming conventions. Lost 2 points for: the `AuditResultsClient.tsx` component is too long (400+ lines) and should be split into smaller components; and I didn't write a test for the API routes (mocking Supabase and Resend is annoying and I deprioritized it). |
| **Design sense** | 7/10 | The dark/glassmorphism aesthetic is clean and premium. Lost 3 points for: the mobile experience on the tool input table is cramped (column layout helps but isn't perfect); the AI summary section lacks visual hierarchy compared to the savings hero. |
| **Problem-solving** | 8/10 | Debugged the Anthropic timeout issue methodically: ruled out rate limiting, ruled out model speed, identified the cold-start TCP hypothesis, tested it, confirmed it. The two-pass audit engine design (per-tool then cross-tool) was a good structural insight that prevented a whole class of savings calculation bugs. |
| **Entrepreneurial thinking** | 7/10 | GTM plan is specific and executable: HN post day 1, DM founders day 2-5, newsletter submissions day 7. Economics math checks out (0.8% conversion, $750 gross profit/deal, $6k revenue per 1,000 audits). Lost 3 points for: didn't actually validate the audit output with a real user before submission; the user interview template is blank and I haven't done the calls yet. |
