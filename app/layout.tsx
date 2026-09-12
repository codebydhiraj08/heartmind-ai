import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/providers'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-display'
})

const siteUrl = process.env.NEXTAUTH_URL || 'https://heartmind-ai.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'HeartMind AI | Relationship Intelligence Platform',
    template: '%s | HeartMind AI',
  },
  description: 'AI-powered emotional intelligence and relationship wellness assistant. Analyze conversations, detect red flags, and build healthier relationships.',
  keywords: [
    'relationship AI',
    'emotional intelligence',
    'conversation analyzer',
    'red flag detection',
    'relationship health',
    'attachment style',
    'relationship coach',
  ],
  authors: [{ name: 'HeartMind AI', url: siteUrl }],
  creator: 'HeartMind AI',
  publisher: 'HeartMind AI',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HeartMind AI',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'HeartMind AI | Relationship Intelligence Platform',
    description: 'AI-powered emotional intelligence and relationship wellness assistant. Analyze conversations, detect red flags, and build healthier relationships.',
    url: siteUrl,
    siteName: 'HeartMind AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HeartMind AI | Relationship Intelligence Platform',
    description: 'AI-powered emotional intelligence and relationship wellness assistant.',
    creator: '@heartmindai',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
