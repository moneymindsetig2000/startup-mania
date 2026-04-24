import { ChevronDown, LayoutDashboard, Rocket, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function ChatPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
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

  const goToDashboard = () => {
    window.location.pathname = "/"
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="flex min-h-screen w-full flex-col gap-2 p-2">
        <div
          ref={menuRef}
          className="relative h-16 rounded-[12px] border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_80px_rgba(0,0,0,0.45)]"
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
                  className={`absolute left-0 top-[calc(100%+0.6rem)] z-20 w-[176px] overflow-hidden rounded-[14px] border border-white/10 bg-[#0b0b0b]/95 p-1 shadow-[0_14px_36px_rgba(0,0,0,0.38)] backdrop-blur-xl transition-all duration-300 ease-out ${
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

        <div className="flex flex-1 gap-2 flex-col lg:flex-row overflow-hidden">
          <aside className={`transition-all duration-300 ease-in-out overflow-hidden rounded-[12px] border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_80px_rgba(0,0,0,0.45)] ${isCollapsed ? "w-0 opacity-0 border-none" : "w-full lg:w-[280px] opacity-100"}`} />
          <main className="flex-1 rounded-[12px] border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_80px_rgba(0,0,0,0.45)]" />
        </div>
      </div>
    </div>
  )
}
