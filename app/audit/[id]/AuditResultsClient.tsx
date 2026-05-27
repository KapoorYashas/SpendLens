'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogoIcon } from '@/components/LogoIcon'
import type { AuditRow, ToolAudit, RecommendationType, LeadApiRequest } from '@/lib/types'

interface Props {
  audit: AuditRow
  auditId: string
}

function RecommendationBadge({ type }: { type: RecommendationType }) {
  const labels: Record<RecommendationType, string> = {
    optimal: '✓ Optimal',
    downgrade: '↓ Downgrade',
    switch: '⇄ Switch',
    consolidate: '⊕ Consolidate',
    credits: '$ Credits',
  }
  return (
    <span
      className={`badge-${type} inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold`}
      aria-label={`Recommendation: ${labels[type]}`}
    >
      {labels[type]}
    </span>
  )
}

function SavingsNumber({ amount, suffix = '/mo' }: { amount: number; suffix?: string }) {
  return (
    <span className="font-bold" style={{ color: amount > 0 ? '#4ade80' : '#9ca3af' }}>
      {amount > 0 ? `$${amount.toLocaleString()}${suffix}` : '—'}
    </span>
  )
}

// ============================================================
// Lead Capture Form
// ============================================================
function LeadCaptureForm({ auditId, totalSavings }: { auditId: string; totalSavings: number }) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address')
      return
    }
    setStatus('loading')
    setErrorMsg('')

    try {
      const payload: LeadApiRequest = {
        auditId,
        email,
        company: company || undefined,
        role: role || undefined,
        website: website || undefined,
      }
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error)
      }
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Report sent!</h3>
        <p className="text-white/50 text-sm">
          Check your inbox for a summary of your top savings opportunities.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Send audit report via email" noValidate>
      <div className="space-y-4">
        {/* Honeypot — hidden from real users */}
        <input
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
          aria-hidden="true"
        />

        <div>
          <label htmlFor="lead-email" className="sl-label">
            Email <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <input
            id="lead-email"
            type="email"
            className="sl-input"
            placeholder="you@startup.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
            required
            aria-required="true"
            aria-invalid={!!errorMsg}
            aria-describedby={errorMsg ? 'lead-email-error' : undefined}
          />
          {errorMsg && (
            <p id="lead-email-error" className="sl-error-msg" role="alert">{errorMsg}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lead-company" className="sl-label">Company (optional)</label>
            <input
              id="lead-company"
              type="text"
              className="sl-input"
              placeholder="Acme Corp"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="lead-role" className="sl-label">Role (optional)</label>
            <input
              id="lead-role"
              type="text"
              className="sl-input"
              placeholder="CTO, Founder, EM…"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="sl-btn-primary w-full"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
              </svg>
              Sending…
            </span>
          ) : (
            `Send me this report — $${totalSavings.toLocaleString()}/mo in savings`
          )}
        </button>
      </div>
    </form>
  )
}

