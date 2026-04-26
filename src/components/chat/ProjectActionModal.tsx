import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Edit3, Trash2 } from "lucide-react";

interface ProjectActionModalProps {
  isOpen: boolean;
  type: "rename" | "delete";
  projectName: string;
  onClose: () => void;
  onConfirm: (newName?: string) => void;
}

export function ProjectActionModal({ isOpen, type, projectName, onClose, onConfirm }: ProjectActionModalProps) {
  const [name, setName] = useState(projectName);

  useEffect(() => {
    setName(projectName);
  }, [projectName, isOpen]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-white/10 bg-[#0d0d0d] shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  type === 'delete' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/60'
                }`}>
                  {type === 'delete' ? <Trash2 className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  {type === 'rename' ? 'Rename Project' : 'Delete Project'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 text-white/20 hover:text-white/80 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {type === 'rename' ? (
                <div className="space-y-2">
                  <label className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/30 ml-1">New Project Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onConfirm(name)}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all"
                    placeholder="Enter project name..."
                  />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-200/60 leading-relaxed font-medium">
                      This action is permanent. All history and data within <span className="text-red-400 font-bold">"{projectName}"</span> will be lost forever.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(type === 'rename' ? name : undefined)}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    type === 'delete' 
                      ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:bg-red-600' 
                      : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02]'
                  }`}
                >
                  {type === 'rename' ? 'Save Changes' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
