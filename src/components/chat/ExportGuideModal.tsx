import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const FigmaIcon = () => (
  <svg width="18" height="26" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 28.5C19 25.9834 20.0009 23.5699 21.7825 21.7883C23.5641 20.0067 25.9775 19 28.5 19C31.0225 19 33.4359 20.0067 35.2175 21.7883C36.9991 23.5699 38 25.9834 38 28.5C38 31.0166 36.9991 33.4301 35.2175 35.2117C33.4359 36.9933 31.0225 38 28.5 38C25.9775 38 23.5641 36.9933 21.7825 35.2117C20.0009 33.4301 19 31.0166 19 28.5Z" fill="#1ABCFE"/>
    <path d="M0 47.5C0 44.9834 1.00089 42.5699 2.78249 40.7883C4.56408 39.0067 6.97754 38 9.5 38H19V47.5C19 50.0166 17.9991 52.4301 16.2175 54.2117C14.4359 55.9933 12.0225 57 9.5 57C6.97754 57 4.56408 55.9933 2.78249 54.2117C1.00089 52.4301 0 50.0166 0 47.5Z" fill="#0AC17D"/>
    <path d="M0 28.5C0 25.9834 1.00089 23.5699 2.78249 21.7883C4.56408 20.0067 6.97754 19 9.5 19H19V38H9.5C6.97754 38 4.56408 36.9933 2.78249 35.2117C20.0009 33.4301 0 31.0166 0 28.5Z" fill="#A259FF"/>
    <path d="M0 9.5C0 6.98342 1.00089 4.56994 2.78249 2.78835C4.56408 1.00676 6.97754 0 9.5 0H19V19H9.5C6.97754 19 4.56408 17.9932 2.78249 16.2117C1.00089 14.4301 0 12.0166 0 9.5Z" fill="#F24E1E"/>
    <path d="M19 0H28.5C31.0225 0 33.4359 1.00676 35.2175 2.78835C36.9991 4.56994 38 6.98342 38 9.5C38 12.0166 36.9991 14.4301 35.2175 16.2117C33.4359 17.9932 31.0225 19 28.5 19H19V0Z" fill="#FF7262"/>
  </svg>
);

const FramerIcon = () => (
  <svg width="18" height="26" viewBox="0 0 14 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H14V7H7L0 0Z" fill="white"/>
    <path d="M0 7H14V14H0V7Z" fill="white"/>
    <path d="M0 14H7V21L0 14Z" fill="white"/>
  </svg>
);

interface ExportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "figma" | "framer";
}

export function ExportGuideModal({ isOpen, onClose, initialTab = "figma" }: ExportGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"figma" | "framer">(initialTab);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  
  // Sync tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFeedback(null);
    }
  }, [isOpen, initialTab]);

  const steps = {
    figma: [
      { title: "Step 1: Copy the Code", desc: "Locate the HTML code block in the chat window. Click the 'Copy' button in the top right corner of the block to copy the raw HTML and CSS." },
      { title: "Step 2: Install the Figma Plugin", desc: "Open Figma (web or desktop) and create a new design file. Click the 'Resources' icon (the square with a plus) in the top toolbar. Go to the 'Plugins' tab, search for 'html.to.design', and click 'Run'." },
      { title: "Step 3: Paste into the Plugin", desc: "Once the plugin window opens on your screen, look for the 'HTML' tab at the top. Click inside the large text box and press Ctrl+V (or Cmd+V on Mac) to paste the code you just copied." },
      { title: "Step 4: Generate Your Design", desc: "Click the 'Create' or 'Import' button at the bottom of the plugin. Wait a few seconds, and the plugin will magically convert the code into fully editable Figma frames, texts, and auto-layouts!" },
    ],
    framer: [
      { title: "Step 1: Download & Open", desc: "Click the 'Download' button on the HTML code block in this chat to save 'design.html' to your computer. Double-click this file so it opens in your Google Chrome browser." },
      { title: "Step 2: Get the Framer Extension", desc: "Open the Chrome Web Store and search for the official 'HTML to Framer' extension. Click 'Add to Chrome' to install it to your browser." },
      { title: "Step 3: Capture the Design", desc: "Go back to the browser tab where your 'design.html' file is open. Click the Framer extension icon in your Chrome toolbar. Hover over the design on the page and click it to copy the layout to your clipboard." },
      { title: "Step 4: Paste into Framer", desc: "Open your project in Framer. Click anywhere on your canvas and press Ctrl+V (or Cmd+V on Mac). Framer will automatically reconstruct the webpage into editable frames and stacks!" },
    ]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md will-change-[opacity]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0d0d0d] shadow-[0_32px_128px_rgba(0,0,0,0.8)] will-change-[opacity,transform]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                  <Copy className="h-5 w-5 text-white/70" />
                </span>
                Export to Design Tool
              </h2>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-6 pb-2">
              <button
                onClick={() => setActiveTab("figma")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-3 rounded-2xl border px-4 py-4 transition-all duration-300",
                  activeTab === "figma" 
                    ? "border-blue-500/30 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                    : "border-white/5 bg-transparent hover:bg-white/5"
                )}
              >
                <FigmaIcon />
                <span className={cn("font-bold", activeTab === "figma" ? "text-white" : "text-white/50")}>Figma Guide</span>
              </button>
              <button
                onClick={() => setActiveTab("framer")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-3 rounded-2xl border px-4 py-4 transition-all duration-300",
                  activeTab === "framer" 
                    ? "border-white/30 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                    : "border-white/5 bg-transparent hover:bg-white/5"
                )}
              >
                <FramerIcon />
                <span className={cn("font-bold", activeTab === "framer" ? "text-white" : "text-white/50")}>Framer Guide</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="relative rounded-3xl border border-white/5 bg-white/[0.02] p-8">
                <div className="space-y-8">
                  {steps[activeTab].map((step, idx) => (
                    <motion.div 
                      key={idx + activeTab} // forces re-animation on tab change
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 will-change-[opacity,transform]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white mb-1">{step.title}</h4>
                        <p className="text-sm font-medium text-white/50 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Feedback Section */}
              <div className="mt-8 flex items-center justify-between rounded-2xl bg-white/5 px-6 py-4">
                <div className="text-sm font-medium text-white/70">
                  Did this guide help you export your design?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFeedback("like")}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                      feedback === "like" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setFeedback("dislike")}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                      feedback === "dislike" 
                        ? "bg-red-500/20 text-red-400" 
                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
