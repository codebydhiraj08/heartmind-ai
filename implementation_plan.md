# Implementation Plan — Voice Analyzer Dynamic Red-Flag Threshold Adjustment

This plan details the changes to solve the voice analysis red-flag detection issue where scores like 63 show 0 patterns and 10 healthy patterns. We will adjust the threshold limits dynamically based on the overall emotional safety score.

---

## Proposed Changes

### 1. Dynamic Threshold Tuning for Vocal Red-Flag Detection

#### [MODIFY] [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/analyze-voice/route.ts)
* Change how threshold parameters (`stressThreshold`, `hesitationThreshold`, `sadnessThreshold`, `angerThreshold`, `excitementThreshold`) are evaluated.
* Since the simulated vocal metrics have limited ranges (e.g., Sadness maxes out at 27%, Anger at 13%), absolute high thresholds like `sadness > 35` and `anger > 15` never trigger.
* Implement a dynamic scaling system for thresholds depending on the `overallScore`:
  * **If score is healthy (>= 85):** Keep absolute high thresholds to keep it clean (0 patterns).
  * **If score has concerns (55 - 84):** Lower thresholds so minor cues are detected as warnings (1-2 concern patterns).
    * `stressThreshold` = 30
    * `hesitationThreshold` = 30
    * `sadnessThreshold` = 12
    * `angerThreshold` = 5
    * `excitementThreshold` = 45
  * **If score is high-risk (< 55):** Lower thresholds further to capture multiple concerns (3-4 patterns).
    * `stressThreshold` = 20
    * `hesitationThreshold` = 20
    * `sadnessThreshold` = 8
    * `angerThreshold` = 3
    * `excitementThreshold` = 60

---

## Verification Plan

### Manual Verification
1. Run local dev server (`npm run dev -p 3005`).
2. Run a voice analysis that scores around 63.
3. Open the **Red Flag Detection** page for that voice record.
4. Verify that patterns (like Vocal Stress, Acoustic Evasion, or Vocal Tone Flattening) are now correctly listed under "Require Attention", and the corresponding healthy patterns count decreases.
5. Run a voice analysis with a very low score (< 50) and verify that multiple severe patterns are flagged.
