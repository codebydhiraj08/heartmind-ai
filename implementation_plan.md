# Implementation Plan — Payment Integration & Regional Pricing Security

We will stabilize and verify the payment system (Stripe and Razorpay) in the HeartMind application, while addressing the critical requirement of hiding pricing differences between Indian and International users. We will remove manual region toggles, implement secure automatic region detection (via server-side IP headers and client-side timezone fallbacks), and build a Razorpay verification backend.

## User Review Required

We are removing the manual Region Switcher button from the Upgrade page completely. 

> [!IMPORTANT]
> **How Region Detection & Pricing Isolation Works:**
> 1. **Server-Side IP Detection**: The backend `/api/subscription/status` will inspect geolocation headers (like `x-vercel-ip-country` or `cf-ipcountry`). If it detects `IN`, it automatically locks the user's database profile to the Indian billing region (`IN`/`INR`).
> 2. **Client-Side Timezone Fallback**: If the server-side headers are absent (e.g. in local development), the client-side page detects the user's browser timezone (e.g. `Asia/Kolkata`). If it is Indian, it registers the region as `IN` via an automated background API post, updating the user profile.
> 3. **Gateways & Currencies Isolation**:
>    - Users locked to `IN` will ONLY see prices in ₹ INR (₹499/₹999) and pay via **Razorpay**.
>    - Users locked to `US` (or any other region) will ONLY see prices in $ USD ($29/$49) and pay via **Stripe**.
>    - There will be no manual region toggle on the UI, ensuring no cross-visibility of different regional pricing.

## Open Questions

None.

---

## Proposed Changes

### Subscription Logic & API Handlers

#### [NEW] [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/subscription/verify/route.ts)
- Create a new POST handler for client-side Razorpay verification.
- Receive `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.
- Verify the signature using `crypto.createHmac` and the backend `RAZORPAY_KEY_SECRET`.
- If valid, update the active user's `subscriptionTier`, `subscriptionStatus = "active"`, `paymentProvider = "razorpay"`, and set expiration to 30 days.

#### [MODIFY] [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/subscription/status/route.ts)
- In the `GET` handler, read client geolocation headers (`x-vercel-ip-country`, `cf-ipcountry`).
- If detected country is `IN` and user region is not yet locked/initialized, automatically update the user's `billingRegion = "IN"` and `currency = "INR"` in the database.

#### [MODIFY] [route.ts](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/api/subscription/checkout/route.ts)
- Enforce the server-side regional check: do not trust arbitrary region params from client unless matching the database profile or geo-IP headers.
- If region is determined to be `IN`, create a Razorpay order. Otherwise, construct a Stripe checkout session.

---

### Dashboard Pages

#### [MODIFY] [page.tsx](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/dashboard/upgrade/page.tsx)
- Remove the region selector UI completely (the toggle bar with Globe icons).
- Implement client-side timezone and locale auto-detection inside `useEffect` as a fallback.
- If the detected region differs from the loaded database region, automatically send a background POST request to `/api/subscription/status` to sync it.
- Integrate Razorpay verification backend call within the SDK's payment `handler` callback (calling `/api/subscription/verify`).
- Detect `?canceled=true` Stripe checkout cancel params and show error state. Clear query params using `window.history.replaceState`.

#### [MODIFY] [page.tsx](file:///c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/app/dashboard/page.tsx)
- Detect `?success=true` Stripe checkout success search parameters.
- Present a beautiful upgrade celebration dialog welcoming the user to their upgraded premium tier.
- Trigger `refreshSubscription()` to instantly update layout state.
- Clear query parameters on success screen closing to keep URLs clean.

---

## Verification Plan

### Automated / Manual Verification
1. **Stripe Test Mode (International)**:
   - Run in a browser with a non-Indian timezone (e.g. US/London).
   - Ensure the pricing page displays USD pricing ($29/$49) without any region toggles.
   - Complete Checkout using Stripe Sandbox.
2. **Razorpay Test Mode (India)**:
   - Run in a browser with `Asia/Kolkata` timezone or mock the database profile to `IN`.
   - Ensure the page displays INR pricing (₹499/₹999).
   - Verify payment opens the Razorpay frame and updates status on completion via signature verification.
