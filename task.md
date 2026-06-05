# Tasks - Payment Integration & Pricing Isolation

- [x] Create Razorpay Signature Verification Endpoint (`app/api/subscription/verify/route.ts`)
- [x] Update Subscription Status API (`app/api/subscription/status/route.ts`) with Server-Side IP detection
- [x] Update Checkout API (`app/api/subscription/checkout/route.ts`) to validate region parameters
- [x] Refactor Upgrade Page (`app/dashboard/upgrade/page.tsx`) to remove manual region selector, add automatic client detection, and integrate signature verification
- [x] Update Dashboard Page (`app/dashboard/page.tsx`) to handle Stripe success redirect parameter and display celebration screen
