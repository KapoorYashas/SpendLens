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
      { label: 'Individual (Pro)', pricePerSeat: 20, flat: false },
      { label: 'Individual (Pro+)', pricePerSeat: 60, flat: false },
      { label: 'Individual (Ultra)', pricePerSeat: 200, flat: false },
      { label: 'Teams', pricePerSeat: 40, flat: false },
      { label: 'Enterprise', pricePerSeat: 0, flat: true, flatPrice: 0 }, // Custom
    ],
  },
  {
    name: 'GitHub Copilot',
    plans: [
      { label: 'Free', pricePerSeat: 0, flat: true, flatPrice: 0 },
      { label: 'Individual (Pro)', pricePerSeat: 10, flat: false },
      { label: 'Individual (Pro+)', pricePerSeat: 39, flat: false },
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
      { label: 'Team (Standard)', pricePerSeat: 25, flat: false },
      { label: 'Team (Premium)', pricePerSeat: 125, flat: false },
      { label: 'Enterprise', pricePerSeat: 20, flat: false }, // Plus API
      { label: 'API Direct', pricePerSeat: null, flat: true, flatPrice: 0 },
    ],
  },
  {
    name: 'ChatGPT',
    plans: [
      { label: 'Free', pricePerSeat: 0, flat: true, flatPrice: 0 },
      { label: 'Go', pricePerSeat: null, flat: true, flatPrice: 8 },
      { label: 'Plus', pricePerSeat: null, flat: true, flatPrice: 20 },
      { label: 'Pro', pricePerSeat: null, flat: true, flatPrice: 100 },
      { label: 'Pro (Full)', pricePerSeat: null, flat: true, flatPrice: 200 },
      { label: 'Business', pricePerSeat: 30, flat: false },
      { label: 'Enterprise', pricePerSeat: 0, flat: true, flatPrice: 0 }, // Custom
      { label: 'API Direct', pricePerSeat: null, flat: true, flatPrice: 0 },
    ],
  },
  {
    name: 'Anthropic API Direct',
    plans: [
      { label: 'API Direct', pricePerSeat: null, flat: true, flatPrice: 0 },
    ],
  },
  {
    name: 'OpenAI API Direct',
    plans: [
      { label: 'API Direct', pricePerSeat: null, flat: true, flatPrice: 0 },
    ],
  },
  {
    name: 'Gemini',
    plans: [
      { label: 'Gemini Free', pricePerSeat: 0, flat: true, flatPrice: 0 },
      { label: 'Google AI Plus', pricePerSeat: null, flat: true, flatPrice: 8 }, // ~$7.99
      { label: 'Google AI Pro', pricePerSeat: null, flat: true, flatPrice: 20 }, // ~$19.99
      { label: 'Google AI Ultra (Tier 1)', pricePerSeat: null, flat: true, flatPrice: 100 }, // ~$99.99
      { label: 'Google AI Ultra (Tier 2)', pricePerSeat: null, flat: true, flatPrice: 200 }, // ~$199.99
      { label: 'API', pricePerSeat: null, flat: true, flatPrice: 0 },
    ],
  },
  {
    name: 'Windsurf',
    plans: [
      { label: 'Free', pricePerSeat: 0, flat: true, flatPrice: 0 },
      { label: 'Pro', pricePerSeat: 20, flat: false }, // User said $20/month, assume flat or per user. Let's make it per user based on Teams being per user.
      { label: 'Max', pricePerSeat: 200, flat: false }, // Assume per user.
      { label: 'Teams', pricePerSeat: 40, flat: false },
      { label: 'Enterprise', pricePerSeat: 0, flat: true, flatPrice: 0 }, // Custom
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
