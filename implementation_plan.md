# Implementation Plan — Dynamic Reassurance Baseline Calibration

This plan details the changes required to implement user-calibrated **Reassurance Baseline Calibration**, enabling the AI (Gemini and local heuristics) to interpret emotional vulnerability and reassurance-seeking as secure attachment bonding instead of negative codependency when overall positivity is high.

---

## Proposed Changes

### 1. Database Model updates (Calibration Fields)

#### [MODIFY] [User.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/models/User.ts)
- Add `reassuranceBaseline?: "standard" | "vulnerable" | "strict"` to the `IUser` interface.
- Add `reassuranceBaseline` to the Mongoose `UserSchema` with default `"standard"`.
- Declare, initialize (default `"standard"`), and serialize `reassuranceBaseline` in the `MockUserDocument` fallback class for local database operations.

---

### 2. NextAuth Sync & Preferences API Endpoint

#### [MODIFY] [auth.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/lib/auth.ts)
- Map `reassuranceBaseline` in NextAuth's `jwt` and `session` callbacks so it is dynamically synchronized in user sessions.

#### [MODIFY] [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/user/update/route.ts)
- Extract `reassuranceBaseline` from the JSON payload, validate it, update the user record, and return it in the updated profile block.

---

### 3. Settings UI Calibration Options

#### [MODIFY] [page.tsx](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/dashboard/settings/page.tsx)
- Declare state hook `const [reassuranceBaseline, setReassuranceBaseline] = useState("standard")`.
- Sync the state hook with `session.user.reassuranceBaseline` in `useEffect`.
- Send `reassuranceBaseline` in the POST request body inside `handleSavePreferences`.
- Render a new calibration choice list under "Relationship Baseline Calibration":
  - **Reassurance / Vulnerability Baseline**:
    - `standard`: Standard codependency checks.
    - `vulnerable` (Recommended): Frames validation seeking as healthy vulnerability and deep attachment secure sharing.
    - `strict`: Strictly flags codependency triggers.

---

### 4. AI Engine Tonal Calibration & Rule adjustments

#### [MODIFY] [ai-engine.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/lib/ai-engine.ts)
- Refactored `analyzeChatText` and `analyzeChatLocally` signatures to accept `reassuranceBaseline` under `preferences`.
- In `generateRedFlagsForScore` (or within the `reassurance_dependency` builder block):
  - Pass `preferences` context.
  - If `positivityScore >= 75` or `preferences?.reassuranceBaseline === "vulnerable"`, change the `reassurance_dependency` red flag:
    - Change Title to: `"Secure Vulnerability & Deep Attachment 🍃"`
    - Adjust Description to frame the validation request as healthy emotional sharing and secure vulnerability rather than negative reassurance dependency.
    - Keep severity at `"low"`.
- In `analyzeChatText` Gemini Prompt:
  - Add guidelines for `reassuranceBaseline`: if `"vulnerable"` or overall positivity is high, interpret validation requests or expressions of minor insecurity (e.g. "kabhi kabhi dar lagta hai") as secure vulnerability rather than purely negative codependency.

#### [MODIFY] [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/analyze-chat/route.ts)
- Fetch and pass `reassuranceBaseline: (dbUser as any).reassuranceBaseline` in the `analyzeChatText` preferences object.

---

## Verification Plan

### Automated/Manual Testing
1. **Verification Script**:
   - Update `scratch-verify-calibration.js` to simulate a dialogue containing vulnerability (e.g., "Rahul: sometimes I get scared, Priya: don't worry, I'm here for you").
   - Test under two baselines: `vulnerable` (should frame the trigger as Secure Vulnerability) vs `strict` (should flag as Reassurance Dependency).
   - Execute script with `npx tsx scratch-verify-calibration.js`.
2. **Settings Page Save**:
   - Go to Settings -> AI Psychology, verify you can change and persist Reassurance Baseline choices.
