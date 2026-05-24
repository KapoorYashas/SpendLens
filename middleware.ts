// ============================================================
// SpendLens — Rate Limiting Middleware
// In-memory: 5 lead submissions per IP per hour.
// Applies only to POST /api/leads.
// NOTE: Resets on Vercel cold starts — production should use Upstash Redis.
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (resets on cold start)
const rateLimitMap = new Map<string, RateLimitEntry>()

const MAX_REQUESTS = 5
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

function getClientIp(request: NextRequest): string {
  // Vercel populates x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export function middleware(request: NextRequest) {
  // Only rate-limit POST /api/leads
  if (request.method === 'POST' && request.nextUrl.pathname === '/api/leads') {
    const ip = getClientIp(request)
    const now = Date.now()
    const entry = rateLimitMap.get(ip)

    if (!entry || now > entry.resetAt) {
      // New window
      rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    } else if (entry.count >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      )
    } else {
      entry.count++
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/leads',
}
