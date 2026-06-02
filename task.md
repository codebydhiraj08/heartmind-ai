# HeartMind Dashboard Clean-up Checklist

- `[x]` 1. Hide Bottom Gated Widget for Free Users
  - `[x]` Define `activeTier` at the top of the `DashboardPage` in `app/dashboard/page.tsx`.
  - `[x]` Wrap the AI Coach suggestion widget in a `{activeTier !== "free" && ( ... )}` condition.

- `[x]` 2. Verify
  - `[x]` Check that the dashboard renders only 1 clean lock card and hides the bottom one.
