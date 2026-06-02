# Voice Analyzer and Chat Analyzer Layout Refinements Checklist

- `[x]` 1. Dynamic Red-Flag Mapping for Voice Analysis
  - `[x]` Update `app/api/analyze-voice/route.ts` to map `Stress Level`, `Hesitation`, `Sadness`, `Anger`, and `Excitement` to corresponding red flag objects.
  
- `[x]` 2. "View All" Patterns in Chat Analyzer
  - `[x]` Add `showAllPatterns` state hook in `app/dashboard/analyzer/page.tsx`.
  - `[x]` Update CardHeader layout for patterns section to include a toggle button.
  - `[x]` Slice displayed patterns list to 1 items by default.

- `[x]` 3. Voice Analyzer Layout & Alignment
  - `[x]` Remove the inline Red Flag button and summary note in `app/dashboard/voice/page.tsx`.
  - `[x]` Add bottom navigation button row matching Chat Analyzer style.
  - `[x]` Add new footer disclaimer note with `bg-accent/5` styling.
