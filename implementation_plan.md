# Implementation Plan — Restore Premium Gating Layout & Spacing

This plan details the changes to revert the simplified lock layout and restore the original high-fidelity Premium Gating UI overlay. This preserves the animated icon badges, details of benefits included in Pro/Premium, and suggestive/reflective preview snippets.

---

## Proposed Changes

### 1. Revert to Premium Gating Layout UI

#### [MODIFY] [premium-gate.tsx](file:///c:/Users/DhirajWarangane\OneDrive\Desktop\Heartmind\components\premium-gate.tsx)
* Revert `LockCard` and container styling to the original high-fidelity design:
  - Restore `min-h-[500px]` container height wrapper to ensure correct glass overlay styling.
  - Restore animated lock/crown status badges.
  - Re-enable the suggestive/reflective preview box showcasing preview snippets for each feature.
  - Restore the comprehensive benefits bullet points list for each tier.
  - Restore both "Back to my insights" and "Upgrade" button groups.

---

## Verification Plan

### Manual Verification
1. Log in as a Free tier user.
2. Visit any locked feature or widget. Verify that it renders the gorgeous, high-fidelity lock screen with the badge, description, preview box, and button layout.
