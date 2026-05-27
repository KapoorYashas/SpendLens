# SpendLens — Economics

## Unit Economics

SpendLens is a free lead-gen tool. Its value to Credex is measured in qualified leads that convert to enterprise credit bundle purchases.

| Metric | Value | Assumption |
|--------|-------|------------|
| Avg Credex deal size | $5,000 | Enterprise credit bundle (6-12 month commitment) |
| Gross margin | 15% | Sourcing discount from AI vendors minus ops |
| Gross profit per deal | $750 | $5,000 × 15% |
| Audit → email capture rate | 20% | Conservative; tool provides enough value that 1 in 5 users leaves their email |
| Email → consultation rate | 20% | Warm, high-intent leads (they ran an audit, they have a savings number) |
| Consultation → purchase rate | 20% | Typical B2B SaaS close rate for self-qualified inbound |
| **End-to-end conversion** | **0.8%** | 20% × 20% × 20% = 0.8% (1,000 audits → 8 deals) |
| Revenue per 1,000 audits | $6,000 | 8 deals × $750 gross profit |
| Audits needed for $1M ARR | 166,667 | $1,000,000 ÷ $6 revenue per audit |
| Audits/month needed by month 18 | ~13,900 | With viral growth (see below) |

---

## Path to $1M ARR

**Assumptions for 18-month model:**
- Month 1: 500 audits (HN launch)
- Month 2–6: 20% month-over-month growth (organic sharing, SEO, Credex sales motion)
- Month 7–12: 15% MoM (growth slows as low-hanging channels saturate)
- Month 13–18: 10% MoM (baseline viral from shared audit URLs)

| Month | Audits | Cumulative Audits | Cumulative Revenue |
|-------|--------|-------------------|-------------------|
| 1 | 500 | 500 | $3,000 |
| 3 | 720 | 1,940 | $11,640 |
| 6 | 1,244 | 6,540 | $39,240 |
| 12 | 2,894 | 22,800 | $136,800 |
| 18 | 5,157 | 66,000 | $396,000 |

At month 18, this model generates ~$396k in cumulative gross profit — short of $1M ARR. Closing the gap requires either (a) improving the conversion funnel (better email → consultation rate), (b) increasing deal size (premium audit tier at $500/mo), or (c) a distribution multiplier (Credex integrates SpendLens into every outbound touchpoint).

**The $1M ARR scenario:** Credex uses SpendLens in every sales call (adds ~50 audits/week = 2,600/month from their sales motion), plus the product achieves 30% MoM growth in months 1–6 via HN virality. Under this scenario, month-18 audits reach ~13,900/month, and cumulative audits hit ~167,000 — exactly the math needed for $1M ARR at 0.8% conversion, $750 gross profit.

---

## CAC Analysis by Channel

| Channel | Cost | Audits generated | CPAudit | Revenue/channel |
|---------|------|-----------------|---------|-----------------|
| HN Show HN launch | $0 | 500 (week 1) | $0 | $3,000 |
| Founder DMs (20 hours) | $0 cash | 30 | $0 | $180 |
| Newsletter submissions | $0 | 200 | $0 | $1,200 |
| Credex sales integration | $0 incremental | 2,600/mo (ongoing) | $0 | $15,600/mo |
| Paid Twitter/X ads (if added) | $500/mo | ~200/mo | $2.50 | $1,200/mo |

**Key insight:** The Credex sales integration has $0 marginal CAC and is self-compounding — every Credex sales call that uses SpendLens creates a new audit, and high-savings audits generate warm consultation requests that Credex reps can close. This is a flywheel with no incremental spend.

---

## What Makes This Work Economically

1. **Zero hosting cost at launch:** Vercel free tier, Supabase free tier, Resend free tier (100 emails/day). Total infrastructure cost for first 1,000 audits = ~$0.
2. **Anthropic API cost is trivial:** ~200 tokens/audit × $3/1M tokens = $0.0006/audit. At 1,000 audits = $0.60.
3. **The product sells itself:** A user who discovers they're wasting $340/month is highly motivated to explore how to stop. The Credex CTA appears exactly when motivation peaks.
4. **Viral coefficient >0:** Every shared audit URL generates a new potential audit. If 10% of users share their audit and 5% of recipients run their own, the viral k-factor is 0.005 — not viral in the consumer sense, but meaningful at B2B scale.
