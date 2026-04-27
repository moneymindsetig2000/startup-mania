import { ChevronDown, LayoutDashboard, Rocket, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShaderAnimation } from "@/components/ui/shader-animation"
import { SidebarContent } from "@/components/layout/chat/SidebarContent"
import { ChatInput } from "@/components/chat/ChatInput"
import { AgentColumn, type Message } from "@/components/chat/AgentColumn"
import { DeepReasonView } from "@/components/chat/DeepReasonView"
import { SettingsModal } from "@/components/chat/SettingsModal"
import { ExportGuideModal } from "@/components/chat/ExportGuideModal"
import { supabase } from "@/lib/supabase"
import { generateAgentResponse } from "@/lib/gemini"

const FigmaIconHeader = () => (
  <svg width="12" height="18" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 28.5C19 25.9834 20.0009 23.5699 21.7825 21.7883C23.5641 20.0067 25.9775 19 28.5 19C31.0225 19 33.4359 20.0067 35.2175 21.7883C36.9991 23.5699 38 25.9834 38 28.5C38 31.0166 36.9991 33.4301 35.2175 35.2117C33.4359 36.9933 31.0225 38 28.5 38C25.9775 38 23.5641 36.9933 21.7825 35.2117C20.0009 33.4301 19 31.0166 19 28.5Z" fill="#1ABCFE"/>
    <path d="M0 47.5C0 44.9834 1.00089 42.5699 2.78249 40.7883C4.56408 39.0067 6.97754 38 9.5 38H19V47.5C19 50.0166 17.9991 52.4301 16.2175 54.2117C14.4359 55.9933 12.0225 57 9.5 57C6.97754 57 4.56408 55.9933 2.78249 54.2117C1.00089 52.4301 0 50.0166 0 47.5Z" fill="#0AC17D"/>
    <path d="M0 28.5C0 25.9834 1.00089 23.5699 2.78249 21.7883C4.56408 20.0067 6.97754 19 9.5 19H19V38H9.5C6.97754 38 4.56408 36.9933 2.78249 35.2117C20.0009 33.4301 0 31.0166 0 28.5Z" fill="#A259FF"/>
    <path d="M0 9.5C0 6.98342 1.00089 4.56994 2.78249 2.78835C4.56408 1.00676 6.97754 0 9.5 0H19V19H9.5C6.97754 19 4.56408 17.9932 2.78249 16.2117C1.00089 14.4301 0 12.0166 0 9.5Z" fill="#F24E1E"/>
    <path d="M19 0H28.5C31.0225 0 33.4359 1.00676 35.2175 2.78835C36.9991 4.56994 38 6.98342 38 9.5C38 12.0166 36.9991 14.4301 35.2175 16.2117C33.4359 17.9932 31.0225 19 28.5 19H19V0Z" fill="#FF7262"/>
  </svg>
)

const FramerIconHeader = () => (
  <svg width="12" height="18" viewBox="0 0 14 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H14V7H7L0 0Z" fill="white"/>
    <path d="M0 7H14V14H0V7Z" fill="white"/>
    <path d="M0 14H7V21L0 14Z" fill="white"/>
  </svg>
)

