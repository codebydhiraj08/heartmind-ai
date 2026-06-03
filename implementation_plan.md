# Implementation Plan — Make Support & Resources Section Fully Functional

This plan details the changes required to address the non-functional "Support & Resources" cards inside the Settings page (`app/dashboard/settings/page.tsx`).

## Proposed Changes

### 1. Remove Platform User Manual & Bind Modals to Resources
- Remove the first card: **Platform User Manual** as requested.
- Bind click events for the remaining three cards (**Sensitive Data Privacy Guard**, **Relationship Conflict Science**, and **Dispatch Support Ticket**) to state hooks that trigger beautiful modals, instead of mock alerts.

### 2. Implement Interactive Modals

#### [MODIFY] [page.tsx](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/dashboard/settings/page.tsx)
- Import `X`, `Lock`, and `Send` from `lucide-react`.
- Declare state variables for managing modals:
  - `isPrivacyModalOpen`, `isScienceModalOpen`, `isSupportModalOpen`.
  - `inputText`, `hashedText` (for live SHA-256 privacy sandbox).
  - `criticismLevel`, `listeningLevel` (for relationship conflict simulator).
  - `ticketCategory`, `ticketMessage`, `ticketStatus` (for dispatch support ticket form).
- Implement dynamic React state modals using `AnimatePresence` and `motion.div` for a premium glassmorphic feel matching the app aesthetics:
  1. **Sensitive Data Privacy Guard Modal**: Contains explanations for local-first sanitization, SHA-256 fingerprint hashing, zero-log policies, and a **live client-side SHA-256 hashing input sandbox** so the user can experience the cryptographic protection in real-time.
  2. **Relationship Conflict Science Modal**: Explains Dr. Gottman's "Four Horsemen", positive-to-negative linguistic ratios (5:1/20:1), and includes an **interactive Relational Health Simulator** slider dashboard.
  3. **Dispatch Support Ticket Modal**: Provides an interactive form allowing the user to select a department (Emotional Dispatch, Billing Issue, App Bug, Feature Feedback), write their message, and submit it with a realistic animated loader state and automated assessment feedback.

---

## Verification Plan

### Manual Verification
1. Run local dev server (`npm run dev -p 3005`).
2. Go to **Settings** -> **Plan & Billing Info**.
3. Verify that "Platform User Manual" is removed.
4. Click on **Sensitive Data Privacy Guard**:
   - Verify modal opens with high-fidelity styles.
   - Try typing in the Live SHA-256 sandbox to confirm client-side SHA-256 hashing works.
5. Click on **Relationship Conflict Science**:
   - Verify modal opens.
   - Adjust the criticism and supportiveness sliders to see the computed health score and recommendation update dynamically.
6. Click on **Dispatch Support Ticket**:
   - Try sending a ticket under each department.
   - Verify the loading spinner and matching assessment messages display correctly.
