// ============================================================
// SpendLens — Tool Catalog
// Defines all 8 tools with their plans and pricing.
// Single source of truth for form and audit engine.
// ============================================================

import type { ToolCatalogEntry } from './types'

export const TOOL_CATALOG: ToolCatalogEntry[] = [
  {
    name: 'Cursor',
    plans: [
      { label: 'Hobby', pricePerSeat: 0, flat: true, flatPrice: 0 },
      { label: 'Pro', pricePerSeat: 20, flat: false },
      { label: 'Business', pricePerSeat: 40, flat: false },
      { label: 'Enterprise', pricePerSeat: 60, flat: false },
    ],
  },
  {
    name: 'GitHub Copilot',
    plans: [
      { label: 'Individual', pricePerSeat: 10, flat: false },
      { label: 'Business', pricePerSeat: 19, flat: false },
      { label: 'Enterprise', pricePerSeat: 39, flat: false },
    ],
  },
  {
    name: 'Claude',
    plans: [
      { label: 'Free', pricePerSeat: 0, flat: true, flatPrice: 0 },
      { label: 'Pro', pricePerSeat: null, flat: true, flatPrice: 20 },
      { label: 'Max', pricePerSeat: null, flat: true, flatPrice: 100 },
      { label: 'Team', pricePerSeat: 30, flat: false },
      { label: 'Enterprise', pricePerSeat: 60, flat: false },
      { label: 'API Direct', pricePerSeat: null, flat: true, flatPrice: 0 }, // user-input
    ],
  },
  {
    name: 'ChatGPT',
    plans: [
      { label: 'Plus', pricePerSeat: null, flat: true, flatPrice: 20 },
      { label: 'Team', pricePerSeat: 30, flat: false },
      { label: 'Enterprise', pricePerSeat: 60, flat: false },
      { label: 'API Direct', pricePerSeat: null, flat: true, flatPrice: 0 }, // user-input
    ],
  },
  {
    name: 'Anthropic API Direct',
    plans: [
      { label: 'API Direct', pricePerSeat: null, flat: true, flatPrice: 0 }, // user-input
    ],
  },
  {
    name: 'OpenAI API Direct',
    plans: [
      { label: 'API Direct', pricePerSeat: null, flat: true, flatPrice: 0 }, // user-input
    ],
  },
  {
    name: 'Gemini',
    plans: [
      { label: 'Pro', pricePerSeat: null, flat: true, flatPrice: 20 },
      { label: 'Ultra', pricePerSeat: null, flat: true, flatPrice: 30 },
      { label: 'API', pricePerSeat: null, flat: true, flatPrice: 0 }, // user-input
    ],
  },
  {
    name: 'Windsurf',
    plans: [
      { label: 'Free', pricePerSeat: 0, flat: true, flatPrice: 0 },
      { label: 'Pro', pricePerSeat: 15, flat: false },
      { label: 'Teams', pricePerSeat: 35, flat: false },
    ],
  },
]

export const TOOL_NAMES = TOOL_CATALOG.map(t => t.name)

export function getToolPlans(toolName: string) {
  return TOOL_CATALOG.find(t => t.name === toolName)?.plans ?? []
}

// Plans where the user must manually enter their monthly spend
export function isUserInputPlan(toolName: string, planLabel: string): boolean {
  const tool = TOOL_CATALOG.find(t => t.name === toolName)
  const plan = tool?.plans.find(p => p.label === planLabel)
  return !!(plan && plan.flat && (plan.flatPrice === 0 && planLabel.toLowerCase().includes('api') || planLabel.toLowerCase().includes('direct')))
}
