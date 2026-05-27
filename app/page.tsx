'use client'

import { useState, useEffect, useCallback, useId } from 'react'
import { useRouter } from 'next/navigation'
import { LogoIcon } from '@/components/LogoIcon'
import { TOOL_CATALOG } from '@/lib/toolCatalog'
import type { FormState, ToolFormRow, AuditApiRequest } from '@/lib/types'

const STORAGE_KEY = 'spendlens_form_state'

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function createEmptyRow(): ToolFormRow {
  const firstTool = TOOL_CATALOG[0]
  const firstPlan = firstTool.plans[0]
  return {
    id: generateId(),
    tool: firstTool.name,
    plan: firstPlan.label,
    seats: 1,
    monthlySpend: firstPlan.flat ? (firstPlan.flatPrice ?? 0) : (firstPlan.pricePerSeat ?? 0),
  }
}

const defaultState: FormState = {
  tools: [createEmptyRow()],
  teamSize: 5,
  useCase: '',
}

// ============================================================
// Tool Row Component
// ============================================================
interface ToolRowProps {
  row: ToolFormRow
  index: number
  onUpdate: (id: string, updates: Partial<ToolFormRow>) => void
  onRemove: (id: string) => void
  canRemove: boolean
  rowError: string | null
}

function ToolRow({ row, index, onUpdate, onRemove, canRemove, rowError }: ToolRowProps) {
  const baseId = useId()
  const toolData = TOOL_CATALOG.find(t => t.name === row.tool)
  const planData = toolData?.plans.find(p => p.label === row.plan)
  const isFlat = planData?.flat ?? false
  const isUserInput = isFlat && (planData?.flatPrice === 0 || row.plan.toLowerCase().includes('api') || row.plan.toLowerCase().includes('direct'))

  const handleToolChange = (toolName: string) => {
    const tool = TOOL_CATALOG.find(t => t.name === toolName)
    if (!tool) return
    const firstPlan = tool.plans[0]
    const spend = firstPlan.flat
      ? (firstPlan.flatPrice ?? 0)
      : (firstPlan.pricePerSeat ?? 0) * 1
    onUpdate(row.id, {
      tool: toolName,
      plan: firstPlan.label,
      seats: 1,
      monthlySpend: spend,
    })
  }

  const handlePlanChange = (planLabel: string) => {
    const plan = toolData?.plans.find(p => p.label === planLabel)
    if (!plan) return
    const spend = plan.flat
      ? (plan.flatPrice ?? 0)
      : (plan.pricePerSeat ?? 0) * row.seats
    onUpdate(row.id, {
      plan: planLabel,
      monthlySpend: spend,
    })
  }

  const handleSeatsChange = (seats: number) => {
    if (!planData || isFlat) return
    const spend = (planData.pricePerSeat ?? 0) * seats
    onUpdate(row.id, { seats, monthlySpend: spend })
  }

  const toolSelectId = `${baseId}-tool`
  const planSelectId = `${baseId}-plan`
  const seatsInputId = `${baseId}-seats`
  const spendInputId = `${baseId}-spend`
  const errorId = `${baseId}-error`

  return (
    <div
      className="glass-card p-4 transition-all duration-200 hover:border-white/20"
      role="group"
      aria-label={`AI tool ${index + 1}`}
    >
      {rowError && (
        <p id={errorId} className="sl-error-msg mb-3" role="alert">{rowError}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tool */}
        <div>
          <label htmlFor={toolSelectId} className="sl-label">Tool</label>
          <select
            id={toolSelectId}
            className="sl-select"
            value={row.tool}
            onChange={e => handleToolChange(e.target.value)}
            aria-describedby={rowError ? errorId : undefined}
          >
            {TOOL_CATALOG.map(t => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Plan */}
        <div>
          <label htmlFor={planSelectId} className="sl-label">Plan</label>
          <select
            id={planSelectId}
            className="sl-select"
            value={row.plan}
            onChange={e => handlePlanChange(e.target.value)}
          >
            {(toolData?.plans ?? []).map(p => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Seats (hidden for flat-rate plans) */}
        {!isFlat ? (
          <div>
            <label htmlFor={seatsInputId} className="sl-label">Seats</label>
            <input
              id={seatsInputId}
              type="number"
              className="sl-input"
              min={1}
              value={row.seats}
              onChange={e => handleSeatsChange(Math.max(1, parseInt(e.target.value) || 1))}
              aria-label={`Number of seats for ${row.tool}`}
            />
          </div>
        ) : (
          <div className="hidden sm:block" aria-hidden="true" />
        )}

        {/* Monthly Spend */}
        <div>
          <label htmlFor={spendInputId} className="sl-label">
            {isUserInput ? 'Monthly Spend ($)' : 'Monthly Spend'}
          </label>
          {isUserInput ? (
            <input
              id={spendInputId}
              type="number"
              className="sl-input"
              min={0}
              placeholder="e.g. 250"
              value={row.monthlySpend || ''}
              onChange={e => onUpdate(row.id, { monthlySpend: Math.max(0, parseFloat(e.target.value) || 0) })}
              aria-label={`Monthly spend for ${row.tool} in dollars`}
            />
          ) : (
            <div
              id={spendInputId}
              className="sl-input flex items-center justify-between"
              aria-label={`Calculated monthly spend: $${row.monthlySpend}`}
            >
              <span className="font-semibold text-green-400">${row.monthlySpend}</span>
              {!isFlat && (
                <span className="text-xs text-white/40">
                  ${planData?.pricePerSeat ?? 0}/seat × {row.seats}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Remove button */}
      {canRemove && (
        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={() => onRemove(row.id)}
            className="sl-btn-ghost text-red-400/70 hover:text-red-400 hover:border-red-400/30 text-xs"
            aria-label={`Remove ${row.tool} row`}
          >
            Remove tool
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Main Page Component
// ============================================================
export default function HomePage() {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>(defaultState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [rowErrors, setRowErrors] = useState<Record<string, string | null>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as FormState
        if (parsed.tools && Array.isArray(parsed.tools) && parsed.tools.length > 0) {
          setFormState(parsed)
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formState))
    } catch {
      // Ignore storage errors
    }
  }, [formState])

  const totalMonthlySpend = formState.tools.reduce((sum, t) => sum + t.monthlySpend, 0)

  const updateRow = useCallback((id: string, updates: Partial<ToolFormRow>) => {
    setFormState(prev => ({
      ...prev,
      tools: prev.tools.map(r => r.id === id ? { ...r, ...updates } : r),
    }))
    setRowErrors(prev => ({ ...prev, [id]: null }))
  }, [])

  const addRow = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      tools: [...prev.tools, createEmptyRow()],
    }))
  }, [])

  const removeRow = useCallback((id: string) => {
    setFormState(prev => ({
      ...prev,
      tools: prev.tools.filter(r => r.id !== id),
    }))
  }, [])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    const newRowErrors: Record<string, string | null> = {}

    if (!formState.teamSize || formState.teamSize < 1) {
      newErrors.teamSize = 'Team size must be at least 1'
    }
    if (!formState.useCase) {
      newErrors.useCase = 'Please select your primary use case'
    }

    let hasRowErrors = false
    formState.tools.forEach(row => {
      const isApiPlan = row.plan.toLowerCase().includes('api') || row.plan.toLowerCase().includes('direct')
      if (isApiPlan && row.monthlySpend <= 0) {
        newRowErrors[row.id] = `Enter your monthly spend for ${row.tool} ${row.plan}`
        hasRowErrors = true
      } else {
        newRowErrors[row.id] = null
      }
    })

    setErrors(newErrors)
    setRowErrors(newRowErrors)
    return Object.keys(newErrors).length === 0 && !hasRowErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload: AuditApiRequest = {
        tools: formState.tools.map(r => ({
          tool: r.tool,
          plan: r.plan,
          seats: r.seats,
          monthlySpend: r.monthlySpend,
        })),
        teamSize: formState.teamSize,
        useCase: formState.useCase as AuditApiRequest['useCase'],
      }

      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error ?? 'Something went wrong')
      }

      const data = await res.json() as { id: string }
      
      // Clear localStorage after successful submission
      localStorage.removeItem(STORAGE_KEY)
      
      router.push(`/audit/${data.id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-600/8 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="font-bold text-lg tracking-tight">SpendLens</span>
            <span className="text-xs text-white/50 border border-white/10 rounded-full px-2 py-0.5">by Credex</span>
          </div>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
            aria-label="Visit Credex website"
          >
            credex.rocks →
          </a>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <section aria-labelledby="hero-heading" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-white/60 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" aria-hidden="true" />
            Free AI spend audit — no signup required
          </div>
          <h1
            id="hero-heading"
            className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-5 leading-tight"
          >
            Find out if you&apos;re
            <br />
            <span className="gradient-text">overpaying for AI tools</span>
          </h1>
          <p className="text-xl text-white/50 max-w-xl mx-auto mb-3">
            Free 2-minute audit. No signup. Instant savings report for your team.
          </p>
          <p className="text-sm text-white/50">
            Supports Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf & more
          </p>
        </section>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          aria-label="AI spend audit form"
          noValidate
        >
          {/* Global fields */}
          <section
            aria-labelledby="global-fields-heading"
            className="glass-card p-6 mb-6"
          >
            <h2 id="global-fields-heading" className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-5">
              About Your Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="team-size" className="sl-label">
                  Team Size <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <input
                  id="team-size"
                  type="number"
                  className="sl-input"
                  min={1}
                  max={10000}
                  value={formState.teamSize || ''}
                  onChange={e => {
                    setFormState(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 0 }))
                    setErrors(prev => ({ ...prev, teamSize: '' }))
                  }}
                  aria-required="true"
                  aria-invalid={!!errors.teamSize}
                  aria-describedby={errors.teamSize ? 'team-size-error' : undefined}
                  placeholder="e.g. 12"
                />
                {errors.teamSize && (
                  <p id="team-size-error" className="sl-error-msg" role="alert">{errors.teamSize}</p>
                )}
              </div>

              <div>
                <label htmlFor="use-case" className="sl-label">
                  Primary Use Case <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <select
                  id="use-case"
                  className="sl-select"
                  value={formState.useCase}
                  onChange={e => {
                    setFormState(prev => ({ ...prev, useCase: e.target.value as FormState['useCase'] }))
                    setErrors(prev => ({ ...prev, useCase: '' }))
                  }}
                  aria-required="true"
                  aria-invalid={!!errors.useCase}
                  aria-describedby={errors.useCase ? 'use-case-error' : undefined}
                >
                  <option value="" disabled>Select your use case…</option>
                  <option value="coding">Coding / Engineering</option>
                  <option value="writing">Writing / Content</option>
                  <option value="data">Data / Analytics</option>
                  <option value="research">Research</option>
                  <option value="mixed">Mixed / General</option>
                </select>
                {errors.useCase && (
                  <p id="use-case-error" className="sl-error-msg" role="alert">{errors.useCase}</p>
                )}
              </div>
            </div>
          </section>

          {/* Tool rows */}
          <section aria-labelledby="tools-heading" className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 id="tools-heading" className="text-sm font-semibold text-white/50 uppercase tracking-widest">
                AI Tools ({formState.tools.length})
              </h2>
              <button
                type="button"
                onClick={addRow}
                className="sl-btn-ghost text-sm"
                aria-label="Add another AI tool"
              >
                + Add tool
              </button>
            </div>

            <div className="space-y-3" role="list" aria-label="AI tool entries">
              {formState.tools.map((row, index) => (
                <div key={row.id} role="listitem">
                  <ToolRow
                    row={row}
                    index={index}
                    onUpdate={updateRow}
                    onRemove={removeRow}
                    canRemove={formState.tools.length > 1}
                    rowError={rowErrors[row.id] ?? null}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Running total + Submit */}
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              {/* Running total */}
              <div aria-live="polite" aria-atomic="true">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Current Monthly Spend</p>
                <p className="text-4xl font-extrabold">
                  <span className="gradient-text">${totalMonthlySpend.toLocaleString()}</span>
                  <span className="text-white/50 text-xl font-normal">/mo</span>
                </p>
                <p className="text-sm text-white/50 mt-1">
                  ${(totalMonthlySpend * 12).toLocaleString()}/year across {formState.tools.length} tool{formState.tools.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Submit */}
              <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                {submitError && (
                  <p className="sl-error-msg text-right" role="alert">{submitError}</p>
                )}
                <button
                  type="submit"
                  className="sl-btn-primary w-full sm:w-auto"
                  disabled={isSubmitting}
                  aria-describedby={submitError ? 'submit-error' : undefined}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                      </svg>
                      Auditing your spend…
                    </span>
                  ) : (
                    'Audit my AI spend →'
                  )}
                </button>
                <p className="text-xs text-white/50">
                  Free. No signup. Takes ~2 minutes.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Social proof */}
        <section aria-labelledby="social-proof-heading" className="mt-16">
          <h2 id="social-proof-heading" className="sr-only">What teams are saying</h2>
          <p className="text-center text-xs text-white/20 uppercase tracking-widest mb-6">
            ⚠️ Mocked testimonials — for illustration only
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                quote: 'We found $340/month we didn\'t know we were wasting.',
                name: 'J.K.',
                role: 'CTO, Series A fintech',
              },
              {
                quote: 'Took 2 minutes. Saved us $180/month by switching one plan.',
                name: 'R.P.',
                role: 'Engineering Lead',
              },
              {
                quote: 'Didn\'t realize we had Copilot AND Cursor for the same 3 devs.',
                name: 'M.A.',
                role: 'Founder',
              },
            ].map((t, i) => (
              <blockquote key={i} className="glass-card p-5">
                <p className="text-sm text-white/70 italic mb-3">&ldquo;{t.quote}&rdquo;</p>
                <footer className="text-xs text-white/40">
                  <span className="font-semibold text-white/60">{t.name}</span> — {t.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="mt-16">
          <h2 id="faq-heading" className="text-2xl font-bold mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {[
              {
                q: 'Is this free?',
                a: 'Yes, completely. No credit card, no signup required.',
              },
              {
                q: 'Do you sell my data?',
                a: 'Your email is used only to send your audit report. We don\'t sell or share it.',
              },
              {
                q: 'How accurate are the recommendations?',
                a: 'Recommendations are based on published vendor pricing as of the audit date. Savings estimates are conservative. Actual savings depend on your usage patterns.',
              },
              {
                q: 'What tools do you support?',
                a: 'Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf.',
              },
              {
                q: 'How does Credex make money?',
                a: 'Credex sells discounted AI credits from companies that overforecast usage. SpendLens is free because it helps identify companies where Credex can provide real value.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="glass-card p-5 cursor-pointer group"
              >
                <summary className="font-medium text-white/80 select-none list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-white/50 group-open:rotate-180 transition-transform duration-200" aria-hidden="true">
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-sm text-white/50 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-center text-xs text-white/20 pb-8">
          <p>
            SpendLens is a free tool by{' '}
            <a href="https://credex.rocks" className="underline hover:text-white/40 transition-colors" target="_blank" rel="noopener noreferrer">
              Credex
            </a>
            {' '}— discounted AI credits for startups.
          </p>
        </footer>
      </div>
    </main>
  )
}
