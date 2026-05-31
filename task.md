# HeartMind AI Client Polish & Mobile UX Checklist

- `[x]` 1. Landing Page Testimonials Removal
  - `[x]` Remove the testimonials block in `app/page.tsx`
- `[x]` 2. Settings Avatar Session Instant Update
  - `[x]` Disable Cache-Control in `app/api/user/profile-image/route.ts`
  - `[x]` Add React `key` props to `img` tags in `app/dashboard/settings/page.tsx` and `components/dashboard-nav.tsx`
- `[x]` 3. Responsive Dashboard Charts
  - `[x]` Refactor CardHeader in `app/dashboard/page.tsx` to handle flex-col/flex-row wrapping
- `[x]` 4. Stress Pattern Insights Toggle
  - `[x]` Render only 1 pattern by default and add inline "View All Patterns" expandable toggle in `app/dashboard/page.tsx`
- `[x]` 5. Timeline Vercel Data Persistence Guide
  - `[x]` Document deployment / MONGODB_URI environment steps inside README or walkthrough
- `[x]` 6. Mobile Chat Upload Accordion Guide
  - `[x]` Add step-by-step WhatsApp/Instagram chat export guide below upload button in `app/dashboard/analyzer/page.tsx`
- `[x]` 7. Voice Recorder Universal Audio Playback & Alerts
  - `[x]` Dynamically detect browser-supported container formats (WebM, MP4, AAC, WAV) in `app/dashboard/voice/page.tsx`
  - `[x]` Tag blobs with correct MIME types to resolve mobile silence playback bugs
  - `[x]` Display mic permission overlay warning guides if stream initialization throws an error
- `[x]` 8. AI Replies Prompt Marathi/Hinglish Transliteration Tuning
  - `[x]` Update prompts in `app/api/generate-replies/route.ts` with strict spelling guidelines ("shant", "aikun", "samjun") and spoken dialect naturalness
- `[x]` 9. Emotional Intelligence Scroll Blur Fix & Chart Scale
  - `[x]` Replace glassmorphism on EI cards with opaque `bg-zinc-950/80` to prevent WebKit display line cracking in `app/dashboard/emotions/page.tsx`
  - `[x]` Expand timeline ResponsiveContainer minimum height/width to ensure legible mobile rendering
- `[x]` 10. Attachment Style Calculation Logic & Learn More Modal
  - `[x]` Fix math inversion in `lib/metrics.ts` to ensure primary attachment style holds the dominant percentage score
  - `[x]` Build sliding glass overlay modal for "Learn More" in `app/dashboard/attachment/page.tsx`

