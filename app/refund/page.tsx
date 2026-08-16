import type { Metadata } from "next";
import Link from "next/link";
import { Brain, ChevronLeft, Shield, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy | HeartMind AI",
  description: "Refund policy guidelines and request details for HeartMind AI paid subscriptions.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#07080c] animated-gradient flex flex-col justify-between font-sans selection:bg-indigo-500/20 selection:text-white">
      
      {/* Global Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 glass-strong flex items-center justify-between px-6 sm:px-12 select-none">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Brain className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-wide">
            HeartMind <span className="bg-gradient-to-r from-[#ea409b] to-[#04c7f0] bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        <Link 
          href="/" 
          className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
      </header>

      {/* Content wrapper */}
      <main className="flex-grow pt-24 pb-16 px-6 sm:px-12 relative z-10">
        <article className="max-w-3xl mx-auto bg-[#0b0c12]/50 border border-white/[0.04] backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Policy header */}
          <div className="space-y-4 border-b border-white/[0.04] pb-6 mb-8 text-left">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-extrabold uppercase tracking-widest">
              <AlertCircle className="w-4 h-4" />
              Billing Document
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">
              Refund Policy
            </h1>
            <p className="text-xs text-zinc-500">
              Last Updated: August 16, 2026
            </p>
          </div>

          {/* Sections content */}
          <div className="text-zinc-350 text-xs sm:text-sm leading-relaxed space-y-6 text-left">
            
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">1. Overview</h2>
              <p>
                HeartMind AI provides access to digital services, recurring subscription plans, and conversation insights tools. Since our platform delivers immediate digital value and utilizes high-performance AI inference compute models, we structure our refunds based on specific billing guidelines.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">2. Eligibility for Refunds</h2>
              <p>
                Refunds are reviewed on a case-by-case basis. You may be eligible for a refund under the following conditions:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-zinc-400 text-xs">
                <li>
                  <strong>Duplicate Payments:</strong> If you are billed twice for the same subscription plan during the same billing cycle due to a gateway error.
                </li>
                <li>
                  <strong>Billing Errors:</strong> If you are charged an incorrect billing rate or charged after subscription cancellation has been successfully completed.
                </li>
                <li>
                  <strong>Technical Failures:</strong> If severe platform bugs prevent you from generating analyses and our support developers are unable to resolve the issue within a reasonable timeframe.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">3. Non-Refundable Situations</h2>
              <p>
                Unless required by local consumer protection laws, we are unable to offer refunds in the following scenarios:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-zinc-400 text-xs">
                <li>You simply change your mind or decide not to use the purchased plans.</li>
                <li>You disagree with or are unsatisfied with the specific AI-generated conversation insights or attachment style descriptions.</li>
                <li>You forgot to cancel your recurring subscription before the auto-renewal date.</li>
                <li>Your account is suspended or terminated due to acceptable use policy violations.</li>
              </ul>
            </section>

            <section className="space-y-2 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-2xl p-4.5 my-4">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                ✉️ How to Request a Refund
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                To request a refund, please send an email to our support team with the following details:
              </p>
              <ul className="list-disc list-inside pl-4 mt-2 space-y-1 text-zinc-400 text-xs font-semibold">
                <li>Your registered email address</li>
                <li>Transaction or Order ID</li>
                <li>Date of payment</li>
                <li>A brief description of the reason for your refund request</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">4. Review and Processing Time</h2>
              <p>
                Upon receiving your request with the necessary details, we will review the transaction logs within 3 to 5 business days. Once approved, the refund will be credited back to your original payment method (via Stripe or Razorpay) according to standard banking processing cycles.
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-white/[0.04]">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">5. Contact Information</h2>
              <p>
                For refund requests and billing questions, please contact us at:
              </p>
              <p className="text-indigo-400 font-semibold mt-1">
                support@heartmind-ai.com
              </p>
            </section>

          </div>
        </article>
      </main>

      {/* Global Footer */}
      <footer className="py-10 px-6 border-t border-white/[0.04] bg-[#05060b] mt-auto select-none relative z-10 text-left">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-555 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-zinc-300">HeartMind AI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-zinc-350 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-350 transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-zinc-350 transition-colors underline">Refund Policy</Link>
            <Link href="/cancellation" className="hover:text-zinc-350 transition-colors">Cancellation Policy</Link>
          </div>
          <p className="text-zinc-600">&copy; {new Date().getFullYear()} HeartMind AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
