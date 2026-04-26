import { motion } from "framer-motion";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { ArrowLeft, Zap, Package, Download, Layers, Layout, Terminal, Rocket, BrainCircuit } from "lucide-react";

export function FeaturesPage() {
  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-white" />,
      title: "Deep Reason Mode",
      description: "Advanced cognitive processing for complex problem solving and architectural planning."
    },
    {
      icon: <Rocket className="w-8 h-8 text-white" />,
      title: "MVP Rapid Deployment",
      description: "Accelerated development cycles to get your product from concept to market in record time."
    },
    {
      icon: <Terminal className="w-8 h-8 text-white" />,
      title: "Advanced CLI Control",
      description: "Powerful command-line interface for deep integration with your existing dev workflows."
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Priority Generation",
      description: "High-speed intelligence processing ensuring you never have to wait for your results."
    },
    {
      icon: <Layers className="w-8 h-8 text-white" />,
      title: "Figma & Framer Export",
      description: "Seamlessly transition from logic to design with production-ready exports for leading tools."
    },
    {
      icon: <Download className="w-8 h-8 text-white" />,
      title: "Direct Data Access",
      description: "Full control over your generated assets with direct download capabilities and versioning."
    }
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 uppercase italic">
            Core <span className="text-white/20">Protocols</span>
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mb-16 leading-relaxed font-medium">
            State-of-the-art intelligence systems designed for the next generation of founders.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="p-10 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20 hover:bg-white/10 transition-all group"
            >
              <div className="w-16 h-16 rounded-[24px] bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-500 text-white">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-white/40 leading-relaxed text-sm font-medium">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
