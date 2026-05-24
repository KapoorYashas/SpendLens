import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SpendLens — Free AI Spend Audit for Startups',
    template: '%s | SpendLens',
  },
  description:
    'Free 2-minute audit. No signup. Find out if you\'re overpaying for AI tools. Instant savings report for your team.',
  keywords: [
    'AI tools cost',
    'cursor vs github copilot',
    'chatgpt team pricing',
    'reduce ai tools budget',
    'ai spend audit',
    'startup ai costs',
  ],
  authors: [{ name: 'SpendLens by Credex' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://spendlens.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'SpendLens',
    title: 'SpendLens — Free AI Spend Audit for Startups',
    description: 'Find out if you\'re overpaying for AI tools. Free 2-minute audit, no signup required.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SpendLens — AI Spend Audit Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpendLens — Free AI Spend Audit',
    description: 'Find out if you\'re overpaying for AI tools. Free 2-minute audit.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
