# Walkthrough - Dynamic Reassurance Baseline Calibration

I have successfully implemented the dynamic reassurance baseline calibration, settings UI controls, NextAuth session mapping, and the user feedback loop for relationship attachment scanning.

---

## Key Changes Made

### 1. Database Model Updates
- Added `reassuranceBaseline?: "standard" | "vulnerable" | "strict"` to the `IUser` interface in [User.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/models/User.ts).
- Integrated `reassuranceBaseline` into the Mongoose `UserSchema` with a default value of `"standard"`.
- Declared and serialized this field within the local fallback class `MockUserDocument` to ensure settings are saved correctly in local JSON database mode (`db.json`).

### 2. NextAuth Session & JWT Mapping
- Modified [auth.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/lib/auth.ts) to map `reassuranceBaseline` during token generation (`jwt` callback) and session synchronization (`session` callback).
- Added triggers to fetch and persist this field on dynamic session updates, ensuring frontend states sync instantly without logging out.

### 3. API Preferences Update Route
- Updated [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/user/update/route.ts) to retrieve `reassuranceBaseline` from the profile update POST body payload, save it securely to the Mongoose user profile record, and return it in the validated response payload.
- Forwarded this setting in the chat analyzer API route [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/analyze-chat/route.ts) to the core AI engine context.

### 4. Settings UI Calibration Options
- Updated [page.tsx](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/dashboard/settings/page.tsx) to manage state for `reassuranceBaseline`.
- Rendered an interactive selection card row under "Relationship Baseline Calibration":
  - **Standard**: Standard codependency rules apply.
  - **Vulnerable (Recommended)**: Flags reassurance seeking as secure, healthy vulnerability.
  - **Strict**: Strictly flags validation seeking.
- Saved the selected baseline value in the preferences POST call payload.

### 5. Context-Sensitive AI Engine & Dynamic Threshold
- Refactored [ai-engine.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/lib/ai-engine.ts):
  - Received `reassuranceBaseline` preference parameter in `analyzeChatLocally`, `analyzeChatText`, `generateRedFlagsForScore`, and `validateAndNormalizeAnalysis`.
  - Added instructions to the Gemini LLM Prompt: When `reassuranceBaseline === "vulnerable"` or overall positivity is high, interpret validation requests or expressions of minor insecurity (e.g. "kabhi kabhi dar lagta hai") as secure vulnerability rather than purely negative codependency.
  - In `validateAndNormalizeAnalysis` and `generateRedFlagsForScore` local heuristic engines, if `reassuranceBaseline === "vulnerable"` or `positivityScore >= 75` (secure relationship context):
    - Changed flag Title to `"Secure Vulnerability & Deep Attachment 🍃"`.
    - Rewrote the description to frame the validation request as healthy emotional sharing and secure vulnerability rather than toxic codependency.
    - Set the flag severity to `"low"`.

### 6. User Feedback Loop
- Added a feedback card on the Red Flags page [page.tsx](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/dashboard/red-flags/page.tsx) inside the expanded details view of any detected `reassurance_dependency` pattern.
- Provided an interactive button: **"Mark as Normal Vulnerability 🍃"** which:
  - Dispatches an asynchronous POST call to update the user's calibration settings in the database to `"vulnerable"`.
  - Dynamically updates the client-side NextAuth session.
  - Displays a success confirmation message and reloads the page to adapt future scanning logic to the couple's specific attachment style.

---

## Verification Steps (Manual)

1. **Verify Local Heuristic Behavior**:
   - Run the custom verification test suite in your terminal:
     ```bash
     npx tsx scratch-verify-calibration.js
     ```
   - Verify that under `[Reassurance Case A] (Vulnerable Baseline)` the flagged pattern is named `"Secure Vulnerability & Deep Attachment 🍃"` with a severity of `low` and frames the expressions as secure bonding.
   - Verify that under `[Reassurance Case B] (Strict Baseline)` the flagged pattern remains `"Reassurance-Seeking Tendency"` with standard codependency warning descriptions.

2. **Verify Settings Calibration Saving**:
   - Go to **Settings** -> **AI Psychology**.
   - Change "Reassurance & Vulnerability Calibration" to *Vulnerable*.
   - Save Preferences, refresh the page, and check if it is saved correctly.

3. **Verify Red Flags Feedback Action**:
   - Go to **Red Flags** page and click to expand a detected **Reassurance Dependency** card.
   - Click the button **Mark as Normal Vulnerability 🍃**.
   - Verify that a success alert appears, the settings update correctly in the database, and the page refreshes.
