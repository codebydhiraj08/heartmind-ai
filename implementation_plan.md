# Implementation Plan — Love Languages, Shared History & Proactive Suggestions

This plan details the changes required to expand the AI Engine's capability to detect partners' **Love Languages**, identify references to **Shared Memories, Inside Jokes, & Future Plans**, and generate a **Proactive Suggestion Engine** with personalized conversation starters and relationship exercises.

---

## Proposed Changes

### 1. Love Languages & Shared Memories Heuristics (Chat Analysis)

#### [MODIFY] [ai-engine.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/lib/ai-engine.ts)
- Define new regex search patterns inside `analyzeChatLocally`:
  - **Love Languages**:
    - *Words of Affirmation*: e.g., `proud of you`, `thank you for`, `appreciate you`, `so kind`, `love how you`.
    - *Quality Time*: e.g., `trip together`, `date night`, `spend time`, `our evening`, `alone time`.
    - *Acts of Service*: e.g., `helped me`, `cooked`, `cleaned`, `took care of`, `fixed the`.
    - *Gifts*: e.g., `bought you`, `gift`, `present`, `surprise`, `flowers`.
    - *Physical Touch*: e.g., `hug`, `kiss`, `cuddle`, `hold your hand`.
  - **Shared History & Memories**:
    - References to past moments (e.g., `remember when`, `last year`, `that trip`, `remember that laugh`, `inside joke`, `our joke`).
  - **Future Planning**:
    - References to future goals (e.g., `future`, `next year`, `when we move`, `our house`, `marriage`, `kids`, `planning to`).
- **Scoring Adjustment**:
  - When love language expressions, shared history, or future plans are detected, apply positive reinforcement by increasing the positivity score (up to +8 boost) and reducing stress indicators.
- **Dynamic Timeline Insights**:
  - If a love language is detected, append a timeline insight: e.g., `"Words of Affirmation active: Priya validated Rahul with encouraging praise."`
  - If shared history/jokes are detected: `"Shared history active: Partners recalled a humorous inside joke, reinforcing attachment security."`
  - If future goals are discussed: `"Future alignment: Partners expressed mutual goals for their future path, signaling long-term commitment."`

---

### 2. Proactive Suggestion Engine & Gemini System Prompts

#### [MODIFY] [ai-engine.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/lib/ai-engine.ts)
- Modify the Gemini Flash prompt template in `analyzeChatText` to add instructions for:
  - **Love Language Detection**: Identify partners' primary love languages shown in the text and reward them as positive reinforcements.
  - **Shared History & Inside Jokes**: Reward reference to shared memories or inside jokes as strong resilience indicators.
  - **Proactive Suggestions**: Force the output suggestions to be highly action-oriented, providing at least one conversation starter (e.g., `"Conversation Starter: 'What has been...'"`), and one practical relationship exercise (e.g., `"Exercise: Discuss your plans for next summer..."`).
- In `analyzeChatLocally` (local fallback engine), update the hardcoded suggestions list to dynamically inject one conversation starter and one exercise based on the analyzed conflict levels and detected love languages.

---

### 3. Proactive Suggestions in Voice Analysis

#### [MODIFY] [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/analyze-voice/route.ts)
- Update default voice suggestions to incorporate proactive connection exercises (e.g., `"Acoustic Exercise: Practice sharing three verbal appreciations in a calm, slow pace to build warmth"`).

---

## Verification Plan

### Manual Verification
1. **Calibration & Love Language Script**:
   - Update `scratch-verify-calibration.js` with a test case that contains love language expressions (e.g., "thank you for cooking dinner, I appreciate you") and shared memory references.
   - Run the script to verify that the local heuristic successfully boosts positivity score and appends custom timeline insights and proactive suggestions.
2. **Settings and API Testing**:
   - Verify that when a user uploads a WhatsApp chat containing words like "remember when we went to that beach, I appreciate how you always help me", the AI chat output details the primary love language detected and includes a proactive conversation starter in suggestions.
