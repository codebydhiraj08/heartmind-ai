# Implementation Plan — HeartMind Free Plan Refinement & Gating Sync

This plan details the changes to configure the **HeartMind Free** tier to exactly **1 chat analysis session**. Once a user utilizes this 1st session, further analyses are blocked, while the **Dashboard overview** and **Red Flag Detection** page and widget remain fully unlocked forever. All other advanced features (like AI Coach, Smart Replies, Voice Sentiment, Compatibility, etc.) will remain locked under the Pro and Premium tiers.

---

## User Review Required

> [!IMPORTANT]
> - **Monthly Analysis Limit**: Set to exactly `1` for the free plan.
> - **Red Flag Detection Widget**: Unlocked on the main dashboard for `free` users, allowing them to view stress pattern results from their 1st analysis.
> - **Landing Page & Upgrade Screen Sync**: Align the Free features list across the public landing page and inside the dashboard upgrade page to consistently display `"1 initial relationship insight session"`.

---

## Proposed Changes

We will modify two UI pages to fully align with this feature access rule:

### 1. Dashboard View Gating

#### [MODIFY] [page.tsx](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/dashboard/page.tsx)
* Locate the `<PremiumGate>` component wrapping the **Red Flag Alerts (Stress Pattern Insights)** widget (around line 887).
* Update `allowedTiers` from `["pro", "premium"]` to `["free", "pro", "premium"]` so that free tier users can see their detected red flags directly on the main dashboard home page.

---

### 2. Pricing & Upgrades Features Sync

#### [MODIFY] [page.tsx](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/dashboard/upgrade/page.tsx)
* Locate the `PLANS.free.features` array (around line 41).
* Change `"✔ 3 initial relationship insight sessions"` to `"✔ 1 initial relationship insight session"` to match the landing page pricing grid and server-side rate limits.

---

## Verification Plan

### Automated / API Verification
* Ensure `/api/analyze-chat` returns `UPGRADE_REQUIRED` and `limitExceeded: true` once the user's `monthlyAnalysisCount` reaches `1`.

### Manual Verification
1. Log in as a new user with the `free` tier plan.
2. Conduct the **1st chat analysis**. Verify that results are displayed successfully.
3. Return to the main **Dashboard** (`/dashboard`). Verify that the **Stress Pattern Insights (Red Flags)** widget is fully visible (not blurred/gated).
4. Go to **Red Flag Detection** page (`/dashboard/red-flags`). Verify that it is fully open and shows the scanned patterns.
5. Verify that other components (e.g. AI Coach, Smart Replies, Voice Emotion, Attachment Style, Compatibility) remain locked/gated under their respective plans.
6. Try to submit a **2nd chat analysis** inside `/dashboard/analyzer`. Verify that a gorgeous error block displays, warning that the limit has been reached, and offers an easy link to `/dashboard/upgrade`.
