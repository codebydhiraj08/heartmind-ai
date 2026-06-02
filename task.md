# Chat Analyzer Screenshot OCR Integration Checklist

- `[x]` 1. Create `/api/analyze-image` Route
  - `[x]` Write `app/api/analyze-image/route.ts` to transcribe screenshots using Gemini 2.5 Flash.

- `[x]` 2. Update Chat Analyzer UI
  - `[x]` Add `useSubscription` hook import and hook call in `app/dashboard/analyzer/page.tsx`.
  - `[x]` Define `isExtractingScreenshot` state and `handleScreenshotUpload` method.
  - `[x]` Remove the outdated mobile export accordion helper.
  - `[x]` Add the screenshot upload button and hook it to the handler.

- `[x]` 3. Verify
  - `[x]` Verify screenshot uploads are read, transcribed, and parsed properly by Gemini.

- `[x]` 4. Refine Gemini OCR parser for Right/Left chat bubbles and ignore quoted replies
  - `[x]` Update API route prompt with specific instructions for right/left layouts, header name matching, and reply-quote filtering.
  - `[x]` Rename UI button and loading overlay states to show "Uploading..." instead of "Reading Chat Screenshot via Gemini AI...".

