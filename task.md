# HeartMind AI Stabilization Checklist — Stage 2

- `[x]` Core Schema Hardening
  - `[x]` Update `models/ChatAnalysis.ts` with `schemaVersion: 2` (Schema, interface, and mock database implementation)
  - `[x]` Update `models/VoiceAnalysis.ts` with `schemaVersion: 2` (Schema, interface, and mock database implementation)
- `[x]` Refactor core interface `IAIRedFlag` to include `confidence` and `evidence` fields
- `[x]` Refactor `lib/ai-engine.ts` into a hybrid layered pipeline:
  - `[x]` `runRuleEngine(chatText)`: Scans for toxic phrase patterns, computes ceilings, returns high-confidence rules
  - `[x]` `analyzeChatText` & `runLocalAIEngine`: Updates AI prompts and local heuristic parser to return confidence/evidence
  - `[x]` `mergePipeline(ruleRes, aiRes)`: Merges metrics, caps positivity, handles overrides, maps confidence and evidence
  - `[x]` `validateAndNormalizeAnalysis`: Enforces unique patterns, score alignment, and fallback checks
- `[x]` Backend API Route Refinements (Single Source of Truth & Cache Invalidation)
  - `[x]` Update `app/api/latest-analysis/route.ts` with backward compatibility layer and strict `no-store` headers
  - `[x]` Update `app/api/analyze-chat/route.ts` with backward compatibility mapping, single source of truth, and strict `no-store` headers
- `[x]` Frontend UI Integration
  - `[x]` Update `app/dashboard/red-flags/page.tsx` to dynamically bind `confidence` and `evidence` fields from the database
- `[x]` Verification Phase
  - `[x]` Run TypeScript typecheck: `npx tsc --noEmit`
  - `[x]` Run production build check: `npm run build`
  - `[x]` Perform multi-scenario dry-runs (loving, neutral, toxic, gaslighting, empty states)
