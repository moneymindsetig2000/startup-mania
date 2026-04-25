import { ChevronDown, LayoutDashboard, Rocket, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useEffect, useRef, useState, useCallback } from "react"
import { ShaderAnimation } from "@/components/ui/shader-animation"
import { SidebarContent } from "@/components/layout/chat/SidebarContent"

export function ChatPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

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

  const goToDashboard = () => {
    window.location.pathname = "/"
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
                  className={`absolute left-0 top-[calc(100%+0.6rem)] z-20 w-[176px] overflow-hidden rounded-[14px] border border-white/10 bg-[#0d0d0d]/95 p-1 shadow-[0_14px_36px_rgba(0,0,0,0.38)] backdrop-blur-xl transition-all duration-300 ease-out ${
                    isMenuOpen
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
            className={`will-change-[width,opacity] [contain:paint] ease-in-out overflow-hidden rounded-[12px] border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${isCollapsed ? "opacity-0" : "opacity-100"} ${isResizing ? "" : "transition-[width,opacity] duration-300"}`} 
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

          <main className="flex-1 flex flex-col [contain:paint] rounded-[12px] border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="flex flex-1 overflow-x-auto divide-x divide-white/10 custom-scrollbar">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex-1 min-w-[350px] flex flex-col relative group">
                  <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[0.6rem] font-black text-white/40 uppercase tracking-widest">Agent 0{i}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                  </div>
                  <div className="flex-1 p-1 flex flex-col gap-4">
                    <div className="flex-1 rounded-[4px] border border-dashed border-white/5 bg-white/[0.01]" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
