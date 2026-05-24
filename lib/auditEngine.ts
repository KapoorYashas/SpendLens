// ============================================================
// SpendLens — Audit Engine
// Pure TypeScript, zero dependencies, NO AI calls.
// Implements all savings recommendation checks per spec.
// ============================================================

import type {
  AuditInput,
  AuditResult,
  ToolAudit,
  RecommendationType,
} from './types'

// ============================================================
// Internal helpers
// ============================================================

function makeAudit(
  tool: string,
  plan: string,
  currentMonthlySpend: number,
  recommendation: RecommendationType,
  recommendedAction: string,
  potentialMonthlySavings: number,
  reasoning: string,
): ToolAudit {
  return {
    tool,
    plan,
    currentMonthlySpend,
    recommendation,
    recommendedAction,
    potentialMonthlySavings,
    reasoning,
  }
}

// ============================================================
// Check 1 — Overpaying for seats (per-tool)
// ============================================================

function checkSeatOverpayment(
  tool: string,
  plan: string,
  seats: number,
  monthlySpend: number,
): ToolAudit | null {
  const t = tool.toLowerCase()
  const p = plan.toLowerCase()

  // Claude Team ≤2 users → recommend Claude Pro (flat $20)
  if (t === 'claude' && p === 'team' && seats <= 2) {
    const savings = monthlySpend - 20
    return makeAudit(
      tool, plan, monthlySpend,
      'downgrade',
      `Downgrade to Claude Pro (flat $20/month). With only ${seats} user${seats > 1 ? 's' : ''}, the Team plan at $30/user/month is unnecessary.`,
      savings > 0 ? savings : 0,
      `Claude Team costs $30/user/month ($${monthlySpend}/month for ${seats} user${seats > 1 ? 's' : ''}). Claude Pro is a flat $20/month with equivalent capabilities for small teams of 1–2. Switching saves $${savings}/month ($${savings * 12}/year).`,
    )
  }

  // ChatGPT Team 1 user → recommend ChatGPT Plus (flat $20)
  if ((t === 'chatgpt') && p === 'team' && seats === 1) {
    const savings = monthlySpend - 20
    return makeAudit(
      tool, plan, monthlySpend,
      'downgrade',
      `Downgrade to ChatGPT Plus (flat $20/month). With 1 user, Team pricing at $30/user/month is unnecessary.`,
      savings > 0 ? savings : 0,
      `ChatGPT Team costs $30/user/month ($${monthlySpend}/month for 1 user). ChatGPT Plus is a flat $20/month for individual users with the same model access. Switching saves $${savings}/month ($${savings * 12}/year).`,
    )
  }

  // GitHub Copilot Business ≤2 users → recommend Individual ($10/user)
  if ((t === 'github copilot' || t === 'github_copilot') && p === 'business' && seats <= 2) {
    const savings = (19 - 10) * seats // $9 per seat
    return makeAudit(
      tool, plan, monthlySpend,
      'downgrade',
      `Downgrade to GitHub Copilot Individual ($10/user/month). With only ${seats} user${seats > 1 ? 's' : ''}, Individual licenses save $9/user/month.`,
      savings,
      `GitHub Copilot Business costs $19/user/month ($${monthlySpend}/month for ${seats} user${seats > 1 ? 's' : ''}). The Individual plan at $10/user/month covers the same code completions for teams under 3. Savings: $9/user × ${seats} user${seats > 1 ? 's' : ''} = $${savings}/month ($${savings * 12}/year).`,
    )
  }

  // Cursor Business 1 user → recommend Cursor Pro ($20)
  if (t === 'cursor' && p === 'business' && seats === 1) {
    const savings = 40 - 20 // Business $40 vs Pro $20
    return makeAudit(
      tool, plan, monthlySpend,
      'downgrade',
      `Downgrade to Cursor Pro ($20/month). With 1 user, Business pricing at $40/user/month is unnecessary.`,
      savings,
      `Cursor Business costs $40/user/month ($${monthlySpend}/month for 1 user). Cursor Pro at $20/month provides the same AI code completions and chat for individual developers. Switching saves $${savings}/month ($${savings * 12}/year).`,
    )
  }

  // Cursor Business 2 users → same cost as two Pro licenses, flag as optimal
  if (t === 'cursor' && p === 'business' && seats === 2) {
    return makeAudit(
      tool, plan, monthlySpend,
      'optimal',
      `Your current plan is cost-equivalent to two Pro licenses. No change needed.`,
      0,
      `Cursor Business at $40/user/month for 2 users = $80/month. Two Cursor Pro licenses = 2 × $20 = $80/month. Cost is identical — stay on Business for the collaboration features, or switch to two Pro licenses for identical savings ($0 difference).`,
    )
  }

  return null
}

// ============================================================
// Check 2 — Cross-tool redundancy (run after all tools collected)
// ============================================================

