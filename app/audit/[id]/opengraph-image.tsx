// ============================================================
// SpendLens — Dynamic OG Image
// Uses next/og ImageResponse to generate per-audit OG images.
// ============================================================

import { ImageResponse } from 'next/og'
import { getAnonClient } from '@/lib/supabase'
import type { AuditRow } from '@/lib/types'

export const runtime = 'edge'
export const alt = 'SpendLens AI Spend Audit'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function getAudit(id: string): Promise<AuditRow | null> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) return null
  const { data } = await getAnonClient().from('audits').select('*').eq('id', id).single()
  return data as AuditRow | null
}

export default async function Image({ params }: { params: { id: string } }) {
  const audit = await getAudit(params.id)

  const savings = audit?.total_monthly_savings ?? 0
  const annualSavings = audit?.total_annual_savings ?? 0
  const toolCount = Array.isArray(audit?.results) ? (audit.results as unknown[]).length : 0

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1f 50%, #0a0a0f 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            transform: 'translateX(-50%)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '20px',
            }}
          >
            S
          </div>
          <span style={{ color: 'white', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            SpendLens
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px', marginLeft: '4px' }}>
            by Credex
          </span>
        </div>

        {/* Main headline */}
        <div style={{ textAlign: 'center', padding: '0 60px' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px', marginBottom: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            AI Spend Audit
          </p>
          {savings > 0 ? (
            <>
              <p
                style={{
                  fontSize: '80px',
                  fontWeight: 800,
                  margin: '0 0 8px',
                  background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: 1.0,
                }}
              >
                ${savings.toLocaleString()}/mo
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '28px', margin: '0 0 32px' }}>
                in potential savings · ${annualSavings.toLocaleString()}/year
              </p>
            </>
          ) : (
            <p
              style={{
                fontSize: '60px',
                fontWeight: 800,
                margin: '0 0 32px',
                background: 'linear-gradient(135deg, #a5f3fc, #818cf8)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Spending optimally ✓
            </p>
          )}
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Tools audited', value: String(toolCount) },
            { label: 'Use case', value: audit?.use_case ?? 'mixed' },
            { label: 'Team size', value: audit?.team_size ? `${audit.team_size} people` : '—' },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '10px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {label}
              </span>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '16px', marginTop: '4px' }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '12px',
            padding: '14px 32px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          Run your free audit at spendlens.app →
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
