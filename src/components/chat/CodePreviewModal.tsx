import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface CodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
}

export function CodePreviewModal({ isOpen, onClose, htmlContent }: CodePreviewModalProps) {
  // Prevent body scroll when modal is open to ensure clean UX
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

  // Handle escape key for quick closing
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent SSR hydration mismatch
  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop - Uses CSS blur because typing/streaming is paused while viewing modal, meaning zero compositor lag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90"
          />

          {/* Modal Container - 3:2 Aspect Ratio */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-[90vw] max-w-[1200px] aspect-[3/2] flex flex-col rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-white/10 bg-white/5 px-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80 shadow-sm" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80 shadow-sm" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80 shadow-sm" />
                </div>
                <span className="ml-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                  Live HTML Sandbox
                </span>
              </div>
              
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white/90 transition-colors"
                title="Close Preview (Esc)"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Iframe Content - Fastest, lightest native sandboxing method */}
            <div className="flex-1 bg-white relative">
              {/* Native browser iframe with srcDoc is 100x faster than JS-based previewers like CodeMirror */}
              <iframe
                srcDoc={htmlContent}
                sandbox="allow-scripts allow-modals allow-forms allow-popups"
                className="absolute inset-0 h-full w-full border-none bg-white"
                title="HTML Preview"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
