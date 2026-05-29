# Implementation Plan — Hybrid Pipeline, Schema Versioning & Safety Guardrails

We propose a production-grade refactor to introduce **strict schema versioning**, **confidence/evidence tracking** for relationship red flags, and a **hybrid layered analysis pipeline** (RULE ENGINE → AI ENGINE → MERGE → FINAL VALIDATION). This ensures that safety triggers run deterministically first, while Gemini provides deep contextual nuance.

---

## 🛡️ Key Features & Architectural Enhancements

### 1. Hybrid Layered Analysis Pipeline
We will refactor the core analysis sequence in [`lib/ai-engine.ts`](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/lib/ai-engine.ts) to strictly execute four sequential stages:
```
[RULE ENGINE] ──> [AI ENGINE] ──> [MERGE] ──> [FINAL VALIDATION]
```
1. **Rule Engine:** Deterministically scans raw chat logs for toxic, manipulative, gaslighting, or highly defensive phrase patterns first. If found, it computes safety ceiling scores and matches high-confidence rule-based red flags with exact evidence phrases.
2. **AI Engine:** Executes live Gemini-based analysis or fallback local heuristic adaptive AI, with instructions updated to dynamically calculate confidence scores and identify direct sentence quotes for each red flag.
3. **Merge Layer:** Combines Rule and AI Engine results. If Rule Engine safety triggers were matched, it enforces score ceilings (positivity capped to $\le 35-52\%$) and overrides similar AI red flag types with high-confidence rule structures.
4. **Final Validation:** Ensures programmatic score-pattern alignment (exactly N unique red flag categories matching positivity score) and maps all outputs into `schemaVersion: 2` records.

### 2. Schema Versioning (`schemaVersion: 2`)
- Add `schemaVersion: { type: Number, default: 2 }` to both [`ChatAnalysisSchema`](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/models/ChatAnalysis.ts) and [`VoiceAnalysisSchema`](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/models/VoiceAnalysis.ts).
- Update the mock databases to also save `schemaVersion: 2` on newly created records.
- Gracefully handle older documents (which lack `schemaVersion` or are `schemaVersion: 1`): automatically attach missing pre-computed metrics (`emotions`, `compatibility`, `attachmentBreakdown`) and normalize red flag objects.

### 3. Confidence & Evidence Tracking on Red Flags
- Update the `IAIRedFlag` interface to include `confidence: number` (0 to 100) and `evidence: string` (the direct quote sentence).
- Update [`red-flags/page.tsx`](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/dashboard/red-flags/page.tsx) to consume these fields dynamically instead of using hardcoded percentages.

---

## 🛠️ Proposed Changes

### 1. Model Schema Hardening
#### [MODIFY] [ChatAnalysis.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/models/ChatAnalysis.ts) & [VoiceAnalysis.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/models/VoiceAnalysis.ts)
- Add `schemaVersion?: number` to `IChatAnalysis` and `IVoiceAnalysis` TS interfaces.
- Add `schemaVersion: { type: Number, default: 2 }` to Mongoose schemas.
- Update `create()` in mock implementations to return `schemaVersion: 2`.

---

### 2. Core AI Pipeline Refactoring
#### [MODIFY] [ai-engine.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/lib/ai-engine.ts)
- Extend `IAIRedFlag` and `IAIAnalysisResult` interfaces to support `confidence`, `evidence`, and `schemaVersion`.
- Implement `runRuleEngine(chatText)`: Scans deterministically for gaslighting, dismissive, and accusation terms. Emits rule-based flags with `confidence: 95` and `evidence: cleanLine`.
- Update prompt in `analyzeChatText` to instruct Gemini 2.5 Flash to include `confidence` and `evidence` fields for every flag inside the response JSON.
- Implement `mergePipeline(ruleRes, aiRes)`: Combines metrics, overrides scores if safety markers are active, merges identical flag types, and preserves high-confidence evidence.
- Refactor `validateAndNormalizeAnalysis`: Enforces `schemaVersion: 2`, programmatically truncates/fills red flags to target N count, and ensures all red flags have valid `confidence` (defaults to `70`) and `evidence`.

---

### 3. API Response and Backward Compatibility
#### [MODIFY] [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/latest-analysis/route.ts) & [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/analyze-chat/route.ts)
- Enrich API GET handlers to pre-compute relationship compatibility radar, attachment styles, and emotional spectrum values, ensuring `/api/latest-analysis` is the absolute **Single Source of Truth** for all subpages.
- Map and normalize older analyses gracefully (setting `confidence: 50` and `evidence: ""` fallbacks if missing) so older entries never crash the frontend.
- Enforce strict `no-store, no-cache` headers on all analysis API routes.

---

### 4. Frontend UI Update
#### [MODIFY] [red-flags/page.tsx](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/dashboard/red-flags/page.tsx)
- Refactor the mapping loop in `useEffect` to use `matchedFlag.confidence ?? 85` and `matchedFlag.evidence ? [matchedFlag.evidence] : [matchedFlag.description]` dynamically.

---

## 🧪 Verification Plan

### Automated Validation
- Run TypeScript check: `npx tsc --noEmit` to verify 100% type safety.
- Run production build: `npm run build` to confirm webpack/Next.js builds correctly.

### Manual Refactor Verification
Using our dynamic test endpoint `/api/test-stabilization`, we will test:
1. **Loving Chats:** Confirm high positivity score ($\ge 85\%$), 0-2 red flags, secure style, and confidence ratings.
2. **Neutral Chats:** Validate stable scores with moderate confidence.
3. **Toxic & Gaslighting Chats:** Verify that the deterministic rule engine runs first, caps positivity to $\le 35\% - 42\%$, elevates stress, merges evidence, and lists red flags containing exact quote sentences with confidence scores $\ge 95\%$.
4. **Empty State Flow:** Test clean renders when database is reset or empty.
