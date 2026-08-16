import type { Metadata } from "next";
import Link from "next/link";
import { Brain, ChevronLeft, Shield, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | HeartMind AI",
  description: "Terms and Conditions for utilizing the HeartMind AI relationship intelligence software platform.",
};

export default function TermsPage() {
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
              <Shield className="w-4 h-4" />
              Legal Document
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">
              Terms & Conditions
            </h1>
            <p className="text-xs text-zinc-500">
              Last Updated: August 16, 2026
            </p>
          </div>

          {/* Sections content */}
          <div className="text-zinc-350 text-xs sm:text-sm leading-relaxed space-y-6 text-left">
            
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">1. Introduction</h2>
              <p>
                Welcome to HeartMind AI (the &quot;Platform&quot;). These Terms & Conditions govern your access to and use of our software, websites, services, and applications (collectively, the &quot;Service&quot;). Please read these terms carefully before accessing or using the Service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">2. Acceptance of Terms</h2>
              <p>
                By creating an account, upgrading your subscription, or using the Platform, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree to these terms, you may not access or use the Service.
              </p>
            </section>

            <section className="space-y-2 bg-rose-500/[0.03] border border-rose-500/10 rounded-2xl p-4.5 my-4">
              <h2 className="text-sm font-black text-rose-450 uppercase tracking-widest flex items-center gap-2">
                ⚠️ Professional Disclaimer
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                HeartMind AI is an AI-powered software platform providing informational analysis and conversational intelligence helper tools. <strong>HeartMind AI does NOT provide medical, psychological, psychiatric, legal, or professional relationship counseling services.</strong>
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                The Platform&apos;s generated insights, red flag detections, and conversational responses are for educational and informational purposes only. They must not be relied upon as professional guidance. You are encouraged to seek the advice of qualified professionals regarding any relationship issues, mental health challenges, or psychological distress.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">3. Description of Service</h2>
              <p>
                HeartMind AI provides users with relationship analytics, attachment style evaluation, red flag detection, and conversation sentiment reframing tools powered by advanced large language models. The features accessible to you depend on your subscription plan tier (Free, Pro, or Premium).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">4. Account Registration</h2>
              <p>
                To utilize the Service, you must create a personal account. You agree to provide accurate, current, and complete information during registration and to update such info to keep it accurate. You are responsible for safeguarding your password and account credentials.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">5. User Responsibilities & Acceptable Use</h2>
              <p>
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-zinc-400 text-xs">
                <li>Upload screenshots, text, or files without obtaining the legal consent of all original conversation participants.</li>
                <li>Harass, stalk, threaten, or abuse other users or third parties.</li>
                <li>Attempt to bypass security constraints, scrape content, or reverse-engineer the AI processing endpoints.</li>
                <li>Upload malicious software or exploit potential application vulnerabilities.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">6. AI-Powered Insights & Guidance</h2>
              <p>
                Our advanced AI engines process uploaded screenshots and text messages to provide helpful, deep communication insights for your self-reflection. While we continuously refine our models for maximum accuracy and emotional depth, AI-generated analysis is designed to support, not replace, human judgment and intuition. You acknowledge that AI insights represent supportive guidance and analytical suggestions, and you agree to utilize your own personal judgment when making decisions based on Platform data.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">7. Subscriptions, Payments & Billing</h2>
              <p>
                Certain services require paid subscription plans (Pro or Premium). All payment terms, transaction processing, and renewal policies are managed securely by our third-party payment gateways (Stripe and Razorpay). By registering for a paid plan, you authorize automatic recurring payments based on the billing region and cycle selected.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">8. Intellectual Property Rights</h2>
              <p>
                All elements of the Platform, including proprietary algorithms, user interface, brand assets, and codebases, are owned exclusively by HeartMind AI. You are granted a limited, non-exclusive, non-transferable license to access the Platform solely for personal, non-commercial purposes.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">9. Service Availability & Modification</h2>
              <p>
                We reserve the right to temporarily suspend, update, or discontinue features of the Platform for scheduled maintenance or performance tuning without prior liability.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, HeartMind AI and its developers shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your reliance on the AI-generated insights, communication recommendations, or Platform downtime.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">11. Termination</h2>
              <p>
                We may terminate or suspend your account access immediately, without prior notice, if you violate any part of these Terms & Conditions. You may terminate your account at any time by requesting deletion inside your dashboard settings.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will indicate changes by updating the &quot;Last Updated&quot; date at the top of this page. Your continued use of the Platform signifies acceptance of updated terms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">13. Governing Law</h2>
              <p>
                These Terms & Conditions shall be governed by and construed in accordance with the laws of the jurisdiction in which the business owner operates, without regard to conflicts of law provisions.
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-white/[0.04]">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">14. Contact Information</h2>
              <p>
                If you have any questions or clarifications regarding these Terms & Conditions, please contact us at:
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
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-550 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-zinc-300">HeartMind AI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-zinc-350 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-350 transition-colors underline">Terms of Service</Link>
            <Link href="/refund" className="hover:text-zinc-350 transition-colors">Refund Policy</Link>
            <Link href="/cancellation" className="hover:text-zinc-350 transition-colors">Cancellation Policy</Link>
          </div>
          <p className="text-zinc-600">&copy; {new Date().getFullYear()} HeartMind AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
