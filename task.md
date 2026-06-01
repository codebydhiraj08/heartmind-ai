# HeartMind Free Plan Refinement & Gating Sync Checklist

- `[x]` 1. Unlock Red Flag Detection Widget on Dashboard
  - `[x]` Modify `app/dashboard/page.tsx` around line 887 to add `"free"` to `allowedTiers` for the Red Flag Detection PremiumGate.

- `[x]` 2. Sync Free Plan Description on Upgrade Screen
  - `[x]` Modify `app/dashboard/upgrade/page.tsx` around line 42 to change `"✔ 3 initial relationship insight sessions"` to `"✔ 1 initial relationship insight session"`.

- `[x]` 3. Verify and Push
  - `[x]` Manually verify that dashboard, red flags, and limits behave exactly as expected.
  - `[ ]` Stage, commit, and push changes to GitHub.
