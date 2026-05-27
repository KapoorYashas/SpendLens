// ============================================================
// SpendLens — Audit Engine Tests (Vitest)
// Exactly 10 tests as specified in the assignment.
// ============================================================

import { describe, it, expect } from 'vitest'
import { runAudit } from '../lib/auditEngine'
import type { AuditInput } from '../lib/types'

// ============================================================
// describe: runAudit — per-tool checks
// ============================================================

describe('runAudit — per-tool checks', () => {
  it('single optimal tool returns savings = 0 and recommendation = optimal', () => {
    const input: AuditInput = {
      tools: [{ tool: 'Cursor', plan: 'Pro', seats: 5, monthlySpend: 100 }],
      teamSize: 5,
      useCase: 'coding',
    }
    const result = runAudit(input)
    expect(result.tools).toHaveLength(1)
    expect(result.tools[0].potentialMonthlySavings).toBe(0)
    expect(result.tools[0].recommendation).toBe('optimal')
    expect(result.totalMonthlySavings).toBe(0)
  })

  it('Claude Team (Standard) for 1 user → recommendation downgrade, saves $5', () => {
    const input: AuditInput = {
      email: 'test@example.com',
      useCase: 'writing',
      tools: [
        { tool: 'Claude', plan: 'Team (Standard)', seats: 1, monthlySpend: 25 },
      ]
    }
    const result = runAudit(input)
    expect(result.tools[0].recommendation).toBe('downgrade')
    expect(result.tools[0].potentialMonthlySavings).toBe(5)
  })

  it('ChatGPT Business for 1 user → recommendation downgrade, saves $10', () => {
    const input: AuditInput = {
      email: 'test@example.com',
      useCase: 'coding',
      tools: [
        { tool: 'ChatGPT', plan: 'Business', seats: 1, monthlySpend: 30 },
      ]
    }
    const result = runAudit(input)
    expect(result.tools[0].recommendation).toBe('downgrade')
    expect(result.tools[0].potentialMonthlySavings).toBe(10)
  })

  it('Cursor Teams for 1 user → recommendation downgrade, saves $20', () => {
    const input: AuditInput = {
      email: 'test@example.com',
      useCase: 'coding',
      tools: [
        { tool: 'Cursor', plan: 'Teams', seats: 1, monthlySpend: 40 },
      ]
    }
    const result = runAudit(input)
    expect(result.tools[0].recommendation).toBe('downgrade')
    expect(result.tools[0].potentialMonthlySavings).toBe(20)
  })

  it('GitHub Copilot Business for 2 users → recommendation downgrade, saves $18', () => {
    // Copilot Business = $19/user/mo × 2 = $38. Individual = $10/user × 2 = $20.
    // Savings = $9 × 2 = $18.
    const input: AuditInput = {
      tools: [{ tool: 'GitHub Copilot', plan: 'Business', seats: 2, monthlySpend: 38 }],
      teamSize: 2,
      useCase: 'coding',
    }
    const result = runAudit(input)
    expect(result.tools[0].recommendation).toBe('downgrade')
    expect(result.tools[0].potentialMonthlySavings).toBe(18)
  })
})

// ============================================================
// describe: runAudit — cross-tool checks
// ============================================================

describe('runAudit — cross-tool checks', () => {
  it('Cursor Individual (Pro) + Copilot Individual (Pro), coding use case → flags consolidate on Copilot', () => {
    const input: AuditInput = {
      email: 'test@example.com',
      useCase: 'coding',
      tools: [
        { tool: 'Cursor', plan: 'Individual (Pro)', seats: 5, monthlySpend: 100 },
        { tool: 'GitHub Copilot', plan: 'Individual (Pro)', seats: 5, monthlySpend: 50 },
      ]
    }
    const result = runAudit(input)
    const copilotAudit = result.tools.find(t => t.tool === 'GitHub Copilot')
    expect(copilotAudit).toBeDefined()
    expect(copilotAudit!.recommendation).toBe('consolidate')
    expect(copilotAudit!.potentialMonthlySavings).toBeGreaterThan(0)
  })

  it('OpenAI API Direct $300/mo → flags switch with ~$75 estimated savings', () => {
    // $300 × 0.25 = $75 savings
    const input: AuditInput = {
      tools: [{ tool: 'OpenAI API Direct', plan: 'API Direct', seats: 1, monthlySpend: 300 }],
      teamSize: 5,
      useCase: 'data',
    }
    const result = runAudit(input)
    expect(result.tools[0].recommendation).toBe('switch')
    expect(result.tools[0].potentialMonthlySavings).toBe(75) // 300 * 0.25
  })
})

// ============================================================
// describe: runAudit — totals
// ============================================================

describe('runAudit — totals', () => {
  it('totalMonthlySavings equals sum of all tool potentialMonthlySavings', () => {
    const input: AuditInput = {
      tools: [
        { tool: 'Claude', plan: 'Team', seats: 1, monthlySpend: 30 },      // saves $10
        { tool: 'Cursor', plan: 'Business', seats: 1, monthlySpend: 40 },  // saves $20
      ],
      teamSize: 2,
      useCase: 'coding',
    }
    const result = runAudit(input)
    const sumFromTools = result.tools.reduce((s, t) => s + t.potentialMonthlySavings, 0)
    expect(result.totalMonthlySavings).toBe(sumFromTools)
  })

  it('highSavingsCase is true when totalMonthlySavings > 500', () => {
    const input: AuditInput = {
      tools: [
        { tool: 'OpenAI API Direct', plan: 'API Direct', seats: 1, monthlySpend: 3000 }, // saves $750
        { tool: 'Claude', plan: 'Team', seats: 1, monthlySpend: 30 },                    // saves $10
      ],
      teamSize: 10,
      useCase: 'data',
    }
    const result = runAudit(input)
    expect(result.totalMonthlySavings).toBeGreaterThan(500)
    expect(result.highSavingsCase).toBe(true)
  })

  it('isOptimal is true when totalMonthlySavings < 50', () => {
    const input: AuditInput = {
      tools: [
        { tool: 'Cursor', plan: 'Pro', seats: 3, monthlySpend: 60 },
        { tool: 'Windsurf', plan: 'Free', seats: 1, monthlySpend: 0 },
      ],
      teamSize: 3,
      useCase: 'coding',
    }
    const result = runAudit(input)
    expect(result.totalMonthlySavings).toBeLessThan(50)
    expect(result.isOptimal).toBe(true)
  })
})
