# Implementation Plan — Chat Analyzer Screenshot OCR Integration

This plan details the removal of the outdated mobile chat export guide and the introduction of a new **Gemini AI-powered Screenshot OCR** feature inside the Chat Analyzer. This will allow users to upload images/screenshots of their chats and have them transcribed automatically into clean text logs for analysis.

---

## Proposed Changes

### 1. Remove Outdated Mobile Guide & Add Screenshot Upload UI

#### [MODIFY] [page.tsx](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/dashboard/analyzer/page.tsx)
* Import `useSubscription` at the top of the file to check if the user is on the free tier.
* Define `isExtractingScreenshot` and `handleScreenshotUpload` state/handlers:
  - Read files using `FileReader.readAsDataURL` to get a base64 Data URL.
  - Send the base64 payload to `/api/analyze-image`.
  - On success, populate `chatText` with the transcribed conversation log.
* Remove the **"Mobile User? How to Export Chats"** helper accordion block completely (lines 1033-1082).
* Insert the new **"Upload Chat Screenshot"** input and file button below the standard text file upload.

---

### 2. Create the Gemini Image Parser API Route

#### [NEW] [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/analyze-image/route.ts)
* Create a dynamic server-side POST handler.
* Load Gemini credentials and initialize `gemini-2.5-flash`.
* Prompt Gemini to extract conversation text from the screenshot base64 inline data and return it as a structured plain text conversation (`Sender Name: Message`).

---

## Verification Plan

### Manual Verification
1. Open `/dashboard/analyzer`. Verify that the mobile guide accordion is gone.
2. Click **Upload Chat Screenshot**, choose a `.png` or `.jpg` chat image.
3. Observe the loading state. Verify that the image text is transcribed cleanly into the textarea.
4. Click **Analyze Conversation** to check that the transcribed text is processed correctly.
