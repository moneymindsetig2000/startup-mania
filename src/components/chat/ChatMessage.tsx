import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  name?: string;
}

export function ChatMessage({ role, content, name }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "flex w-full flex-col gap-1.5",
        isUser ? "items-end" : "items-start"
      )}
    >
      {!isUser && name && (
        <span className="px-1 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/30">
          {name}
        </span>
      )}
      <div
        className={cn(
          "max-w-[90%] rounded-2xl px-4 py-3 text-[0.85rem] leading-relaxed transition-all duration-300",
          isUser
            ? "bg-white/10 text-white border border-white/10 shadow-[0_4px_12px_rgba(255,255,255,0.02)] rounded-tr-sm"
            : "bg-[#121212]/60 text-white/90 border border-white/5 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.2)] rounded-tl-sm"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      {isUser && (
        <span className="px-1 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/20">
          Sent
        </span>
      )}
    </motion.div>
  );
}
