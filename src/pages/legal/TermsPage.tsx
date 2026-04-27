import { motion } from "framer-motion";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { ArrowLeft } from "lucide-react";

export function TermsPage() {
  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-white overflow-y-auto overflow-x-hidden custom-scrollbar selection:bg-white/10">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <ShaderAnimation />
      </div>

      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.location.pathname = "/"}
          className="group mb-12 flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 uppercase italic leading-none">
            Terms of <span className="text-white/20">Service</span>
          </h1>
          
          <div className="space-y-10 text-white/60 font-light leading-relaxed text-lg">
            <section className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">1. Acceptance of Terms</h2>
              <p>By accessing Pixora, the Neural-Aesthetic Engine developed for the Keystone College of Engineering, you agree to abide by these terms. This platform bridges abstract human creativity and production-grade frontend architecture.</p>
            </section>
            
            <section className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">2. Subscription Plans & Access</h2>
              <p>We offer three tiers of service: Free Trial (5 Requests / Day), Premium (10 Requests / Day for UI/UX Designers), and Enterprise (Custom Unlimited for Agencies). Access is subject to limits as per your respective plan. Misuse or automated scraping is strictly prohibited.</p>
            </section>

            <section className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">3. Intellectual Property</h2>
              <p>You retain full ownership of the UI designs and code you generate using our Deep Reason multi-agent architecture. However, the proprietary "Symphony of Five" orchestration workflow and the underlying platform architecture remain the intellectual property of the Keystone College team.</p>
            </section>
            
             <section className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">4. Limitation of Liability</h2>
              <p>While Pixora leverages cutting-edge LLMs (ChatGPT, Claude, Gemini, Grok, GLM) to write high-fidelity frontend code, we cannot guarantee the output is entirely error-free. It is your responsibility to verify the generated production-grade code before deployment.</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
