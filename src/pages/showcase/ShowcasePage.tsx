import { motion } from "framer-motion";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { ArrowLeft, ExternalLink } from "lucide-react";

export function ShowcasePage() {
  const projects = [
    {
      title: "Nebula Dashboard",
      category: "Analytics",
      image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000",
      description: "Real-time data visualization for complex ecosystems."
    },
    {
      title: "Pulse AI",
      category: "Intelligence",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1000",
      description: "Predictive engine for market fluctuations."
    },
    {
      title: "Quantum Flow",
      category: "Workflow",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000",
      description: "Automated pipeline management for dev teams."
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
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 uppercase italic">
            Curated <span className="text-white/20">Works</span>
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mb-16 leading-relaxed font-medium">
            A selection of groundbreaking startups built using our platform's core infrastructure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="group relative rounded-[32px] overflow-hidden border border-white/10 bg-white/5"
            >
              <div className="aspect-[4/5] relative">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">
                    {project.category}
                  </span>
                  <h3 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    {project.title}
                    <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed max-w-[200px] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 font-medium">
                    {project.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
