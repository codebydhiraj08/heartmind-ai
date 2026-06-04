# Task Checklist - AI Calibration, Past Trends & Voice Nuances

- `[x]` Update `models/User.ts` (MockUserDocument class fields, constructor, and serialization)
- `[x]` Update `lib/ai-engine.ts` (Update `analyzeChatText` and `analyzeChatLocally` signatures & Gemini prompt template)
- `[x]` Implement local heuristics calibration in `analyzeChatLocally` for `banterLevel`, `conflictBaseline`, and `pastSummary`
- `[x]` Update `app/api/analyze-voice/route.ts` to query calibration preferences and perform server-side vocal metrics adjustment
- `[x]` Implement Rule-Based Acoustic Nuance Detection (Playful Sarcasm & Genuine Concern) in `app/api/analyze-voice/route.ts`
- `[x]` Save calibrated emotions and insights in `analysisResult` in the voice analysis API route
- `[x]` Implement Love Languages detection, nostalgic memories & inside jokes tracking, and future planning checks
- `[x]` Design Proactive Suggestion Engine with custom conversation starters & exercises in chat and voice analyses
- `[x]` Verify calibration saving in Settings and Chat Analyzer
- `[x]` Verify Voice Analyzer nuances detection and History Log rendering
