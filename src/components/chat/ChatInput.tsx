import { useRef, useCallback, useState, useEffect, memo } from "react";
import { Paperclip, ArrowUp, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend?: (value: string) => void;
}

export const ChatInput = memo(function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend?.(value);
        setValue("");
      }
    }
  };

  const handleEnhance = async () => {
    if (!value.trim() || isEnhancing) return;
    setIsEnhancing(true);
    // Mocking AI enhancement delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setValue(prev => `Act as a senior startup consultant and ${prev}. Focus on scalability, market positioning, and technical feasibility. Provide a structured execution roadmap.`);
    setIsEnhancing(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
      <div className="relative flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:border-white/20 focus-within:shadow-[0_8px_32px_rgba(255,255,255,0.05)]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything or type '/' for commands..."
          className="w-full resize-none bg-transparent px-5 py-4 text-[0.9rem] text-white placeholder:text-white/30 focus:outline-none min-h-[60px]"
          rows={1}
        />
        
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1.5">
            <button className="group flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-white/5">
              <Paperclip className="h-4 w-4 text-white/40 group-hover:text-white" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
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
                if (value.trim()) {
                  onSend?.(value);
                  setValue("");
                }
              }}
              className={cn(
                "px-1.5 py-1.5 rounded-lg text-sm transition-all duration-300 border flex items-center justify-center",
                value.trim()
                    ? "bg-white border-white text-black shadow-[0_0_12px_rgba(255,255,255,0.3)] hover:scale-105"
                    : "bg-white/5 border-white/10 text-white/20 cursor-not-allowed"
              )}
            >
              <ArrowUp className="h-4 w-4" />
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

