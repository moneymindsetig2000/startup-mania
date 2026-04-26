import { motion } from "framer-motion";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { ArrowLeft, Users, Target, Heart } from "lucide-react";

export function AboutPage() {
  const modules = [
    { label: "Intelligence", title: "Gemini AI Engine", desc: "Integrated state-of-the-art LLMs for autonomous startup reasoning." },
    { label: "Frontend", title: "React Ecosystem", desc: "Built with Vite & TypeScript for a high-performance, type-safe experience." },
    { label: "Backend", title: "Supabase Cloud", desc: "Real-time database and secure authentication architecture." },
    { label: "Graphics", title: "Three.js Shaders", desc: "Custom WebGL shaders for an immersive, cinematic user interface." }
  ];

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-white overflow-y-auto overflow-x-hidden custom-scrollbar selection:bg-white/10">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <ShaderAnimation />
      </div>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-20">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.location.pathname = "/"}
          className="group mb-12 flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 uppercase italic leading-none">
              Project <span className="text-white/20">Scope</span>
            </h1>
            <p className="text-2xl text-white/60 mb-8 leading-relaxed font-light">
              An advanced AI-driven ecosystem developed to streamline startup innovation through autonomous reasoning.
            </p>
            <p className="text-lg text-white/40 leading-relaxed max-w-xl font-medium">
              This project demonstrates the convergence of modern web technologies, real-time data management, and generative intelligence to solve complex business engineering challenges.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {modules.map((mod, i) => (
              <div key={i} className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all group">
                <div className="text-[0.6rem] uppercase tracking-[0.2em] text-white/30 font-black mb-3 group-hover:text-white/60 transition-colors">{mod.label}</div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">{mod.title}</h3>
                <p className="text-xs leading-relaxed text-white/40 font-medium">{mod.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Target />, title: "Research Driven", desc: "Built on theoretical frameworks for generative intelligence and autonomous agents." },
            { icon: <Users />, title: "Scalable Architecture", desc: "Designed with a modular micro-frontend approach for future scalability and maintenance." },
            { icon: <Heart />, title: "UX Innovation", desc: "Pioneering new interaction patterns for human-AI collaboration in high-stakes environments." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-10 rounded-[32px] border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-white">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight">{item.title}</h3>
              <p className="text-white/40 leading-relaxed text-sm font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
