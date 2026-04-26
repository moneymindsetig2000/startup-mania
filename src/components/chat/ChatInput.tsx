import { useRef, useCallback, useState, useEffect, memo } from "react";
import { Paperclip, ArrowUp, Sparkles, Loader2, Brain, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { streamEnhancedPrompt } from "@/lib/gemini";

interface ChatInputProps {
  onSend?: (value: string, images?: { mimeType: string; data: string }[]) => void;
  onStop?: () => void;
  isGenerating?: boolean;
  isDeepReasonMode: boolean;
  onToggleDeepReason: () => void;
}

interface SelectedImage {
  id: string;
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
}

export const ChatInput = memo(function ChatInput({ onSend, onStop, isGenerating, isDeepReasonMode, onToggleDeepReason }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);

  const adjustHeight = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.style.height = "60px";
      const newHeight = Math.max(60, Math.min(textarea.scrollHeight, 200));
      textarea.style.height = `${newHeight}px`;
    });
  }, []);

  useEffect(() => {
    adjustHeight();
    return () => cancelAnimationFrame(rafRef.current);
  }, [adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() || selectedImages.length > 0) {
        onSend?.(value, selectedImages.map(img => ({ mimeType: img.mimeType, data: img.base64 })));
        setValue("");
        setSelectedImages([]);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = await Promise.all(files.map(async (file) => {
      return new Promise<SelectedImage>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: URL.createObjectURL(file),
            base64,
            mimeType: file.type
          });
        };
        reader.readAsDataURL(file);
      });
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    setSelectedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // Clean up URL objects to prevent memory leaks
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const handleEnhance = async () => {
    if (!value.trim() || isEnhancing) return;
    const originalValue = value;
    setIsEnhancing(true);
    setValue(""); // Clear for streaming effect

    try {
      await streamEnhancedPrompt(originalValue, (chunk) => {
        setValue(prev => prev + chunk);
      });
    } catch (err) {
      console.error("Enhancement failed:", err);
      setValue(originalValue);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
      <div className="relative flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#0d0d0d]/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:border-white/20 focus-within:shadow-[0_8px_32px_rgba(255,255,255,0.05)]">
        
        {/* Image Preview Area */}
        <AnimatePresence>
          {selectedImages.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="flex flex-wrap gap-2 px-4 pt-4 overflow-hidden"
            >
              {selectedImages.map((img) => (
                <div key={img.id} className="relative group/thumb h-16 w-16 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  <img src={img.preview} alt="Preview" className="h-full w-full object-cover" />
                  <button 
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything or type '/' for commands..."
          className="w-full resize-none bg-transparent px-5 py-4 text-[0.9rem] text-white placeholder:text-white/30 focus:outline-none min-h-[60px]"
          rows={1}
        />

        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1.5">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
              multiple
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-white/5"
            >
              <Paperclip className="h-4 w-4 text-white/40 group-hover:text-white" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* DeepReason Slider Toggle */}
            <div 
              onClick={onToggleDeepReason}
              className={cn(
                "group relative flex h-8 w-[104px] cursor-pointer items-center rounded-full border transition-all duration-300",
                isDeepReasonMode 
                  ? "border-blue-500/30 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              )}
            >
              <motion.div
                animate={{ x: isDeepReasonMode ? 74 : 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "absolute z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300",
                  isDeepReasonMode 
                    ? "bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]" 
                    : "bg-white/10 text-white/40"
                )}
              >
                <Brain className="h-3.5 w-3.5" />
              </motion.div>

              <div className="flex w-full items-center justify-between px-3 text-[0.6rem] font-bold uppercase tracking-tight select-none">
                <span className={cn(
                  "transition-all duration-300",
                  isDeepReasonMode ? "opacity-100 translate-x-0 text-blue-400" : "opacity-0 -translate-x-2"
                )}>
                  Deep
                </span>
                <span className={cn(
                  "transition-all duration-300",
                  isDeepReasonMode ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0 text-white/20"
                )}>
                  Off
                </span>
              </div>
            </div>

            <button
              onClick={handleEnhance}
              disabled={!value.trim() || isEnhancing}
              className={cn(
                "group flex h-8 items-center gap-2 px-2.5 rounded-lg transition-all",
                value.trim() && !isEnhancing ? "hover:bg-white/5 text-white/40 hover:text-white" : "text-white/10 cursor-not-allowed"
              )}
            >
              {isEnhancing ? (
                <Loader2 className="h-4 w-4 animate-spin text-white/60" />
              ) : (
                <Sparkles className="h-4 w-4 group-hover:text-white transition-colors" />
              )}
              <span className="text-[0.7rem] font-medium tracking-tight">Enhance</span>
            </button>

            <button
              onClick={() => {
                if (isGenerating) {
                  onStop?.();
                  return;
                }
                if (value.trim() || selectedImages.length > 0) {
                  onSend?.(value, selectedImages.map(img => ({ mimeType: img.mimeType, data: img.base64 })));
                  setValue("");
                  setSelectedImages([]);
                }
              }}
              className={cn(
                "px-1.5 py-1.5 rounded-lg text-sm transition-all duration-300 border flex items-center justify-center",
                (value.trim() || selectedImages.length > 0 || isGenerating)
                  ? "bg-white border-white text-black shadow-[0_0_12px_rgba(255,255,255,0.3)] hover:scale-105"
                  : "bg-white/5 border-white/10 text-white/20 cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <div className="h-3 w-3 bg-black rounded-sm" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-center opacity-30">
        <span className="text-[0.65rem] font-medium tracking-[0.05em] text-white">Pixora can make mistakes. Review important info.</span>
      </div>
    </div>
  );
});

