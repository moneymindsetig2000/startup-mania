import { memo, useMemo, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CodePreviewModal } from "./CodePreviewModal";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  name?: string;
  images?: { mimeType: string; data: string }[];
}

// Move plugins outside to avoid re-creation on every render
const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeRaw];

const CodeBlock = memo(function CodeBlock({ language, children }: { language: string, children: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isHtml = language.toLowerCase() === "html" || language.toLowerCase() === "html5";

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      requestAnimationFrame(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      });
    }
  }, [children]);

  return (
    <>
    <div className="my-4 overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-inner">
      <div className="flex items-center justify-between bg-white/5 px-4 py-1.5 border-b border-white/10">
        <span className="text-[0.6rem] font-bold uppercase tracking-wider text-white/40">{language}</span>
        <div className="flex items-center gap-3">
          {isHtml && (
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-blue-400/80 hover:text-blue-300 transition-colors"
              title="Live Preview"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Preview
            </button>
          )}
          <button 
            onClick={() => navigator.clipboard.writeText(children)}
            className="text-[0.6rem] font-bold uppercase tracking-wider text-white/20 hover:text-white/60 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
      <div 
        ref={scrollRef} 
        className="max-h-[400px] overflow-y-auto custom-scrollbar scroll-smooth"
      >
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.75rem",
          }}
        >
          {children.replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    </div>
    
    {isHtml && (
      <CodePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        htmlContent={children}
      />
    )}
    </>
  );
});

export const ChatMessage = memo(function ChatMessage({ role, content, name, images }: ChatMessageProps) {
  const isUser = role === "user";
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract all thought content and join them
  const thoughtMatches = Array.from(content.matchAll(/<(thought|though)>([\s\S]*?)(?:<\/\1>|$)/gi));
  const thought = thoughtMatches.length > 0 ? thoughtMatches.map(m => m[2]).join("\n") : null;
  const mainContent = content.replace(/<(thought|though)>[\s\S]*?(?:<\/\1>|$)/gi, "").trim();

  // Throttled display content for heavy streaming
  const [throttledContent, setThrottledContent] = useState(mainContent);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    // If enough time has passed, update immediately
    if (now - lastUpdateRef.current > 400) {
      setThrottledContent(mainContent);
      lastUpdateRef.current = now;
    } else {
      // Otherwise, set a timeout to catch the end of the stream
      const timer = setTimeout(() => {
        setThrottledContent(mainContent);
        lastUpdateRef.current = Date.now();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [mainContent]);

  const handleCopy = () => {
    if (!mainContent) return;
    navigator.clipboard.writeText(mainContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Pre-process content only when needed and on throttled content
  const processedMainContent = useMemo(() => {
    if (!throttledContent.includes("==")) return throttledContent;
    return throttledContent.replace(/==([^=]+)==/g, "<mark>$1</mark>");
  }, [throttledContent]);

  const components = useMemo(() => ({
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const isBlock = !inline;
      
      if (isBlock) {
        return <CodeBlock language={match ? match[1] : "text"}>{String(children)}</CodeBlock>;
      }

      return (
        <code
          className={cn(
            "rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.75rem] text-white/90",
            className
          )}
          {...props}
        >
          {children}
        </code>
      );
    },
    p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
    ul: ({ children }: any) => <ul className="mb-4 ml-4 list-disc space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="mb-4 ml-4 list-decimal space-y-1">{children}</ol>,
    li: ({ children }: any) => <li className="text-white/80">{children}</li>,
    a: ({ children, href }: any) => (
      <a
        href={href}
        className="text-blue-400 underline decoration-blue-400/30 transition-colors hover:text-blue-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-2 border-white/20 pl-4 italic text-white/60 my-2">
        {children}
      </blockquote>
    ),
    h1: ({ children }: any) => <h1 className="mb-4 text-xl font-bold text-white mt-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="mb-3 text-lg font-bold text-white mt-4">{children}</h2>,
    h3: ({ children }: any) => <h3 className="mb-2 text-base font-bold text-white mt-3">{children}</h3>,
    table: ({ children }: any) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full border-collapse text-left text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-white/5">{children}</thead>,
    th: ({ children }: any) => <th className="border-b border-white/10 px-4 py-2 font-bold">{children}</th>,
    td: ({ children }: any) => <td className="border-b border-white/5 px-4 py-2 text-white/70">{children}</td>,
    mark: ({ children }: any) => (
      <mark className="bg-white/20 text-white px-1 py-0.5 rounded text-inherit">
        {children}
      </mark>
    ),
  }), []);

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
      
      {/* Thought / Thinking Box with Collapsible Toggle */}
      {thought && (
        <div className="max-w-[85%] mb-1">
          <button
            type="button"
            onClick={() => setIsThoughtOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-1 py-1 text-[0.7rem] font-semibold text-blue-300/60 hover:text-blue-300/90 transition-colors duration-200 select-none"
          >
            <span
              className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{ transform: isThoughtOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              ›
            </span>
            <span className="tracking-wide">Thinking</span>
          </button>

          <div
            className="overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              maxHeight: isThoughtOpen ? "220px" : "0px",
              opacity: isThoughtOpen ? 1 : 0,
            }}
          >
            <div className="mt-1 bg-white/[0.03] rounded-xl px-4 py-3 border border-transparent">
              <div className="max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                <pre className="text-[0.75rem] leading-relaxed text-blue-300/60 italic select-none whitespace-pre-wrap font-sans break-words">
                  {thought}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Message Content */}
      {(processedMainContent || isUser || (images && images.length > 0)) && (
        <div
          className={cn(
            "max-w-[90%] rounded-2xl px-4 py-3 text-[0.85rem] leading-relaxed transition-all duration-300",
            isUser
              ? "bg-white/10 text-white border border-white/10 shadow-[0_4px_12px_rgba(255,255,255,0.02)] rounded-tr-sm"
              : "bg-[#121212]/60 text-white/90 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.2)] rounded-tl-sm"
          )}
        >
          {images && images.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group/img overflow-hidden rounded-lg border border-white/10 bg-black/20">
                   <img 
                    src={`data:${img.mimeType};base64,${img.data}`} 
                    alt={`Attachment ${i}`}
                    className="max-h-[200px] w-auto object-contain transition-transform duration-500 group-hover/img:scale-105"
                   />
                </div>
              ))}
            </div>
          )}
          {processedMainContent ? (
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
              components={components}
            >
              {processedMainContent}
            </ReactMarkdown>
          ) : isUser && !images?.length ? (
            <span className="text-white/40 italic">Empty message</span>
          ) : null}
        </div>
      )}

      {/* Copy Button & Decorative Line */}
      {!isUser && mainContent && (
        <div className="flex items-center w-[90%] gap-3 mt-1.5 px-1 group/copy-container">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent transition-opacity duration-300" />
          <button
            onClick={handleCopy}
            className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] text-white/40 hover:bg-white/10 hover:text-white/80 transition-all duration-200"
            title="Copy message"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.svg
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-3.5 w-3.5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="copy"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}

      {isUser && (
        <span className="px-1 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/20">
          Sent
        </span>
      )}
    </motion.div>
  );
});
