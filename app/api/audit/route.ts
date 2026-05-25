// ============================================================
// SpendLens — POST /api/audit
// Runs audit engine, generates AI summary, saves to Supabase.
// Returns { id } for redirect to /audit/[id].
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { runAudit } from '@/lib/auditEngine'
import { generateSummary } from '@/lib/generateSummary'
import { getServiceClient } from '@/lib/supabase'
import type { AuditApiRequest, AuditApiResponse } from '@/lib/types'

export async function POST(request: NextRequest): Promise<NextResponse<AuditApiResponse | { error: string }>> {
  try {
    const body = (await request.json()) as AuditApiRequest

    // Validate required fields
    if (!body.tools || !Array.isArray(body.tools) || body.tools.length === 0) {
      return NextResponse.json({ error: 'At least one tool is required' }, { status: 400 })
    }
    if (!body.teamSize || body.teamSize < 1) {
      return NextResponse.json({ error: 'Team size must be at least 1' }, { status: 400 })
    }
    if (!body.useCase) {
      return NextResponse.json({ error: 'Use case is required' }, { status: 400 })
    }

    // Run the audit engine (pure TS, no AI)
    const auditResult = runAudit(body)

    // Calculate total current spend for AI summary
    const totalSpend = body.tools.reduce((sum, t) => sum + t.monthlySpend, 0)

    // Top 3 recommendations by savings amount
    const topRecommendations = [...auditResult.tools]
      .sort((a, b) => b.potentialMonthlySavings - a.potentialMonthlySavings)
      .slice(0, 3)
      .map(t => t.recommendedAction)

    // Generate AI summary (never throws)
    const aiSummary = await generateSummary({
      teamSize: body.teamSize,
      useCase: body.useCase,
      tools: body.tools,
      totalSpend,
      totalSavings: auditResult.totalMonthlySavings,
      topRecommendations,
    })

    // Save to Supabase using service role client
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('audits')
      .insert({
        tools: body.tools,
        results: auditResult.tools,
        total_monthly_savings: auditResult.totalMonthlySavings,
        total_annual_savings: auditResult.totalAnnualSavings,
        use_case: body.useCase,
        team_size: body.teamSize,
        ai_summary: aiSummary,
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save audit' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })
  } catch (err) {
    console.error('Audit route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
