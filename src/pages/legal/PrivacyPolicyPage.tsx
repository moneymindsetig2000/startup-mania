import { motion } from "framer-motion";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { ArrowLeft } from "lucide-react";

export function PrivacyPolicyPage() {
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
            Privacy <span className="text-white/20">Policy</span>
          </h1>
          
          <div className="space-y-10 text-white/60 font-light leading-relaxed text-lg">
            <section className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">1. Data Sovereignty and Security</h2>
              <p>At Pixora (Startup Mania), we prioritize your intellectual property. We utilize Supabase's Row-Level Security (RLS) to ensure that your generations and user histories are private and completely inaccessible to third parties. Our architecture is sovereign and secure by default.</p>
            </section>
            
            <section className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">2. No Training Policy</h2>
              <p>We believe your designs belong to you. Pixora strictly adheres to a "No Training Policy." We do not use your prompts, generated UI designs, or chat histories to train our or any external third-party models.</p>
            </section>

            <section className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">3. Data Collection</h2>
              <p>We only collect information necessary to provide you with our service, including basic account credentials and your current subscription tier (Free Trial, Premium, or Enterprise). We do not harvest extraneous metadata.</p>
            </section>
            
             <section className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">4. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or our sovereign data infrastructure, please contact the Keystone College of Engineering Startup-mania team.</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
