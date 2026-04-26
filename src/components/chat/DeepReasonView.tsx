import { memo, useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { type Message } from "./AgentColumn";
import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

interface DeepReasonViewProps {
  messages: Message[];
}

export const DeepReasonView = memo(function DeepReasonView({ messages }: DeepReasonViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    requestAnimationFrame(() => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 150;
      
      if (isAtBottom) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col relative bg-[#0a0a0a]/40 backdrop-blur-sm">
      {/* Premium Header for DeepReason */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full animate-pulse" />
            <Brain className="h-5 w-5 text-blue-400 relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-[0.7rem] font-black text-white uppercase tracking-[0.2em]">Deep Reason Mode</span>
            <span className="text-[0.55rem] text-white/30 font-medium uppercase tracking-widest">Enhanced Intelligence Agent</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10">
            <Sparkles className="h-3 w-3 text-blue-400" />
            <span className="text-[0.6rem] font-bold text-blue-300/80 uppercase tracking-wider">Active</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 pt-8 pb-40 flex flex-col gap-6 scroll-smooth max-w-4xl mx-auto w-full"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center px-4">
            <div className="mb-6 relative">
               <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
               <Brain className="h-16 w-16 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">DeepReason Intelligence</h3>
            <p className="max-w-md text-sm text-white/60 leading-relaxed">
              Experience our most advanced reasoning model. Optimized for complex problem solving, architecture design, and deep technical analysis.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              role={msg.role} 
              content={msg.content} 
              name="DeepReason"
              images={msg.images}
            />
          ))
        )}
      </div>

      {/* Subtle bottom gradient to fade out messages behind input */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </div>
  );
});
