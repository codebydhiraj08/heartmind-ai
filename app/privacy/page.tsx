import type { Metadata } from "next";
import Link from "next/link";
import { Brain, ChevronLeft, Shield, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | HeartMind AI",
  description: "Privacy Policy detailing how data is processed, analyzed, and protected inside HeartMind AI relationship Wellness platform.",
};

export default function PrivacyPage() {
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
              <Lock className="w-4 h-4" />
              Privacy Document
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">
              Privacy Policy
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
                At HeartMind AI, we respect your privacy and are committed to protecting your personal data. This Privacy Policy describes how we collect, use, process, and safeguard the information you provide when using our relationship intelligence platform.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">2. Information We Collect</h2>
              <p>
                We may collect the following categories of information:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-zinc-400 text-xs">
                <li>
                  <strong>Account Information:</strong> When you register on the Platform, we collect your name, email address, password, and optional profile settings.
                </li>
                <li>
                  <strong>User-Provided Data:</strong> Any screenshots of chat conversations or pasted chat text that you upload to the Platform for AI analysis.
                </li>
                <li>
                  <strong>Conversation Logs:</strong> Temporary conversation transcripts processed by our AI relationship analyzer models.
                </li>
                <li>
                  <strong>Technical & Device Information:</strong> Internet Protocol (IP) address, browser type, device details, and local timezone settings for region configuration.
                </li>
              </ul>
            </section>

            <section className="space-y-2 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-2xl p-4.5 my-4">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                🔒 Secure Payment Policy
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                Payment transactions are processed securely by our third-party payment service providers (Stripe and Razorpay). <strong>HeartMind AI does not directly store complete credit card or payment card information.</strong>
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                All financial data is processed in compliance with PCI-DSS guidelines by Stripe and Razorpay, ensuring your financial credentials remain entirely safe.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">3. How We Use Your Information</h2>
              <p>
                We utilize collected information to:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-zinc-400 text-xs">
                <li>Provide AI-powered emotional analysis, relationship compatibility metrics, and red flag warnings.</li>
                <li>Securely verify subscription upgrade purchases and handle region identification.</li>
                <li>Personalize and optimize your dashboard interface and live coaching experiences.</li>
                <li>Analyze system load and prevent malicious activity or acceptable use violations.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">4. AI Processing & Third-Party Engines</h2>
              <p>
                To provide conversation analysis, the Platform transmits uploaded chat screenshots and text blocks to secure large language model (LLM) APIs. No user identifiers, names, or contact metadata are shared with LLM service providers. Any conversation snippets sent are stripped of original metadata where possible.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">5. Data Storage & Security</h2>
              <p>
                We implement industrial-standard security practices, including cryptographic hashing and TLS encryption, to protect user accounts and stored data assets. Conversation uploads are stored securely on our cloud servers and are private to your dashboard profile.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">6. Cookies & Tracking</h2>
              <p>
                We use cookies to maintain your login session state and preserve configuration selections (such as billing region). You can control cookies through your web browser preferences.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">7. Data Retention & Deletion Rights</h2>
              <p>
                We retain your account details and analysis logs for as long as your profile remains active. <strong>You have the right to request full account and data deletion at any time.</strong> You can execute deletion directly inside your account settings dashboard or by contacting us.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">8. Children&apos;s Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal details from children.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">9. Policy Updates</h2>
              <p>
                We may revise this Privacy Policy periodically. The latest version will always be published on this page with the updated revision date.
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-white/[0.04]">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">10. Contact Information</h2>
              <p>
                If you wish to assert your data rights, request account deletion, or have questions about how we handle user privacy, please contact:
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
            <Link href="/privacy" className="hover:text-zinc-350 transition-colors underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-350 transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-zinc-350 transition-colors">Refund Policy</Link>
            <Link href="/cancellation" className="hover:text-zinc-350 transition-colors">Cancellation Policy</Link>
          </div>
          <p className="text-zinc-600">&copy; {new Date().getFullYear()} HeartMind AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
