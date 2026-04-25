import { memo } from "react"
import { Plus, Search, Settings } from "lucide-react"

export const SidebarContent = memo(function SidebarContent() {
  return (
    <div className="flex h-full flex-col p-2 min-w-[200px] [contain:content]">
      {/* New Project Button */}
      <button className="group flex items-center justify-between w-full p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 active:scale-[0.98]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-[0.82rem] font-bold tracking-tight text-white/90">New Project</span>
        </div>
        <div className="flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-white/5">
          <span className="text-[0.65rem] font-medium text-white/40">N</span>
        </div>
      </button>

      {/* Search Bar */}
      <div className="mt-3 relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 group-focus-within:text-white/60 transition-colors" />
        <input 
          type="text" 
          placeholder="Search projects..." 
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/[0.02] border border-white/5 text-[0.8rem] text-white/70 placeholder:text-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-white/10 transition-all duration-300"
        />
      </div>

      {/* Navigation / Content Area */}
      <div className="flex-1 mt-6 overflow-y-auto custom-scrollbar px-1">
        <div className="flex flex-col gap-1">
          <div className="px-2 mb-2">
            <span className="text-[0.6rem] font-black text-white/20 uppercase tracking-[0.2em]">Recent Activity</span>
          </div>
          {/* Empty State placeholder */}
          <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-white/5 bg-white/[0.01]">
            <span className="text-[0.7rem] text-white/20 font-medium text-center italic">No recent projects to show</span>
          </div>
        </div>
      </div>

      {/* Settings Section (Bottom) */}
      <div className="mt-auto pt-2 border-t border-white/5">
        <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
            <Settings className="h-4 w-4" />
          </div>
          <span className="text-[0.82rem] font-semibold tracking-tight">Settings</span>
        </button>
      </div>
    </div>
  )
})
