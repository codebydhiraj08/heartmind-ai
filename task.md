# Task Checklist - Dynamic Reassurance Baseline Calibration

- [x] Update database model user schema and fallback serializer for `reassuranceBaseline` setting in `models/User.ts`
- [x] Integrate NextAuth JWT and session callbacks synchronization in `lib/auth.ts`
- [x] Add dynamic parameter handling in profile preferences update API endpoint in `app/api/user/update/route.ts`
- [x] Create Settings page preference controls UI for reassurance calibration in `app/dashboard/settings/page.tsx`
- [x] Forward user reassurance baseline preferences inside chat analyzer API route `app/api/analyze-chat/route.ts`
- [x] Adjust local heuristics and Gemini prompt in `lib/ai-engine.ts` for dynamic threshold interpretation
- [x] Implement user feedback loop option card on Red Flags details list page `app/dashboard/red-flags/page.tsx`
- [x] Create verification test cases in `scratch-verify-calibration.js` and prepare deployment commands
