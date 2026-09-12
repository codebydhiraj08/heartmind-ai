import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HeartMind AI — Relationship Intelligence Platform',
    short_name: 'HeartMind AI',
    description: 'AI-powered emotional intelligence and relationship wellness assistant. Analyze conversations, detect red flags, and build healthier relationships.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#07080c',
    theme_color: '#0a0a12',
    categories: ['lifestyle', 'health', 'social', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