function checkCrossToolRedundancy(
  audits: ToolAudit[],
  input: AuditInput,
): ToolAudit[] {
  const updated: ToolAudit[] = [...audits]

  const findAudit = (toolName: string) =>
    updated.findIndex(a => a.tool.toLowerCase() === toolName.toLowerCase())

  const cursorIdx = updated.findIndex(a =>
    a.tool.toLowerCase() === 'cursor' &&
    (a.plan.toLowerCase() === 'pro' || a.plan.toLowerCase() === 'business')
  )
  const copilotIdx = updated.findIndex(a =>
    a.tool.toLowerCase() === 'github copilot'
  )

  // Cursor Pro/Business + GitHub Copilot
  if (cursorIdx !== -1 && copilotIdx !== -1) {
    const copilot = updated[copilotIdx]
    const cursor = updated[cursorIdx]

    if (input.useCase === 'coding') {
      const savings = copilot.currentMonthlySpend
      updated[copilotIdx] = {
        ...copilot,
        recommendation: 'consolidate',
        recommendedAction: `Drop GitHub Copilot — Cursor already covers AI code completions. Consolidating saves $${savings}/month.`,
        potentialMonthlySavings: copilot.potentialMonthlySavings + savings,
        reasoning: `Your team pays $${cursor.currentMonthlySpend}/month for Cursor ${cursor.plan} and $${copilot.currentMonthlySpend}/month for GitHub Copilot — two tools solving identical problems (AI code completion). For a coding-first team, Cursor's AI is superior and includes chat + context-aware completions. Dropping Copilot saves $${savings}/month ($${savings * 12}/year) with zero capability loss.`,
      }
    } else {
      const savings = Math.min(cursor.currentMonthlySpend, copilot.currentMonthlySpend)
      const cheaper = cursor.currentMonthlySpend <= copilot.currentMonthlySpend ? 'Cursor' : 'GitHub Copilot'
      updated[copilotIdx] = {
        ...copilot,
        recommendation: 'consolidate',
        recommendedAction: `Evaluate dropping one AI coding tool. Keeping ${cheaper} alone could save ~$${savings}/month.`,
        potentialMonthlySavings: copilot.potentialMonthlySavings + savings,
        reasoning: `You're running both Cursor ($${cursor.currentMonthlySpend}/month) and GitHub Copilot ($${copilot.currentMonthlySpend}/month) — overlapping AI code completion tools. For a mixed workflow, consolidating to the cheaper option (${cheaper}) saves ~$${savings}/month. Evaluate which your team uses more in practice.`,
      }
    }
  }

  // ChatGPT (any paid) + Claude Pro
  const chatgptIdx = updated.findIndex(a => a.tool.toLowerCase() === 'chatgpt' && a.currentMonthlySpend > 0)
  const claudeProIdx = updated.findIndex(a => a.tool.toLowerCase() === 'claude' && a.plan.toLowerCase() === 'pro')

  if (chatgptIdx !== -1 && claudeProIdx !== -1) {
    const chatgpt = updated[chatgptIdx]
    const claude = updated[claudeProIdx]

    if (input.useCase === 'writing' || input.useCase === 'research') {
      const savings = chatgpt.currentMonthlySpend
      updated[chatgptIdx] = {
        ...chatgpt,
        recommendation: 'consolidate',
        recommendedAction: `Drop ChatGPT, keep Claude Pro. For writing/research, Claude outperforms ChatGPT at $20/month less.`,
        potentialMonthlySavings: chatgpt.potentialMonthlySavings + savings,
        reasoning: `For ${input.useCase} use cases, Claude Pro ($${claude.currentMonthlySpend}/month) consistently outperforms ChatGPT at long-form writing, nuance, and research synthesis. Dropping ChatGPT ($${chatgpt.currentMonthlySpend}/month) saves $${savings}/month ($${savings * 12}/year) while improving output quality.`,
      }
    } else {
      const savings = claude.currentMonthlySpend
      updated[claudeProIdx] = {
        ...claude,
        recommendation: 'consolidate',
        recommendedAction: `Drop Claude Pro, keep ChatGPT. For ${input.useCase} tasks, consolidating to one LLM saves $${savings}/month.`,
        potentialMonthlySavings: claude.potentialMonthlySavings + savings,
        reasoning: `For ${input.useCase} use cases, ChatGPT ($${chatgpt.currentMonthlySpend}/month) provides strong coverage. Paying an additional $${claude.currentMonthlySpend}/month for Claude Pro creates redundancy. Dropping Claude Pro saves $${savings}/month ($${savings * 12}/year).`,
      }
    }
  }

  // Gemini API + Claude API (both)
  const geminiApiIdx = findAudit('gemini')
  const claudeApiIdx = updated.findIndex(a =>
    a.tool.toLowerCase() === 'claude' &&
    (a.plan.toLowerCase() === 'api direct' || a.plan.toLowerCase() === 'api')
  )
  const anthropicApiIdx = findAudit('anthropic api direct')

  const hasGeminiApi = geminiApiIdx !== -1 && updated[geminiApiIdx].plan.toLowerCase().includes('api')
  const hasClaudeApi = claudeApiIdx !== -1 || anthropicApiIdx !== -1
  const claudeApiTargetIdx = claudeApiIdx !== -1 ? claudeApiIdx : anthropicApiIdx

  if (hasGeminiApi && hasClaudeApi && claudeApiTargetIdx !== -1) {
    const gemini = updated[geminiApiIdx]
    const claudeApi = updated[claudeApiTargetIdx]
    const savings = Math.min(gemini.currentMonthlySpend, claudeApi.currentMonthlySpend)
    const keepTarget = gemini.currentMonthlySpend <= claudeApi.currentMonthlySpend ? geminiApiIdx : claudeApiTargetIdx
    const dropTarget = keepTarget === geminiApiIdx ? claudeApiTargetIdx : geminiApiIdx
    const dropTool = updated[dropTarget]
    updated[dropTarget] = {
      ...dropTool,
      recommendation: 'consolidate',
      recommendedAction: `Consolidate API usage to one provider. Dropping ${dropTool.tool} saves ~$${savings}/month.`,
      potentialMonthlySavings: dropTool.potentialMonthlySavings + savings,
      reasoning: `You're running both Gemini API ($${gemini.currentMonthlySpend}/month) and Claude/Anthropic API ($${claudeApi.currentMonthlySpend}/month). Running parallel LLM APIs for the same tasks doubles cost without proportional benefit. Consolidate to the provider that best fits your use case and save ~$${savings}/month ($${savings * 12}/year).`,
    }
  }

  return updated
}