// ============================================================
// Share Button
// ============================================================
function ShareButton({ auditId }: { auditId: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/audit/${auditId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        className="sl-btn-ghost flex items-center gap-2"
        aria-label="Copy audit URL to clipboard"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
        </svg>
        Share this audit
      </button>
      {copied && (
        <div className="sl-toast" role="status" aria-live="polite">
          ✓ Link copied!
        </div>
      )}
    </>
  )
}

// ============================================================
// Main Client Component
// ============================================================
export default function AuditResultsClient({ audit, auditId }: Props) {
  const results = audit.results as ToolAudit[]
  const isHighSavings = audit.total_monthly_savings > 500
  const isOptimal = audit.total_monthly_savings < 50

  const sortedResults = [...results].sort(
    (a, b) => b.potentialMonthlySavings - a.potentialMonthlySavings
  )

  return (
    <main className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label="SpendLens home">
            <LogoIcon />
            <span className="font-bold text-lg tracking-tight">SpendLens</span>
          </Link>
          <ShareButton auditId={auditId} />
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">

        {/* Hero section */}
        <section aria-labelledby="savings-hero" className="text-center mb-12">
          <p className="text-sm text-white/40 uppercase tracking-widest mb-3">Your AI Spend Audit</p>
          <h1 id="savings-hero" className="text-5xl sm:text-6xl font-extrabold mb-3">
            {isOptimal ? (
              <span className="gradient-text">Spending well ✓</span>
            ) : (
              <>
                You could save{' '}
                <span className="gradient-green">${audit.total_monthly_savings.toLocaleString()}/mo</span>
              </>
            )}
          </h1>
          {!isOptimal && (
            <p className="text-2xl font-bold text-white/50">
              ${audit.total_annual_savings.toLocaleString()}/year
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-white/50">
            <span>{audit.team_size} people</span>
            <span aria-hidden="true">·</span>
            <span>{audit.use_case} use case</span>
            <span aria-hidden="true">·</span>
            <span>{results.length} tool{results.length !== 1 ? 's' : ''} audited</span>
          </div>
        </section>

        {/* High savings CTA */}
        {isHighSavings && (
          <section aria-labelledby="credex-cta" className="mb-8">
            <div className="glass-card p-6 border border-yellow-400/20 glow-green">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h2 id="credex-cta" className="text-lg font-bold mb-1">
                    💡 These savings are real
                  </h2>
                  <p className="text-white/60 text-sm">
                    Credex offers the same tools at up to 40% off through unused enterprise credits.
                  </p>
                </div>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sl-btn-primary whitespace-nowrap"
                  id="credex-consultation-cta"
                >
                  Book a free consultation →
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Optimal banner */}
        {isOptimal && (
          <section aria-labelledby="optimal-banner" className="mb-8">
            <div className="glass-card p-6 border border-green-500/30">
              <h2 id="optimal-banner" className="text-lg font-bold text-green-400 mb-1">
                ✓ You&apos;re spending well on AI tools.
              </h2>
              <p className="text-white/50 text-sm">
                Your current tool stack looks well-optimized. We&apos;ll notify you if better options emerge.
              </p>
            </div>
          </section>
        )}

        {/* AI Summary */}
        {audit.ai_summary && (
          <section aria-labelledby="ai-summary-heading" className="glass-card p-6 mb-8">
            <h2 id="ai-summary-heading" className="text-xs text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span aria-hidden="true">✦</span> AI Analysis
            </h2>
            <p className="text-white/80 leading-relaxed">{audit.ai_summary}</p>
          </section>
        )}

        {/* Per-tool breakdown */}
        <section aria-labelledby="breakdown-heading" className="mb-8">
          <h2 id="breakdown-heading" className="text-xl font-bold mb-5">Tool-by-Tool Breakdown</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full" role="table" aria-label="AI tool audit breakdown">
              <thead>
                <tr className="border-b border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th scope="col" className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-widest font-medium">Tool</th>
                  <th scope="col" className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-widest font-medium">Plan</th>
                  <th scope="col" className="text-right px-4 py-3 text-xs text-white/40 uppercase tracking-widest font-medium">Spend/mo</th>
                  <th scope="col" className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-widest font-medium hidden sm:table-cell">Status</th>
                  <th scope="col" className="text-right px-4 py-3 text-xs text-white/40 uppercase tracking-widest font-medium">Savings/mo</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((tool, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-4">
                      <span className="font-semibold text-white/90">{tool.tool}</span>
                    </td>
                    <td className="px-4 py-4 text-white/50 text-sm">{tool.plan}</td>
                    <td className="px-4 py-4 text-right text-white/70 font-mono text-sm">
                      ${tool.currentMonthlySpend.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <RecommendationBadge type={tool.recommendation} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <SavingsNumber amount={tool.potentialMonthlySavings} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded reasoning */}
          <div className="mt-4 space-y-3" aria-label="Detailed recommendations">
            {sortedResults
              .filter(t => t.recommendation !== 'optimal' || t.potentialMonthlySavings > 0)
              .map((tool, i) => (
                <details key={i} className="glass-card p-4 cursor-pointer group">
                  <summary className="flex items-center justify-between list-none select-none">
                    <div className="flex items-center gap-3">
                      <RecommendationBadge type={tool.recommendation} />
                      <span className="font-medium text-sm text-white/80">{tool.tool}</span>
                      {tool.potentialMonthlySavings > 0 && (
                        <span className="text-green-400 text-sm font-bold">
                          save ${tool.potentialMonthlySavings}/mo
                        </span>
                      )}
                    </div>
                    <span className="text-white/50 group-open:rotate-180 transition-transform duration-200 ml-4" aria-hidden="true">▾</span>
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Recommended Action</p>
                      <p className="text-white/80">{tool.recommendedAction}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Reasoning</p>
                      <p className="text-white/60 leading-relaxed">{tool.reasoning}</p>
                    </div>
                  </div>
                </details>
              ))}
          </div>
        </section>

        {/* Total savings callout */}
        {!isOptimal && (
          <section aria-labelledby="totals-heading" className="mb-8">
            <div className="glass-card p-8 text-center glow-green border border-green-500/15">
              <h2 id="totals-heading" className="text-xs text-white/40 uppercase tracking-widest mb-4">Total Potential Savings</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                <div>
                  <p className="text-5xl font-extrabold gradient-green">
                    ${audit.total_monthly_savings.toLocaleString()}
                  </p>
                  <p className="text-white/40 text-sm mt-1">per month</p>
                </div>
                <div className="text-white/20 text-4xl hidden sm:block" aria-hidden="true">→</div>
                <div>
                  <p className="text-4xl font-extrabold text-white/70">
                    ${audit.total_annual_savings.toLocaleString()}
                  </p>
                  <p className="text-white/40 text-sm mt-1">per year</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Lead capture */}
        <section aria-labelledby="lead-form-heading" className="glass-card p-8 mb-8">
          <div className="max-w-lg mx-auto">
            <h2 id="lead-form-heading" className="text-xl font-bold mb-2">📧 Send me this report</h2>
            <p className="text-white/50 text-sm mb-6">
              Get a clean copy of your audit with all recommendations delivered to your inbox.
            </p>
            <LeadCaptureForm auditId={auditId} totalSavings={audit.total_monthly_savings} />
          </div>
        </section>

        {/* Share section */}
        <section aria-labelledby="share-heading" className="glass-card p-6 text-center">
          <h2 id="share-heading" className="text-lg font-bold mb-2">Share this audit</h2>
          <p className="text-white/50 text-sm mb-4">
            Send this unique URL to your team or investors.
          </p>
          <div className="flex justify-center">
            <ShareButton auditId={auditId} />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-white/20 pb-8">
          <p>
            Generated by{' '}
            <Link href="/" className="underline hover:text-white/40 transition-colors">SpendLens</Link>
            {' '}— a free tool by{' '}
            <a href="https://credex.rocks" className="underline hover:text-white/40 transition-colors" target="_blank" rel="noopener noreferrer">
              Credex
            </a>
          </p>
          <Link href="/" className="text-white/50 hover:text-white/50 transition-colors mt-3 inline-block">
            ← Audit another team
          </Link>
        </footer>
      </div>
    </main>
  )
}
