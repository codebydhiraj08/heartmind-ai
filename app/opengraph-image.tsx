import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'

export const alt = 'HeartMind AI — Relationship Intelligence Platform'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  // Load branded high-res glowing icon as base64
  let iconBase64 = ''
  try {
    const iconPath = path.join(process.cwd(), 'public', 'icons', 'icon-192.png')
    if (fs.existsSync(iconPath)) {
      iconBase64 = fs.readFileSync(iconPath).toString('base64')
    }
  } catch {
    // fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '36px',
          backgroundColor: '#040407',
          backgroundImage:
            'radial-gradient(circle at 12% 15%, rgba(234, 64, 155, 0.28) 0%, transparent 48%), radial-gradient(circle at 88% 85%, rgba(4, 199, 240, 0.25) 0%, transparent 48%), radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 58%), linear-gradient(180deg, #050508 0%, #0c0b14 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Luxury Glassmorphic Inner Container */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '44px 56px',
            borderRadius: 28,
            backgroundColor: 'rgba(10, 11, 18, 0.82)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow:
              '0 30px 100px -10px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 0 50px rgba(139, 92, 246, 0.15)',
          }}
        >
          {/* Top Header Pill Bar */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left Category Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 20px',
                borderRadius: 9999,
                backgroundColor: 'rgba(234, 64, 155, 0.08)',
                border: '1px solid rgba(234, 64, 155, 0.35)',
                boxShadow: '0 0 20px rgba(234, 64, 155, 0.15)',
              }}
            >
              <span style={{ fontSize: 16 }}>✨</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#f472b6',
                  textTransform: 'uppercase',
                }}
              >
                Next-Gen Relationship Intelligence
              </span>
            </div>

            {/* Right Status Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 18px',
                borderRadius: 9999,
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 10px #10b981',
                  display: 'flex',
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: '#34d399',
                }}
              >
                100% Private & Encrypted
              </span>
            </div>
          </div>

          {/* Center Showcase Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: 980,
            }}
          >
            {/* Logo Brand Title with Real Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 22,
                marginBottom: 16,
              }}
            >
              {iconBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/png;base64,${iconBase64}`}
                  alt="HeartMind Logo"
                  width={86}
                  height={86}
                  style={{
                    width: 86,
                    height: 86,
                    borderRadius: 22,
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    boxShadow:
                      '0 0 40px rgba(234, 64, 155, 0.5), 0 0 70px rgba(4, 199, 240, 0.35)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 86,
                    height: 86,
                    borderRadius: 22,
                    background:
                      'linear-gradient(135deg, #8b5cf6 0%, #ea409b 50%, #06b6d4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 45px rgba(234, 64, 155, 0.5)',
                  }}
                >
                  <span style={{ fontSize: 44 }}>❤️</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 74,
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}
              >
                <span style={{ color: '#ffffff' }}>HeartMind</span>
                <span
                  style={{
                    marginLeft: 10,
                    backgroundImage:
                      'linear-gradient(90deg, #ea409b 0%, #04c7f0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  AI
                </span>
              </div>
            </div>

            {/* Dynamic Punchy Catchphrase */}
            <h2
              style={{
                fontSize: 27,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#e4e4e7',
                margin: '0 0 12px 0',
              }}
            >
              Decode Emotional Patterns • Detect Red Flags • Build Healthier Bonds
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.45,
                color: '#94a3b8',
                margin: '0 0 28px 0',
                fontWeight: 500,
                maxWidth: 820,
              }}
            >
              Advanced conversation analytics, attachment synchronization, and
              high-EQ empathetic guidance for modern couples and individuals.
            </p>

            {/* High-Impact Feature Badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              {[
                { icon: '💬', label: 'Chat Diagnostics', border: 'rgba(99, 102, 241, 0.35)' },
                { icon: '🛡️', label: 'Red Flag Detection', border: 'rgba(239, 68, 68, 0.35)' },
                { icon: '💖', label: 'Attachment Sync', border: 'rgba(236, 72, 153, 0.35)' },
                { icon: '✨', label: 'High-EQ Replies', border: 'rgba(234, 179, 8, 0.35)' },
                { icon: '🤝', label: 'Conflict Mediation', border: 'rgba(14, 165, 233, 0.35)' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${item.border}`,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#f8fafc',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Luxury Bottom Footer Bar */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Left Value Prop (Gemini AI Powered removed as requested) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 15,
                color: '#94a3b8',
                fontWeight: 600,
              }}
            >
              <span>🔒 Zero Data Retention</span>
              <span style={{ color: '#475569' }}>•</span>
              <span>Anonymous Diagnostics</span>
              <span style={{ color: '#475569' }}>•</span>
              <span>Available 24/7</span>
            </div>

            {/* Right Branded URL Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 22px',
                borderRadius: 10,
                backgroundColor: 'rgba(4, 199, 240, 0.1)',
                border: '1px solid rgba(4, 199, 240, 0.4)',
                boxShadow: '0 0 25px rgba(4, 199, 240, 0.2)',
                fontSize: 17,
                fontWeight: 800,
                color: '#04c7f0',
                letterSpacing: '0.02em',
              }}
            >
              heartmind.ai
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
