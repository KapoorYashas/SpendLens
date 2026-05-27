// ============================================================
// SpendLens — Audit Results Page
// Server Component — fetches audit from Supabase by UUID.
// NEVER displays PII (email, company, role).
// ============================================================

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAnonClient } from '@/lib/supabase'
import type { AuditRow } from '@/lib/types'
import AuditResultsClient from './AuditResultsClient'

// Force dynamic rendering — this page fetches from Supabase at request time
export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

async function getAudit(id: string): Promise<AuditRow | null> {
  // UUID validation — prevent SSRF and unnecessary DB calls
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) return null

  const { data, error } = await getAnonClient()
    .from('audits')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as AuditRow
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const audit = await getAudit(params.id)
  if (!audit) {
    return { title: 'Audit Not Found' }
  }

  return {
    title: `AI Spend Audit — Save $${audit.total_monthly_savings}/mo`,
    description: `This team could save $${audit.total_monthly_savings}/month on AI tools. Run your free audit at SpendLens.`,
    openGraph: {
      title: `I could save $${audit.total_monthly_savings}/month on AI tools`,
      description: 'Free AI spend audit — see how much your team is overspending',
      images: [`/audit/${params.id}/opengraph-image`],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function AuditPage({ params }: PageProps) {
  const audit = await getAudit(params.id)

  if (!audit) {
    notFound()
  }

  return <AuditResultsClient audit={audit} auditId={params.id} />
}
