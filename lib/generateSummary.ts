// ============================================================
// SpendLens — Summary Generator
// Deterministic summary generator (AI removed per user request).
// ============================================================

import type { GenerateSummaryParams } from './types'

export async function generateSummary(params: GenerateSummaryParams): Promise<string> {
  const { teamSize, totalSpend, totalSavings, topRecommendations } = params
  
  if (totalSavings === 0) {
    return `Your team of ${teamSize} is currently spending $${totalSpend}/month on AI tools. Our audit found that your current stack is well-optimized. We'll let you know if better options emerge for your use case.`
  }

  const topRec = topRecommendations[0] ?? 'Review your current plans for optimization opportunities.'
  
  return `Your team of ${teamSize} is currently spending $${totalSpend}/month on AI tools. Our audit identified $${totalSavings}/month in potential savings ($${totalSavings * 12}/year). ${topRec} Consider acting on the highest-impact recommendation first to capture savings immediately.`
}
