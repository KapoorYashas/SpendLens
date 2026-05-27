# SpendLens — Test Suite Documentation

## Test suite: Audit Engine

**File:** `__tests__/auditEngine.test.ts`  
**Runner:** Vitest  
**How to run:** `npm test`

| # | Test name | What it covers |
|---|-----------|----------------|
| 1 | single optimal tool returns savings = 0 and recommendation = optimal | Happy path — a well-priced tool generates no savings and the `optimal` recommendation |
| 2 | Claude Team for 1 user → recommendation downgrade, saves $10 | Seat overpayment: $30/mo Team plan vs $20/mo flat Pro plan for 1 user |
| 3 | ChatGPT Team for 1 user → recommendation downgrade, saves $10 | Seat overpayment: $30/mo Team plan vs $20/mo flat Plus plan for 1 user |
| 4 | Cursor Business for 1 user → recommendation downgrade, saves $20 | Seat overpayment: $40/mo Business vs $20/mo Pro for 1 user |
| 5 | GitHub Copilot Business for 2 users → recommendation downgrade, saves $18 | Multi-seat overpayment: ($19 - $10) × 2 seats = $18/mo |
| 6 | Cursor Pro + Copilot Individual, coding use case → flags consolidate on Copilot | Cross-tool redundancy: two AI code completion tools for same team |
| 7 | OpenAI API Direct $300/mo → flags switch, ~$75 estimated savings | API overspend: >$200/mo threshold, 25% conservative savings estimate |
| 8 | totalMonthlySavings equals sum of all tool potentialMonthlySavings | Aggregation: verifies the totals are computed correctly |
| 9 | highSavingsCase is true when totalMonthlySavings > 500 | Threshold flag: used to trigger the Credex CTA card on the results page |
| 10 | isOptimal is true when totalMonthlySavings < 50 | Threshold flag: used to show the "spending well" green banner |

---

## Test Design Notes

- Tests use `AuditInput` and call `runAudit()` directly — no mocks needed because the engine has zero external dependencies
- Tool names must match the catalog exactly (e.g. `'GitHub Copilot'` not `'github copilot'`), which the tests validate implicitly
- Cross-tool tests verify that the recommendation on the *correct* tool is flagged (Copilot, not Cursor) and that savings are additive
- The `totalMonthlySavings` aggregation test uses two tools that independently trigger rules to ensure the engine correctly sums across multiple tools
