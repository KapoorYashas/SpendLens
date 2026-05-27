# SpendLens — Metrics & Analytics Plan

## North Star Metric

**Weekly audit completions** — defined as a user completing the form and reaching the `/audit/[id]` results page.

This leads everything downstream:
- More audits → more email captures → more Credex consultations → more revenue
- Audit completions are a leading indicator of all downstream metrics
- Easy to measure, hard to game (requires real form input)

---

## Input Metrics (3)

### 1. Share Rate
**Target:** >10%  
**Definition:** % of audit result page visits that result in a "Link copied" click (tracked via the share button PostHog event)  
**Why it matters:** Shared audits drive organic top-of-funnel — each share is a potential new audit completion. A share rate <10% suggests the results page isn't delivering enough perceived value to motivate sharing.  
**Current:** Track from day 1 via `report_shared` event.

### 2. Email Capture Rate
**Target:** >15%  
**Definition:** % of audit result page visits that result in a lead form submission  
**Why it matters:** Email captures are the gateway to Credex consultations. Below 15% means the results page is failing to convert viewers into leads.  
**Pivot trigger:** If email capture rate stays below 15% after 200 audits, the results page isn't delivering enough perceived value → redesign the hero section to make the savings number more visually prominent; add a secondary CTA above the fold.

### 3. D7 Return Rate
**Target:** >5%  
**Definition:** % of users who return to SpendLens within 7 days of their first audit  
**Why it matters:** D7 returns signal that the product has ongoing utility — users are checking back, sharing with colleagues, or running audits for different teams. Below 5% means the product is a one-and-done experience with no retention hook.  
**How to improve:** Email sequences ("Your audit is 1 month old — run a quick update to see if prices changed"), benchmark mode showing how spend compares to peers.

---

## Instrumentation (PostHog)

All events tracked via `posthog.capture()`. No PII in event properties.

| Event | Triggered when | Key properties |
|-------|---------------|----------------|
| `audit_started` | User adds first tool row on homepage | `tool_count`, `use_case` |
| `audit_completed` | Results page loads successfully | `total_spend`, `total_savings`, `tool_count`, `use_case`, `high_savings_case` |
| `email_captured` | Lead form submitted successfully | `has_company`, `has_role` (booleans, no PII) |
| `report_shared` | Share button clicked | `audit_id` |
| `credex_cta_clicked` | "Book a free consultation" clicked | `savings_amount`, `audit_id` |

**PostHog setup:** Add `posthog-js` to the project. Initialize in `app/layout.tsx` with `NEXT_PUBLIC_POSTHOG_KEY`. Use `posthog.capture()` in client components, `PostHogProvider` for automatic pageview tracking.

---

## Pivot Triggers

| Metric | Below target | Diagnosis | Action |
|--------|-------------|-----------|--------|
| Email capture rate <15% after 200 audits | Results page not delivering value | Redesign hero section — make savings number 2x larger, add animated counter, move lead form above the per-tool breakdown |
| Share rate <5% after 200 audits | Results are not worth sharing | Add "You're in the top X% of efficient teams" benchmark — social comparison motivates sharing |
| D7 return <2% after 300 users | No retention hook | Build price change alerts ("Cursor just increased Pro to $25/mo — update your audit") |
| Audit completion <300/week after 4 weeks | Distribution problem | Double down on Credex sales integration; launch paid Twitter ads ($500 test budget) |

---

## Dashboard Structure (PostHog Insights)

**Weekly review (every Monday):**
1. Weekly audit completions (bar chart, WoW trend)
2. Email capture rate (funnel: audit_completed → email_captured)
3. Share rate (% with report_shared after audit_completed)
4. D7 retention (cohort table by week)
5. Top source (UTM tracking on audit_started — identify which channels are working)

**Monthly review:**
- Credex consultation requests booked (tracked manually from calendar)
- Revenue per 1,000 audits (actual, vs. $6,000 model assumption)
- CAC by channel (cost ÷ audits for any paid channels)
