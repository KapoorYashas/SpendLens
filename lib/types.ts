// ============================================================
// SpendLens — Shared TypeScript interfaces
// All interfaces defined here and imported where needed.
// ============================================================

export interface ToolInput {
  tool: string
  plan: string
  seats: number
  monthlySpend: number
}

export interface AuditInput {
  tools: ToolInput[]
  teamSize: number
  useCase: 'coding' | 'writing' | 'data' | 'research' | 'mixed'
}

export type RecommendationType = 'optimal' | 'downgrade' | 'switch' | 'consolidate' | 'credits'

export interface ToolAudit {
  tool: string
  plan: string
  currentMonthlySpend: number
  recommendation: RecommendationType
  recommendedAction: string
  potentialMonthlySavings: number
  reasoning: string
}

export interface AuditResult {
  tools: ToolAudit[]
  totalMonthlySavings: number
  totalAnnualSavings: number
  isOptimal: boolean
  highSavingsCase: boolean
}

// ---- Database row types ----

export interface AuditRow {
  id: string
  tools: ToolInput[]
  results: ToolAudit[]
  total_monthly_savings: number
  total_annual_savings: number
  use_case: string
  team_size: number
  ai_summary: string | null
  created_at: string
}

export interface LeadRow {
  id: string
  audit_id: string
  email: string
  company: string | null
  role: string | null
  team_size: number | null
  created_at: string
}

// ---- Form state (persisted to localStorage) ----

export interface ToolFormRow {
  id: string // local uuid for React key
  tool: string
  plan: string
  seats: number
  monthlySpend: number
}

export interface FormState {
  tools: ToolFormRow[]
  teamSize: number
  useCase: 'coding' | 'writing' | 'data' | 'research' | 'mixed' | ''
}

// ---- Tool catalog types ----

export interface PlanOption {
  label: string
  pricePerSeat: number | null  // null = user-input
  flat: boolean                // true = flat rate, seats hidden
  flatPrice?: number           // price when flat=true
}

export interface ToolCatalogEntry {
  name: string
  plans: PlanOption[]
}

// ---- API request/response types ----

export interface AuditApiRequest {
  tools: ToolInput[]
  teamSize: number
  useCase: 'coding' | 'writing' | 'data' | 'research' | 'mixed'
}

export interface AuditApiResponse {
  id: string
}

export interface LeadApiRequest {
  auditId: string
  email: string
  company?: string
  role?: string
  website?: string // honeypot
}

export interface LeadApiResponse {
  success: boolean
}

export interface GenerateSummaryParams {
  teamSize: number
  useCase: string
  tools: ToolInput[]
  totalSpend: number
  totalSavings: number
  topRecommendations: string[]
}
