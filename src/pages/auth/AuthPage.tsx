"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Rocket, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ShaderAnimation } from "@/components/ui/shader-animation";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Clear error when switching modes
    setError(null);
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Sign Up
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            },
          },
        });
        
        if (signUpError) throw signUpError;
        
        // Note: Manual profile creation might be needed if triggers aren't set up
        // But for this setup, we'll assume the user is signed up.
      }

      // Check if there's a pending prompt in localStorage
      const pendingPrompt = localStorage.getItem("pending_prompt");
      if (pendingPrompt) {
        // Clear the prompt from storage as it's now being handled
        localStorage.removeItem("pending_prompt");
        window.location.href = `/chat?prompt=${encodeURIComponent(pendingPrompt)}`;
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative flex items-center justify-center overflow-hidden p-4">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ShaderAnimation />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[100px]" />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        onClick={() => window.location.href = "/"}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
      >
        <div className="h-8 w-8 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center transition-all group-hover:border-white/20 group-hover:bg-white/5">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </div>
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em]">Return</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="rounded-[32px] border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-2xl shadow-[0_32px_128px_rgba(0,0,0,0.8)] p-8 md:p-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_32px_rgba(255,255,255,0.2)] mb-6">
              <Rocket className="h-7 w-7 text-black" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-white/40 text-sm font-medium tracking-tight">
              {isLogin ? "Continue your startup journey" : "Begin your multi-agent experience"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative group"
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User className="h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all duration-300"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail className="h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all duration-300"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-12 text-sm focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-3"
              >
                <div className="mt-0.5">
                  <ShieldCheck className="h-4 w-4 text-red-500" />
                </div>
                <p className="text-red-500 text-[0.75rem] font-semibold leading-relaxed">
                  {error}
                </p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 mt-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Get Started"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/40 text-xs font-semibold tracking-tight hover:text-white transition-colors"
            >
              {isLogin ? (
                <>New to Pixora? <span className="text-white">Create an account</span></>
              ) : (
                <>Already have an account? <span className="text-white">Sign in</span></>
              )}
            </button>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-20">
          <ShieldCheck className="h-3 w-3" />
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em]">Secured by Supabase</span>
        </div>
      </motion.div>
    </div>
  );
}
