import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, CreditCard, LogOut, Key, Zap, X, Download, Layers, Terminal, Rocket, BrainCircuit, Package, Layout } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function SettingsModal({ isOpen, onClose, onLogout }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"account" | "billing" | "usage">("account");
  const [user, setUser] = useState<{ email?: string; username?: string }>({});
  const [usage, setUsage] = useState({ used: 0, total: 5 });

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Fetch real user data from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          email: session.user.email,
          username: session.user.email?.split('@')[0] || "user",
        });
      }
    };
    fetchUser();
  }, [isOpen]);

  // Load usage from LocalStorage
  useEffect(() => {
    if (isOpen) {
      const storedUsage = localStorage.getItem("startup_mania_usage");
      const used = storedUsage ? parseInt(storedUsage, 10) : 0;
      setUsage(prev => ({ ...prev, used }));
    }
  }, [isOpen]);

  if (typeof window === "undefined") return null;

  const usagePercentage = (usage.used / usage.total) * 100;
  const displayUsername = user.username || "user";
  const displayEmail = user.email || "loading...";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
          {/* Backdrop - Solid dark to prevent GPU lag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-[900px] h-[600px] max-h-[90vh] flex overflow-hidden rounded-[24px] border border-white/10 bg-[#0d0d0d] shadow-[0_32px_128px_rgba(0,0,0,0.8)]"
          >
            {/* Sidebar */}
            <div className="w-[240px] flex-shrink-0 border-r border-white/10 bg-white/[0.02] flex flex-col p-4">
              <div className="flex items-center gap-3 mb-8 px-2 mt-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {displayUsername.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white/90">{displayUsername}</span>
                  <span className="text-[0.65rem] text-white/40 uppercase tracking-wider">Free Trial</span>
                </div>
              </div>

              <nav className="flex flex-col gap-1 flex-1">
                <button
                  onClick={() => setActiveTab("account")}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    activeTab === "account"
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-semibold tracking-tight">Account details</span>
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    activeTab === "billing"
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-semibold tracking-tight">Billing</span>
                </button>
                <button
                  onClick={() => setActiveTab("usage")}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    activeTab === "usage"
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-semibold tracking-tight">Usage & Limits</span>
                </button>
              </nav>

              {/* Logout Button */}
              <div className="mt-auto pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-semibold tracking-tight">Log out</span>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative bg-black/20">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-white/40 hover:bg-white/10 hover:text-white/90 rounded-full transition-colors z-20"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <AnimatePresence mode="wait">
                  {activeTab === "account" && (
                    <motion.div
                      key="account"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="max-w-md"
                    >
                      <div className="flex flex-col mb-10">
                        <h2 className="text-4xl font-black tracking-tighter text-white mb-2 italic uppercase">Profile Core</h2>
                        <p className="text-sm font-medium text-white/40 max-w-sm">Identity management and secure protocol configuration.</p>
                      </div>

                      <div className="space-y-8">
                        <div className="flex items-center gap-6 p-6 rounded-[32px] border border-white/10 bg-white/[0.02]">
                          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center border border-white/10 relative group overflow-hidden">
                            <span className="text-3xl font-black text-white relative z-10">{displayUsername.charAt(0).toUpperCase()}</span>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Identity Level</span>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{displayUsername}</h3>
                            <span className="text-[0.65rem] font-black text-white/40 uppercase tracking-widest mt-1 px-2 py-0.5 rounded-md bg-white/5 inline-block w-fit">Free Operator</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                            <label className="text-[0.55rem] font-black uppercase tracking-widest text-white/20 block mb-2 group-hover:text-white/40 transition-colors">Primary Access Email</label>
                            <div className="text-lg font-bold text-white tracking-tight">{displayEmail}</div>
                          </div>

                          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                            <label className="text-[0.55rem] font-black uppercase tracking-widest text-white/20 block mb-2 group-hover:text-white/40 transition-colors">Network Username</label>
                            <div className="text-lg font-bold text-white tracking-tight">{displayUsername}</div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[0.65rem] font-black text-white/40 uppercase tracking-[0.2em]">Security Protocol</h3>
                          </div>
                          <button className="flex items-center justify-between w-full p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group overflow-hidden relative">
                            <div className="flex items-center gap-4 relative z-10">
                              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                                <Key className="h-5 w-5" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="text-sm font-bold text-white/90">Authentication Shield</span>
                                <span className="text-[0.65rem] font-medium text-white/30">Update your access credentials</span>
                              </div>
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-white relative z-10">Reset</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "billing" && (
                    <motion.div
                      key="billing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="max-w-4xl"
                    >
                      <div className="flex flex-col mb-10">
                        <h2 className="text-4xl font-black tracking-tighter text-white mb-2 italic uppercase">Select your Gear</h2>
                        <p className="text-sm font-medium text-white/40 max-w-sm">Level up your workflow with our advanced intelligence tiers.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Free Plan - Brutalist Minimalist */}
                        <div className="relative p-8 rounded-[32px] border border-white/10 bg-white/[0.02] flex flex-col h-full overflow-hidden group">
                          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-32 h-32 text-white" strokeWidth={1} />
                          </div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                              <span className="px-3 py-1 rounded-full bg-white text-[0.6rem] font-black uppercase text-black">Current</span>
                              <h3 className="text-xl font-bold text-white uppercase tracking-widest">Base</h3>
                            </div>
                            
                            <div className="mb-8">
                              <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white tracking-tighter">$0</span>
                                <span className="text-sm font-bold text-white/30 uppercase tracking-widest">/forever</span>
                              </div>
                            </div>

                            <div className="space-y-4 mb-10">
                              {[
                                { text: "5 Requests per day", icon: Zap },
                                { text: "Standard Generation", icon: Package },
                                { text: "Direct Downloads", icon: Download },
                                { text: "Figma Export", icon: Layers },
                                { text: "Framer Export", icon: Layout },
                              ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-white/40">
                                    <item.icon className="h-3 w-3" />
                                  </div>
                                  <span className="text-[0.75rem] font-semibold text-white/60 tracking-tight">{item.text}</span>
                                </div>
                              ))}
                            </div>

                            <div className="mt-auto">
                              <div className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 text-center text-[0.7rem] font-black uppercase tracking-[0.2em]">
                                Default Active
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pro Plan - Premium Maximalist */}
                        <div className="relative p-8 rounded-[32px] border border-white/20 bg-[#ffffff] text-black flex flex-col h-full shadow-[0_0_80px_rgba(255,255,255,0.1)] group">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black text-[0.6rem] font-black uppercase tracking-[0.2em] text-white shadow-xl">
                            Recommended
                          </div>

                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xl font-bold uppercase tracking-widest">Pro Elite</h3>
                              <Zap className="h-6 w-6 fill-black" />
                            </div>
                            
                            <div className="mb-8">
                              <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black tracking-tighter">$20</span>
                                <span className="text-sm font-bold opacity-40 uppercase tracking-widest">/month</span>
                              </div>
                            </div>

                            <div className="space-y-4 mb-10">
                              {[
                                { text: "Everything in Base", bold: true },
                                { text: "10 Generations per day", icon: Zap },
                                { text: "Priority Reasoning Speed", icon: Zap },
                                { text: "Advanced CLI Control", icon: Terminal },
                                { text: "MVP Rapid Deployment", icon: Rocket },
                                { text: "Deep Reason Mode", icon: BrainCircuit, highlight: true },
                              ].map((item, i) => (
                                <div key={i} className={`flex items-center gap-3 ${item.highlight ? "p-2 rounded-xl bg-black/5" : ""}`}>
                                  <div className={`flex h-5 w-5 items-center justify-center rounded-full ${item.highlight ? "bg-black text-white" : "bg-black/10 text-black/40"}`}>
                                    {item.icon ? <item.icon className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                                  </div>
                                  <span className={`text-[0.75rem] ${item.bold || item.highlight ? "font-black" : "font-semibold"} tracking-tight`}>
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <button className="relative w-full py-4 rounded-2xl bg-black text-white text-[0.8rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden group/btn">
                              <span className="relative z-10">Upgrade to Pro</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "usage" && (
                    <motion.div
                      key="usage"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="max-w-xl"
                    >
                      <div className="flex flex-col mb-10">
                        <h2 className="text-4xl font-black tracking-tighter text-white mb-2 italic uppercase">System Stats</h2>
                        <p className="text-sm font-medium text-white/40 max-w-sm">Live monitoring of your active intelligence resources.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="p-8 rounded-[32px] border border-white/10 bg-white/[0.02] relative overflow-hidden">
                          <div className="flex justify-between items-start mb-12">
                            <div className="flex flex-col">
                              <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Resource Utilization</span>
                              <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Free Trial</h3>
                            </div>
                            <div className="text-right">
                              <div className="text-5xl font-black text-white tracking-tighter mb-1">
                                {usagePercentage.toFixed(0)}%
                              </div>
                              <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/30">Consumed</span>
                            </div>
                          </div>

                          {/* Unique Segmented Progress Bar */}
                          <div className="flex gap-1.5 mb-8">
                            {[...Array(10)].map((_, i) => (
                              <div key={i} className="flex-1 h-3 rounded-sm bg-white/5 overflow-hidden">
                                <motion.div 
                                  initial={{ x: "-100%" }}
                                  animate={{ x: usagePercentage > (i * 10) ? "0%" : "-100%" }}
                                  transition={{ duration: 0.5, delay: i * 0.05 }}
                                  className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <span className="text-[0.55rem] font-black uppercase tracking-widest text-white/20 block mb-1">Used</span>
                              <span className="text-xl font-bold text-white">{usage.used} <span className="text-xs text-white/30 font-medium">Reqs</span></span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <span className="text-[0.55rem] font-black uppercase tracking-widest text-white/20 block mb-1">Total Limit</span>
                              <span className="text-xl font-bold text-white">{usage.total} <span className="text-xs text-white/30 font-medium">Reqs</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-[24px] border border-dashed border-white/10 bg-transparent flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                              <Zap className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white/80">Need more power?</p>
                              <p className="text-xs text-white/30 font-medium">Reset your limits instantly with Pro.</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveTab("billing")}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest transition-all"
                          >
                            Upgrade
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
