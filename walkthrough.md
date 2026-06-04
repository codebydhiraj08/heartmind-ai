# Walkthrough - AI Engine Calibration, Past Trends & Voice Nuance Detection

I have implemented the relationship baseline calibration preferences, historical trend growth tracking, acoustic voice tone nuance detection, love languages, nostalgic memory tracking, and the proactive suggestion engine across the chat and voice analysis pipelines.

---

## Changes Made

### 1. Persistent User Calibration Baseline Fallback
- Modified [User.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/models/User.ts)'s `MockUserDocument` to declare, initialize, and serialize the relationship calibration fields `banterLevel` and `conflictBaseline`.
- This ensures that user-specific calibration settings configured via Settings -> AI Psychology are persisted correctly and not dropped when running in local fallback database mode (e.g. offline/local JSON DB).

### 2. Context-Sensitive AI Chat Analyzer (Preferences & Trends)
- Refactored [ai-engine.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/lib/ai-engine.ts)'s `analyzeChatText` and `analyzeChatLocally` signatures to receive the user's calibration preferences and past history summary.
- **Gemini Flash System Prompt**: Updated the LLM instructions to inject:
  - Playful Banter Level (`banterLevel`): Instructs the LLM that `high` banter means light sarcasm or playful teasing are normal bonding traits and should not be flagged as conflict.
  - Conflict Baseline (`conflictBaseline`): Instructs the LLM that `expressive` or `heated` baseline styles involve higher conversational volume/energy and should not trigger false stress flags.
  - Long-Term Historical Trends (`pastSummary`): Feeds the last 3 past analyses (dates, scores, sentiment, patterns) to evaluate relationship growth, repair velocity, and overall resilience over time.
- **Local Heuristics**: Modified local calculations to adjust conflict word weights and de-escalation speed based on `banterLevel` and `conflictBaseline`.
- **Dynamic Timeline Insights**: Appends historical resilience logs if `pastSummary` is present.

### 3. Love Languages & Shared Memories Detection
- **Love Languages**: Scans chat logs (Gemini & Local Heuristics) to spot primary Love Languages (Words of Affirmation, Quality Time, Acts of Service, Gifts, Physical Touch). Correct matches reward the positivity score (up to +8 boost), reduce stress scores, and append matching timeline insights.
- **Shared Memories & Jokes**: Identifies nostalgic phrases (e.g., `remember when`, `last year`, `inside joke`, `that trip`) and future planning references (e.g., `future house`, `planning to`, `marriage`). Correct matches add positive timeline logs and boost secure attachment parameters.

### 4. Proactive Suggestion Engine (Chat & Voice)
- **Chat Suggestion Format**: Instructs Gemini and Local heuristics to output exactly three suggestions:
  1. A custom conversation starter prefixed with `"Conversation Starter: "` (e.g., `"Conversation Starter: 'Rahul, how did you feel...'"`).
  2. A practical, actionable relationship exercise prefixed with `"Exercise: "` (e.g., `"Exercise (Memory Lane): Spend 10 minutes...'"`).
  3. A behavioral guidance advice.
- **Voice Suggestions**: Refactored [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/analyze-voice/route.ts) POST endpoint to query user calibration preferences and output proactive suggestions focused on vocal appreciation and composure.

### 5. Voice Analyzer Server-Side Calibration & Acoustic Nuance Detection
- **Tonal Threshold Calibration**: Adjusts dynamic stress and anger thresholds based on `conflictBaseline` to prevent false positive alerts for expressive/heated relationships.
- **Acoustic Nuance Rules**:
  - **Playful Sarcasm 🎭**: Triggered when the user has `high` or `medium` banter enabled, excitement is high (> 50), and stress is moderately elevated (> 40). It scales down vocal stress/anger scores and injects a custom insight.
  - **Genuine Concern 🍃**: Triggered when stress and sadness are moderately elevated but anger is low and excitement is low (emotional vulnerability). It defuses stress scores and highlights authentic empathy.
- **Database Persistence**: Saved the updated calibrated `emotions` and `insights` inside the `analysisResult` schema. When loading past voice reports from the History Log, they will display the calibrated values instead of falling back to default mock templates.

---

## Verification Steps (Manual)

1. **Verify Chat Calibration, Love Languages, and Suggestions**:
   - Run the custom verification script created in the workspace root by executing:
     ```bash
     node scratch-verify-calibration.js
     ```
   - Verify that **Case A** (High Banter) yields a higher positivity score and lower stress score than **Case B** (Low Banter literal interpretation) for the exact same teasing chat log.
   - Verify that the **Love Languages** test shows Words of Affirmation, Acts of Service, and Shared Memories being detected and logged under Timeline Insights.
   - Verify that the **Proactive Suggestions Engine** outputs a prefixed Conversation Starter and Exercise successfully.
   - Verify that the simulated voice output shows **Playful Sarcasm** and **Genuine Concern** being correctly detected and calibrated.

2. **Verify Settings Calibration Persistence**:
   - Navigate to **Settings** -> **AI Psychology**.
   - Change your calibration settings (e.g. set Banter to *High* and Conflict Baseline to *Expressive*).
   - Click Save. Refresh the page and verify that your selected baseline values remain persisted.

3. **Verify Voice History Log Rendering**:
   - Record a voice log, or click on an existing voice log in the **History Log** tab.
   - Confirm that the UI loads and displays the calibrated emotions spectrum and acoustic insights properly.