// ============================================================
// Check 3 — API Overspend
// ============================================================

function checkApiOverspend(
  tool: string,
  plan: string,
  monthlySpend: number,
  existing: ToolAudit | null,
): ToolAudit | null {
  const t = tool.toLowerCase()
  const isOpenAI = t === 'openai api direct' || (t === 'chatgpt' && plan.toLowerCase() === 'api direct')

  if (isOpenAI && monthlySpend > 200) {
    const savings = Math.round(monthlySpend * 0.25) // conservative 25%
    const base = existing ?? makeAudit(tool, plan, monthlySpend, 'optimal', '', 0, '')
    return {
      ...base,
      recommendation: 'switch',
      recommendedAction: `Switch a portion of OpenAI API usage to Claude API for text/analysis tasks — typically 20-40% cheaper at equivalent quality.`,
      potentialMonthlySavings: (existing?.potentialMonthlySavings ?? 0) + savings,
      reasoning: `Your OpenAI API spend of $${monthlySpend}/month exceeds the threshold where routing text/analysis tasks to Claude API yields meaningful savings. Anthropic's Claude API is typically 20-40% cheaper for equivalent quality on text generation and analysis. Conservative 25% estimate: $${savings}/month saved ($${savings * 12}/year) by migrating a portion of non-GPT-4-vision tasks.`,
    }
  }

  return null
}

// ============================================================
// Check 4 — Credits opportunity (informational only)
// ============================================================

function addCreditsNote(audit: ToolAudit): ToolAudit {
  if (audit.currentMonthlySpend > 50 && audit.recommendation !== 'credits') {
    return {
      ...audit,
      reasoning: audit.reasoning +
        ` ℹ️ Note: Credex may offer discounted credits for ${audit.tool}, potentially reducing spend further — contact them for enterprise pricing.`,
    }
  }
  return audit
}

// ============================================================
// Main export: runAudit
// ============================================================

export function runAudit(input: AuditInput): AuditResult {
  const rawAudits: ToolAudit[] = []

  for (const toolInput of input.tools) {
    const { tool, plan, seats, monthlySpend } = toolInput

    // Start with seat overpayment check
    let audit = checkSeatOverpayment(tool, plan, seats, monthlySpend)

    // If no seat check hit, check API overspend
    if (!audit) {
      const apiResult = checkApiOverspend(tool, plan, monthlySpend, null)
      if (apiResult) {
        audit = apiResult
      }
    } else {
      // Also apply API overspend on top of seat check if applicable
      const apiResult = checkApiOverspend(tool, plan, monthlySpend, audit)
      if (apiResult) audit = apiResult
    }

    // Default: optimal
    if (!audit) {
      audit = makeAudit(
        tool, plan, monthlySpend,
        'optimal',
        `Your current ${plan} plan appears well-matched to your usage. No changes recommended at this time.`,
        0,
        `${tool} ${plan} at $${monthlySpend}/month is appropriately sized for your team. No overpayment or redundancy detected.`,
      )
    }

    rawAudits.push(audit)
  }

  // Run cross-tool redundancy checks
  const auditsAfterCross = checkCrossToolRedundancy(rawAudits, input)

  // Apply credits notes (informational)
  const finalAudits = auditsAfterCross.map(addCreditsNote)

  // Compute totals
  const totalMonthlySavings = finalAudits.reduce(
    (sum, a) => sum + a.potentialMonthlySavings, 0
  )
  const totalAnnualSavings = totalMonthlySavings * 12

  return {
    tools: finalAudits,
    totalMonthlySavings,
    totalAnnualSavings,
    isOptimal: totalMonthlySavings < 50,
    highSavingsCase: totalMonthlySavings > 500,
  }
}

// Re-export types for convenience
export type { AuditInput, AuditResult, ToolAudit, RecommendationType }
export type { ToolInput } from './types'