export function ChatPage() {
  const [showExportGuide, setShowExportGuide] = useState(false)
  const [exportGuideTab, setExportGuideTab] = useState<"figma" | "framer">("figma")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDeepReasonMode, setIsDeepReasonMode] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const [activeAgents, setActiveAgents] = useState([true, true, true, true, true])
  const [projects, setProjects] = useState<{ id: string; name: string; createdAt: number }[]>(() => {
    const stored = localStorage.getItem("startup_mania_projects")
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error("Failed to parse projects", e)
        return []
      }
    }
    return []
  })
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const active = localStorage.getItem("startup_mania_active_project")
    if (active) return active
    const stored = localStorage.getItem("startup_mania_projects")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.length > 0) return parsed[0].id
      } catch (e) { }
    }
    return null
  })

  // Use a lazy initializer for chat histories to prevent flash/sync issues
  const [chatHistories, setChatHistories] = useState<Message[][]>(() => {
    const activeId = localStorage.getItem("startup_mania_active_project")
    if (activeId) {
      const stored = localStorage.getItem(`startup_mania_chats_${activeId}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Ensure it has enough slots if we just added DeepReason
          if (parsed.length < 6) {
            return [...parsed, ...Array(6 - parsed.length).fill([])]
          }
          return parsed
        } catch (e) { }
      }
    }
    return [[], [], [], [], [], []]
  })

  const lastLoadedProjectId = useRef<string | null>(activeProjectId)
  const initialPromptProcessed = useRef(false)
  const stopSignalRef = useRef<boolean>(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const agentNames = useMemo(() => ["ChatGPT", "Gemini", "Claude", "Grok", "GLM", "DeepReason"], [])
  const menuRef = useRef<HTMLDivElement | null>(null)

  // 2. Persist Projects whenever they change
  useEffect(() => {
    localStorage.setItem("startup_mania_projects", JSON.stringify(projects))
  }, [projects])

  // Ensure at least one project exists
  useEffect(() => {
    if (projects.length === 0) {
      const defaultProject = {
        id: Date.now().toString(),
        name: "New Chat",
        createdAt: Date.now()
      }
      setProjects([defaultProject])
      setActiveProjectId(defaultProject.id)
    } else if (!activeProjectId) {
      setActiveProjectId(projects[0].id)
    }
  }, [projects, activeProjectId])

  // 3. Persist Active Project ID
  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem("startup_mania_active_project", activeProjectId)
    }
  }, [activeProjectId])

  // 4. Load Chat Histories when active project changes
  useEffect(() => {
    if (activeProjectId) {
      const storedChats = localStorage.getItem(`startup_mania_chats_${activeProjectId}`)
      if (storedChats) {
        try {
          const parsed = JSON.parse(storedChats)
          if (parsed.length < 6) {
             setChatHistories([...parsed, ...Array(6 - parsed.length).fill([])])
          } else {
             setChatHistories(parsed)
          }
        } catch (e) {
          console.error("Failed to load chats for project", activeProjectId, e)
          setChatHistories([[], [], [], [], [], []])
        }
      } else {
        setChatHistories([[], [], [], [], [], []])
      }
      // Update the sync ref AFTER setting the state
      lastLoadedProjectId.current = activeProjectId
    } else {
      setChatHistories([[], [], [], [], [], []])
      lastLoadedProjectId.current = null
    }
  }, [activeProjectId])

  // 5. Persist Chat Histories whenever they change (triggered by AI output)
  useEffect(() => {
    // CRITICAL: Only save if the project in state matches the one we intended to load
    // This prevents the old project's state from overwriting the new project's key during the transition
    if (activeProjectId && activeProjectId === lastLoadedProjectId.current) {
      localStorage.setItem(`startup_mania_chats_${activeProjectId}`, JSON.stringify(chatHistories))
    }
  }, [chatHistories, activeProjectId])

  const handleNewProject = useCallback(() => {
    const newProject = {
      id: Date.now().toString(),
      name: "New Project",
      createdAt: Date.now()
    }
    setProjects(prev => [newProject, ...prev])
    setActiveProjectId(newProject.id)
  }, [])

  const handleRenameProject = useCallback((id: string, newName: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p))
  }, [])

  const handleDeleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    localStorage.removeItem(`startup_mania_chats_${id}`)
    if (activeProjectId === id) {
      setActiveProjectId(null)
    }
  }, [activeProjectId])

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

  const pendingUpdates = useRef<{ [key: string]: string }>({});
  const updateTimer = useRef<NodeJS.Timeout | null>(null);

  const flushUpdates = useCallback(() => {
    const updates = { ...pendingUpdates.current };
    if (Object.keys(updates).length === 0) return;

    // Clear the pending updates immediately so new chunks can be buffered
    pendingUpdates.current = {};

    setChatHistories(prev => {
      const next = [...prev];
      let hasChanged = false;

      Object.entries(updates).forEach(([aiMessageId, chunk]) => {
        // Find which agent this message belongs to
        const agentIdx = next.findIndex(history => history.some(msg => msg.id === aiMessageId));
        if (agentIdx !== -1) {
          const history = [...next[agentIdx]];
          const msgIdx = history.findIndex(msg => msg.id === aiMessageId);
          if (msgIdx !== -1) {
            history[msgIdx] = {
              ...history[msgIdx],
              content: history[msgIdx].content + chunk
            };
            next[agentIdx] = history;
            hasChanged = true;
          }
        }
      });

      if (hasChanged) {
        return next;
      }
      return prev;
    });
  }, []);

  const activeStreams = useRef(0);

  const handleSend = useCallback((text: string, images?: { mimeType: string; data: string }[]) => {
    const trimmedText = text.trim();
    if (!trimmedText && (!images || images.length === 0)) return;

    // Reset stop signal for new generation
    stopSignalRef.current = false;
    setIsGenerating(true);

    // CONSISTENT USAGE TRACKING: Exactly one request per user message
    // regardless of whether one agent, all agents, or DeepReason is active.
    const storedUsage = localStorage.getItem("startup_mania_usage");
    const currentUsed = storedUsage ? parseInt(storedUsage, 10) : 0;
    localStorage.setItem("startup_mania_usage", (currentUsed + 1).toString());

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedText,
      images: images
    };

    const newAiMessageIds: string[] = [];

    // Pre-generate the message IDs synchronously so they are available for the streams
    if (isDeepReasonMode) {
      newAiMessageIds[5] = (Date.now() + 6).toString();
    } else {
      activeAgents.forEach((isActive, idx) => {
        if (isActive) {
          newAiMessageIds[idx] = (Date.now() + idx + 1).toString();
        }
      });
    }

    // 1. Pure state update - NO SIDE EFFECTS inside
    setChatHistories(prev => {
      const next = [...prev];
      if (isDeepReasonMode) {
        next[5] = [
          ...next[5],
          userMessage,
          { id: (Date.now() + 6).toString(), role: "assistant", content: "" }
        ];
      } else {
        activeAgents.forEach((isActive, idx) => {
          if (isActive) {
            next[idx] = [
              ...next[idx],
              userMessage,
              { id: newAiMessageIds[idx], role: "assistant", content: "" }
            ];
          }
        });
      }
      return next;
    });

    // 2. Launch side effects (API streams) outside the React state cycle
    if (isDeepReasonMode) {
      activeStreams.current++;
      generateAgentResponse("DeepReason", trimmedText, (chunk) => {
        pendingUpdates.current[newAiMessageIds[5]] = (pendingUpdates.current[newAiMessageIds[5]] || "") + chunk;
        if (!updateTimer.current) {
          updateTimer.current = setInterval(flushUpdates, 120);
        }
      }, images, () => stopSignalRef.current).catch(err => {
        console.error(`Failed to generate for DeepReason`, err);
      }).finally(() => {
        activeStreams.current--;
        if (activeStreams.current === 0) {
          setIsGenerating(false);
          flushUpdates();
          if (updateTimer.current) {
            clearInterval(updateTimer.current);
            updateTimer.current = null;
          }
        }
      });
    } else {
      activeAgents.forEach((isActive, idx) => {
        if (isActive && newAiMessageIds[idx]) {
          activeStreams.current++;
          generateAgentResponse(agentNames[idx], trimmedText, (chunk) => {
            pendingUpdates.current[newAiMessageIds[idx]] = (pendingUpdates.current[newAiMessageIds[idx]] || "") + chunk;

            if (!updateTimer.current) {
              updateTimer.current = setInterval(flushUpdates, 120); // Optimized update rate
            }
          }, images, () => stopSignalRef.current).catch(err => {
            console.error(`Failed to generate for ${agentNames[idx]}`, err);
          }).finally(() => {
            activeStreams.current--;
            if (activeStreams.current === 0) {
              setIsGenerating(false);
              flushUpdates();
              if (updateTimer.current) {
                clearInterval(updateTimer.current);
                updateTimer.current = null;
              }
            }
          });
        }
      });
    }
  }, [activeAgents, agentNames, flushUpdates, isDeepReasonMode]);

  const handleStop = useCallback(() => {
    stopSignalRef.current = true;
    setIsGenerating(false);
  }, []);

  useEffect(() => {
    return () => {
      if (updateTimer.current) clearInterval(updateTimer.current);
    };
  }, []);

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
    if (initialPromptProcessed.current) return;

    const params = new URLSearchParams(window.location.search);
    const initialPrompt = params.get("prompt");
    if (initialPrompt) {
      initialPromptProcessed.current = true;
      
      // Check for pending images from landing page
      const pendingImagesStr = localStorage.getItem("pending_images");
      let pendingImages: { mimeType: string; data: string }[] | undefined = undefined;
      if (pendingImagesStr) {
        try {
          pendingImages = JSON.parse(pendingImagesStr);
          localStorage.removeItem("pending_images");
        } catch (e) {
          console.error("Failed to parse pending images", e);
        }
      }

      // Small delay to ensure everything is mounted and ready
      const timer = setTimeout(() => {
        handleSend(decodeURIComponent(initialPrompt), pendingImages);
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
    return <div className="h-screen bg-[#0a0a0a]" />
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <ShaderAnimation blur={true} />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="relative z-10 flex h-screen w-full flex-col gap-1 p-1 overflow-hidden">
        <div
          ref={menuRef}
          className="relative z-20 h-16 rounded-[12px] border border-white/10 bg-[#0d0d0d]/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
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
                    Pixora
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center text-white/70 transition-transform duration-300 group-hover:translate-y-[1px]">
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>

                <div
                  role="menu"
                  aria-hidden={!isMenuOpen}
                  className={`absolute left-0 top-[calc(100%+0.6rem)] z-20 w-[176px] overflow-hidden rounded-[14px] border border-white/10 bg-[#0d0d0d]/95 p-1 shadow-[0_14px_36px_rgba(0,0,0,0.38)] transition-all duration-300 ease-out ${isMenuOpen
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

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setExportGuideTab("figma");
                  setShowExportGuide(true);
                }}
                className="group flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-95"
              >
                <FigmaIconHeader />
                <span className="text-xs font-bold text-white/60 transition-colors group-hover:text-white">To Figma</span>
              </button>
              <button
                onClick={() => {
                  setExportGuideTab("framer");
                  setShowExportGuide(true);
                }}
                className="group flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-95"
              >
                <FramerIconHeader />
                <span className="text-xs font-bold text-white/60 transition-colors group-hover:text-white">To Framer</span>
              </button>
            </div>
          </div>
        </div>

        <div className={`flex flex-1 flex-col lg:flex-row overflow-hidden transition-[gap] duration-300 ${isCollapsed ? "gap-0" : "gap-1 lg:gap-0"}`}>
          <aside
            style={{
              width: isCollapsed ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${sidebarWidth}px` : '100%')
            }}
            className={`will-change-[width,opacity] [contain:layout_paint] ease-in-out overflow-hidden rounded-[12px] border border-white/10 bg-[#0d0d0d]/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${isCollapsed ? "opacity-0" : "opacity-100"} ${isResizing ? "" : "transition-[width,opacity] duration-300"}`}
          >
            <SidebarContent
              onOpenSettings={() => setShowSettings(true)}
              projects={projects}
              activeProjectId={activeProjectId}
              onProjectSelect={setActiveProjectId}
              onNewProject={handleNewProject}
              onRenameProject={handleRenameProject}
              onDeleteProject={handleDeleteProject}
            />
          </aside>

          {!isCollapsed && (
            <div
              onPointerDown={startResizing}
              className={`group relative z-30 w-1 cursor-col-resize transition-all duration-300 hover:w-2 hidden lg:block ${isResizing ? "w-2" : ""}`}
            >
              <div className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-all duration-300 group-hover:bg-white/30 ${isResizing ? "bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "bg-transparent"}`} />
            </div>
          )}

          <main className="flex-1 flex flex-col [contain:layout_paint] rounded-[12px] border border-white/10 bg-[#0d0d0d]/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden relative">
            <div className="flex flex-1 overflow-x-auto divide-x divide-white/10 custom-scrollbar pb-24">
              {isDeepReasonMode ? (
                <DeepReasonView messages={chatHistories[5] || []} />
              ) : (
                activeAgents.map((isActive, index) => (
                  <AgentColumn
                    key={index}
                    name={agentNames[index]}
                    index={index}
                    isActive={isActive}
                    onToggle={toggleAgent}
                    messages={chatHistories[index]}
                  />
                ))
              )}
            </div>
          </main>
        </div>

        {/* Fixed Center Input - Moved outside of the main/sidebar flex container */}
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[40] w-full max-w-[800px] px-4 pointer-events-none">
          <div className="relative pointer-events-auto">
            {/* Ambient Gradient behind input */}
            <div className="absolute -inset-x-20 -top-20 -bottom-10 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent blur-2xl pointer-events-none" />
            <ChatInput 
              onSend={handleSend} 
              isGenerating={isGenerating}
              onStop={handleStop}
              isDeepReasonMode={isDeepReasonMode}
              onToggleDeepReason={() => setIsDeepReasonMode(!isDeepReasonMode)}
            />
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <ExportGuideModal
        isOpen={showExportGuide}
        onClose={() => setShowExportGuide(false)}
        initialTab={exportGuideTab}
      />

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
