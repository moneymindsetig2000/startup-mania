import { useState, useEffect, useRef, useCallback } from "react";
import { Rocket, LogOut, ChevronDown, LayoutDashboard, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    let ticking = false;
    let isMounted = true;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (isMounted) {
            setIsScrolled(window.scrollY > 50);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  }, []);

  const userName = session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0] || "User";

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b transition-[padding,background-color,border-color,backdrop-filter] duration-500 will-change-[padding,background-color,backdrop-filter]",
          isScrolled 
            ? "border-white/10 bg-black/80 backdrop-blur-xl py-4" 
            : "border-transparent bg-transparent py-6"
        )}
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Rocket className="text-black w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">Startup Mania</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Showcase", "Pricing", "About"].map((item) => (
              <button
                key={item}
                onClick={() => window.location.pathname = `/${item.toLowerCase()}`}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="group flex items-center gap-3 rounded-full bg-white/5 border border-white/10 pl-1 pr-3 py-1 transition-all hover:bg-white/10 hover:border-white/20"
                >
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{userName}</span>
                  <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform duration-300", isMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]/95 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                    >
                      <button
                        onClick={() => window.location.pathname = "/chat"}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Go to Chat</span>
                      </button>
                      <div className="my-1 h-px bg-white/5" />
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => window.location.pathname = "/auth"}
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  Log in
                </button>
                <button 
                  onClick={() => (window.location.pathname = "/chat")} 
                  className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-black/20"
                >
                  Go to Chat
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d0d] p-8 shadow-[0_32px_128px_rgba(0,0,0,0.8)]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                  <LogOut className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold tracking-tight text-white">Sign Out</h3>
                <p className="mb-8 text-sm font-medium leading-relaxed text-white/40">
                  Are you sure you want to log out? Your session will end immediately.
                </p>
                <div className="flex w-full flex-col gap-2">
                  <button
                    onClick={handleLogout}
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Logout
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-white/5 text-sm font-bold text-white transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

