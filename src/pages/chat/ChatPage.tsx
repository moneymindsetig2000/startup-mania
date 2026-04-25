import { ChevronDown, LayoutDashboard, Rocket, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShaderAnimation } from "@/components/ui/shader-animation"
import { SidebarContent } from "@/components/layout/chat/SidebarContent"
import { ChatInput } from "@/components/chat/ChatInput"
import { AgentColumn, type Message } from "@/components/chat/AgentColumn"
import { supabase } from "@/lib/supabase"

export function ChatPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const [activeAgents, setActiveAgents] = useState([true, true, true, true, true])
  const [chatHistories, setChatHistories] = useState<Message[][]>([[], [], [], [], []])
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const agentNames = useMemo(() => ["ChatGPT", "Gemini", "Claude", "Grok", "GLM"], [])
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = "/auth"
      } else {
        setIsLoadingAuth(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleEscape)

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const startResizing = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const toggleAgent = useCallback((index: number) => {
    setActiveAgents(prev => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }, [])

  const handleSend = useCallback((text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setChatHistories(prev => prev.map((history, idx) => 
      activeAgents[idx] ? [...history, userMessage] : history
    ));

    // Simulate AI responses for active agents
    setTimeout(() => {
      setChatHistories(prev => prev.map((history, idx) => {
        if (!activeAgents[idx]) return history;
        
        const aiResponses = [
          `As ChatGPT, I've processed your prompt: "${text}". I can help you structure the codebase and implement the core logic with optimal design patterns.`,
          `Gemini here. Analyzing "${text}" from a multi-modal perspective. I suggest focusing on high-performance rendering and a robust data pipeline.`,
          `Claude reporting. Your request "${text}" is clear. I'll focus on the constitutional AI aspects, ensuring safety and high-integrity code generation.`,
          `Grok active. Let's build this. "${text}" is a solid start. I'll provide the raw, unfiltered technical approach to maximize efficiency.`,
          `GLM online. I've parsed "${text}". My recommendation is to optimize for large-scale bilingual support and efficient token utilization.`
        ];

        const aiMessage: Message = {
          id: (Date.now() + idx + 1).toString(),
          role: "assistant",
          content: aiResponses[idx],
        };
        return [...history, aiMessage];
      }));
    }, 1200);
  }, [activeAgents]);

  useEffect(() => {
    let rafId: number

    const handlePointerMove = (e: PointerEvent) => {
      if (!isResizing) return

      rafId = requestAnimationFrame(() => {
        // Adjust for the 4px padding/offset from the screen edge
        const newWidth = Math.min(Math.max(200, e.clientX - 4), 500)
        setSidebarWidth(newWidth)
      })
    }

    const handlePointerUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    } else {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isResizing])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialPrompt = params.get("prompt");
    if (initialPrompt) {
      // Small delay to ensure everything is mounted and ready
      const timer = setTimeout(() => {
        handleSend(decodeURIComponent(initialPrompt));
        // Clean URL without refresh
        window.history.replaceState({}, "", window.location.pathname);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [handleSend]);

  const goToDashboard = useCallback(() => {
    window.location.pathname = "/"
  }, [])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }, [])

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-[#0a0a0a]" />
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ShaderAnimation />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-xl" />
      </div>
      <div className="relative z-10 flex min-h-screen w-full flex-col gap-1 p-1">
        <div
          ref={menuRef}
          className="relative z-20 h-16 rounded-[12px] border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="flex h-full items-center justify-between px-3 sm:px-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((value) => !value)}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="menu"
                  className="group flex items-center gap-1.5 rounded-full px-1 py-1 transition-colors duration-300 hover:bg-white/5"
                >
                  <span className="flex h-7 w-7 items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
                    <Rocket className="h-4 w-4" />
                  </span>
                  <span className="text-[0.82rem] font-semibold tracking-[0.16em] text-white uppercase">
                    Startup Mania
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center text-white/70 transition-transform duration-300 group-hover:translate-y-[1px]">
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>

                <div
                  role="menu"
                  aria-hidden={!isMenuOpen}
                  className={`absolute left-0 top-[calc(100%+0.6rem)] z-20 w-[176px] overflow-hidden rounded-[14px] border border-white/10 bg-[#0d0d0d]/95 p-1 shadow-[0_14px_36px_rgba(0,0,0,0.38)] backdrop-blur-xl transition-all duration-300 ease-out ${isMenuOpen
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
                    }`}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false)
                      goToDashboard()
                    }}
                    className="flex w-full items-center gap-2 rounded-[10px] px-2 py-2 text-left text-[0.78rem] font-medium text-white/85 transition-colors duration-200 hover:bg-white/8 hover:text-white"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/8 text-white">
                      <LayoutDashboard className="h-3.5 w-3.5" />
                    </span>
                    <span>Go to Dashboard</span>
                  </button>

                  <div className="mx-1 my-1 h-px bg-white/5" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false)
                      setShowLogoutConfirm(true)
                    }}
                    className="flex w-full items-center gap-2 rounded-[10px] px-2 py-2 text-left text-[0.78rem] font-medium text-red-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                      <LogOut className="h-3.5 w-3.5" />
                    </span>
                    <span>Logout Account</span>
                  </button>
                </div>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="group flex h-8 w-8 items-center justify-center transition-all duration-300"
                aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
              >
                <span className="text-white transition-transform duration-300 group-hover:scale-105">
                  {isCollapsed ? (
                    <PanelLeftOpen className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className={`flex flex-1 flex-col lg:flex-row overflow-hidden transition-[gap] duration-300 ${isCollapsed ? "gap-0" : "gap-1 lg:gap-0"}`}>
          <aside
            style={{
              width: isCollapsed ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${sidebarWidth}px` : '100%')
            }}
            className={`will-change-[width,opacity] [contain:layout_paint] ease-in-out overflow-hidden rounded-[12px] border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${isCollapsed ? "opacity-0" : "opacity-100"} ${isResizing ? "" : "transition-[width,opacity] duration-300"}`}
          >
            <SidebarContent />
          </aside>

          {!isCollapsed && (
            <div
              onPointerDown={startResizing}
              className={`group relative z-30 w-1 cursor-col-resize transition-all duration-300 hover:w-2 hidden lg:block ${isResizing ? "w-2" : ""}`}
            >
              <div className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-all duration-300 group-hover:bg-white/30 ${isResizing ? "bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "bg-transparent"}`} />
            </div>
          )}

          <main className="flex-1 flex flex-col [contain:layout_paint] rounded-[12px] border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden relative">
            <div className="flex flex-1 overflow-x-auto divide-x divide-white/10 custom-scrollbar pb-24">
              {activeAgents.map((isActive, index) => (
                <AgentColumn
                  key={index}
                  name={agentNames[index]}
                  index={index}
                  isActive={isActive}
                  onToggle={toggleAgent}
                  messages={chatHistories[index]}
                />
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent h-40 pointer-events-none" />
              <div className="relative pointer-events-auto">
                <ChatInput onSend={handleSend} />
              </div>
            </div>
          </main>
        </div>
      </div>

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
                  Are you sure you want to log out? Your current session will be terminated.
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
    </div>
  )
}
