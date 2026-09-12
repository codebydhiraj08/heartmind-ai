import { ImageResponse } from 'next/og'

export const alt = 'HeartMind AI — Relationship Intelligence Platform'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 70px',
          backgroundColor: '#07080c',
          backgroundImage:
            'radial-gradient(circle at 20% 25%, rgba(234, 64, 155, 0.18) 0%, transparent 45%), radial-gradient(circle at 80% 30%, rgba(4, 199, 240, 0.16) 0%, transparent 45%), radial-gradient(circle at 50% 85%, rgba(139, 92, 246, 0.2) 0%, transparent 55%), linear-gradient(180deg, #07080c 0%, #0d0b16 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle decorative grid/border frame */}
        <div
          style={{
            position: 'absolute',
            inset: 20,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 28,
            display: 'flex',
          }}
        />

        {/* Top Header: Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 24px',
            borderRadius: 9999,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(234, 64, 155, 0.35)',
            boxShadow: '0 0 24px rgba(234, 64, 155, 0.15)',
          }}
        >
          <span style={{ fontSize: 20 }}>🧠</span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#f4f4f5',
              textTransform: 'uppercase',
            }}
          >
            Next-Gen Relationship Intelligence & Emotional Diagnostics
          </span>
        </div>

        {/* Center: Brand & Main Value Proposition */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: 1000,
          }}
        >
          {/* Logo Brand Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              marginBottom: 16,
            }}
          >
            {/* Gradient Logo Icon Box */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 35px rgba(139, 92, 246, 0.5)',
              }}
            >
              <svg
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 66,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#ffffff',
              }}
            >
              <span>HeartMind&nbsp;</span>
              <span
                style={{
                  backgroundImage: 'linear-gradient(90deg, #ea409b 0%, #04c7f0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                AI
              </span>
            </div>
          </div>

          {/* Subtitle / Pitch */}
          <p
            style={{
              fontSize: 24,
              lineHeight: 1.45,
              color: '#a1a1aa',
              margin: '0 0 28px 0',
              fontWeight: 500,
              maxWidth: 880,
            }}
          >
            AI-powered conversation diagnostics, attachment synchronization,
            and high-EQ empathetic coaching for healthier relationships.
          </p>

          {/* Value Propositions Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            {[
              { icon: '💬', label: 'Chat Diagnostics' },
              { icon: '🛡️', label: 'Red Flag Detection' },
              { icon: '💖', label: 'Attachment Sync' },
              { icon: '✨', label: 'High-EQ Replies' },
              { icon: '🤝', label: 'Conflict Mediation' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#e4e4e7',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer Row */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 18,
            borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 15,
              color: '#71717a',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: 'flex',
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#10b981',
                boxShadow: '0 0 10px #10b981',
              }}
            />
            <span>Privacy-First • Encrypted Diagnostics • Gemini AI Powered</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 8,
              backgroundColor: 'rgba(4, 199, 240, 0.08)',
              border: '1px solid rgba(4, 199, 240, 0.25)',
              fontSize: 16,
              fontWeight: 700,
              color: '#04c7f0',
              letterSpacing: '0.02em',
            }}
          >
            heartmind.ai
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
