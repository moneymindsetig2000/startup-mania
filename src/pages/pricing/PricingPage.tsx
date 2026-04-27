import { motion } from "framer-motion";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { ArrowLeft, Check, Zap, Package, Download, Layers, Layout, Terminal, Rocket, BrainCircuit } from "lucide-react";

export function PricingPage() {
  interface PlanFeature {
    text: string;
    icon: React.ReactNode;
    highlight?: boolean;
  }

  interface Plan {
    name: string;
    price: string;
    period: string;
    description: string;
    popular?: boolean;
    features: PlanFeature[];
  }

  const plans: Plan[] = [
    {
      name: "Base",
      price: "$0",
      period: "/forever",
      description: "Perfect for exploring the core capabilities of Pixora.",
      features: [
        { text: "5 Requests per day", icon: <Zap className="w-4 h-4" /> },
        { text: "Standard Generation", icon: <Package className="w-4 h-4" /> },
        { text: "Direct Downloads", icon: <Download className="w-4 h-4" /> },
        { text: "Figma Export", icon: <Layers className="w-4 h-4" /> },
        { text: "Framer Export", icon: <Layout className="w-4 h-4" /> }
      ]
    },
    {
      name: "Pro Elite",
      price: "$20",
      period: "/month",
      description: "Advanced intelligence for professional operators and founders.",
      popular: true,
      features: [
        { text: "Everything in Base", icon: <Check className="w-4 h-4" /> },
        { text: "10 Generations per day", icon: <Zap className="w-4 h-4" /> },
        { text: "Priority Reasoning Speed", icon: <Zap className="w-4 h-4" /> },
        { text: "Advanced CLI Control", icon: <Terminal className="w-4 h-4" /> },
        { text: "MVP Rapid Deployment", icon: <Rocket className="w-4 h-4" /> },
        { text: "Deep Reason Mode", icon: <BrainCircuit className="w-4 h-4" />, highlight: true }
      ]
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
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 uppercase italic">
            Mission <span className="text-white/20">Tiers</span>
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
            Select your operational gear. Level up your workflow with advanced intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`relative p-10 rounded-[48px] border flex flex-col h-full transition-all duration-500 overflow-hidden group ${
                plan.popular 
                  ? "bg-white border-white text-black shadow-[0_0_100px_rgba(255,255,255,0.1)]" 
                  : "bg-white/5 border-white/10 text-white hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-black text-[0.6rem] font-black uppercase tracking-[0.2em] text-white">
                  Recommended
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-2xl font-black uppercase tracking-tight mb-2 ${plan.popular ? "text-black" : "text-white"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm font-medium ${plan.popular ? "text-black/60" : "text-white/40"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                  <span className={`text-sm font-bold uppercase tracking-widest ${plan.popular ? "text-black/40" : "text-white/40"}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2 rounded-2xl transition-colors ${
                    feature.highlight 
                      ? (plan.popular ? "bg-black/5" : "bg-white/10") 
                      : ""
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      plan.popular ? "bg-black/10 text-black" : "bg-white/10 text-white"
                    }`}>
                      {feature.icon}
                    </div>
                    <span className={`text-sm ${feature.highlight ? "font-bold" : "font-medium"}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 ${
                plan.popular 
                  ? "bg-black text-white hover:bg-black/90 shadow-2xl" 
                  : "bg-white text-black hover:bg-white/90"
              }`}>
                {plan.popular ? "Upgrade to Pro" : "Current Plan"}
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
