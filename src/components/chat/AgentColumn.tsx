import { memo, useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";

export interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  images?: { mimeType: string; data: string }[];
}

interface AgentColumnProps {
  name: string;
  isActive: boolean;
  index: number;
  onToggle: (index: number) => void;
  messages: Message[];
}

export const AgentColumn = memo(function AgentColumn({ name, isActive, index, onToggle, messages }: AgentColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    requestAnimationFrame(() => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
      
      if (isAtBottom) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });
  }, [messages]);

  return (
    <div 
      className={`flex-1 min-w-[350px] flex flex-col relative group transition-[filter] duration-500 ${
        !isActive ? "brightness-[0.4] grayscale-[0.2]" : "brightness-100"
      }`}
    >
      <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 bg-white/[0.02]">
        <span className="text-[0.6rem] font-black text-white/40 uppercase tracking-widest">{name}</span>
        <button
          type="button"
          onClick={() => onToggle(index)}
          className={`relative flex h-3.5 w-7 items-center rounded-full transition-all duration-300 ${
            isActive ? "bg-white/20" : "bg-white/5"
          }`}
        >
          <div
            className={`h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300 ${
              isActive ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-3 pt-3 pb-36 flex flex-col gap-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            role={msg.role} 
            content={msg.content} 
            name={name}
            images={msg.images}
          />
        ))}
      </div>
    </div>
  );
});

