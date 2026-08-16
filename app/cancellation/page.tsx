import type { Metadata } from "next";
import Link from "next/link";
import { Brain, ChevronLeft, Shield, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation Policy | HeartMind AI",
  description: "Subscription cancellation details and procedures for HeartMind AI platform accounts.",
};

export default function CancellationPage() {
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
              <CheckCircle2 className="w-4 h-4" />
              Usage Document
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">
              Cancellation Policy
            </h1>
            <p className="text-xs text-zinc-500">
              Last Updated: August 16, 2026
            </p>
          </div>

          {/* Sections content */}
          <div className="text-zinc-350 text-xs sm:text-sm leading-relaxed space-y-6 text-left">
            
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">1. Subscription Cancellation</h2>
              <p>
                HeartMind AI paid subscriptions (Pro and Premium) are billed on a recurring monthly cycle. You can cancel your subscription at any time. There are no cancellation fees or lock-in contract periods.
              </p>
            </section>

            <section className="space-y-2 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-2xl p-4.5 my-4">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                ⚙️ How to Cancel Your Subscription
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                You can easily cancel your subscription using either of these secure methods:
              </p>
              <ul className="list-decimal list-inside pl-4 mt-2 space-y-1.5 text-zinc-400 text-xs">
                <li>
                  <strong>Self-Service Billing Portal:</strong> Navigate to your dashboard, click on <em>Upgrade/Billing</em>, and click the <strong>Manage Subscription</strong> button. This redirect will open your secure Stripe customer billing portal where you can cancel instantly with one click.
                </li>
                <li>
                  <strong>Support Request:</strong> If you are billing via Razorpay or require assistance, send an email to <span className="text-indigo-400 font-semibold">support@heartmind-ai.com</span> requesting cancellation. Please include your registered email address and name.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">2. Cancellation Timing</h2>
              <p>
                To avoid being charged for the subsequent billing cycle, you must cancel your subscription at least 24 hours before your next renewal date.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">3. Access After Cancellation</h2>
              <p>
                When you cancel your subscription, your premium features remain fully active until the end of your current paid billing period. At the end of the billing period, your account will revert automatically to the Free tier, and recurring charges will cease.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">4. Difference Between Cancellation & Refund</h2>
              <p>
                Please note that cancelling your subscription simply stops future automatic renewals. <strong>Cancellation does not trigger a refund of previous charges.</strong> If you wish to request a refund for an active cycle, please consult our <Link href="/refund" className="text-indigo-400 hover:text-indigo-350 underline">Refund Policy</Link> and file a support request.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">5. Account Deletion & Closure</h2>
              <p>
                If you choose to permanently close your HeartMind AI account and remove all stored chat screenshot uploads and historical analysis reports, you can trigger account deletion in your Settings page. This will instantly delete your credentials and invalidate active subscriptions.
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-white/[0.04]">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">6. Contact Information</h2>
              <p>
                For cancellation requests or portal issues, please contact:
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
            <Link href="/refund" className="hover:text-zinc-350 transition-colors">Refund Policy</Link>
            <Link href="/cancellation" className="hover:text-zinc-350 transition-colors underline">Cancellation Policy</Link>
          </div>
          <p className="text-zinc-600">&copy; {new Date().getFullYear()} HeartMind AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
