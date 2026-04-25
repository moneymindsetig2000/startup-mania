"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Layout,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    Sparkles,
    Loader2
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // Track pending rAF handle so we never queue more than one reflow per frame.
    const rafRef = useRef<number>(0);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                // Synchronous reset is fine — it's a single write, no read.
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Cancel any pending adjustment from a previous keystroke.
            cancelAnimationFrame(rafRef.current);

            // Defer the read (scrollHeight) + write (height) pair to the next
            // animation frame. This breaks the layout-thrash cycle: the browser
            // has already committed the current frame's paint before we touch
            // the DOM, so there is zero forced synchronous reflow.
            rafRef.current = requestAnimationFrame(() => {
                const ta = textareaRef.current;
                if (!ta) return;
                ta.style.height = `${minHeight}px`;
                const newHeight = Math.max(
                    minHeight,
                    Math.min(
                        ta.scrollHeight,
                        maxHeight ?? Number.POSITIVE_INFINITY
                    )
                );
                ta.style.height = `${newHeight}px`;
            });
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height — single write, no reflow.
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Cancel any pending rAF on unmount to prevent memory leaks.
    useEffect(() => {
        const raf = rafRef;
        return () => cancelAnimationFrame(raf.current);
    }, []);

    // Adjust height on window resize (already deferred via rAF inside adjustHeight).
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize, { passive: true });
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

function useTypewriter(prompts: string[], speed = 40, delay = 1500) {
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [promptIndex, setPromptIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);

    // Blinking cursor - isolated from typing logic
    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Typing logic
    useEffect(() => {
        const currentPrompt = prompts[promptIndex];
        
        const timer = setTimeout(() => {
            if (!isDeleting) {
                if (displayText.length < currentPrompt.length) {
                    setDisplayText(currentPrompt.substring(0, displayText.length + 1));
                } else {
                    // Finished typing, wait before deleting
                    setTimeout(() => setIsDeleting(true), delay);
                }
            } else {
                if (displayText.length > 0) {
                    setDisplayText(currentPrompt.substring(0, displayText.length - 1));
                } else {
                    // Finished deleting, move to next prompt
                    setIsDeleting(false);
                    setPromptIndex((prev) => (prev + 1) % prompts.length);
                }
            }
        }, isDeleting ? speed / 2 : speed);

        return () => clearTimeout(timer);
    }, [displayText, isDeleting, promptIndex, prompts, speed, delay]);

    return `${displayText}${showCursor ? "|" : ""}`;
}

export function VercelV0Chat() {
    const prompts = useMemo(() => [
        "Design a landing page for a SaaS startup...",
        "Build a sleek dashboard UI with dark mode...",
        "Create a modern login form with glassmorphism...",
        "Design a minimalist portfolio for a designer...",
        "Build a beautiful pricing section with toggle...",
        "Create a responsive navigation bar with blur...",
        "Design a high-converting hero section...",
        "What can I help you design today?"
    ], []);
    
    const placeholderText = useTypewriter(prompts, 40, 1500);
    const [value, setValue] = useState("");
    const [isEnhancing, setIsEnhancing] = useState(false);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session) {
                    window.location.href = `/chat?prompt=${encodeURIComponent(value.trim())}`;
                } else {
                    // Save to local storage and redirect to auth
                    localStorage.setItem("pending_prompt", value.trim());
                    window.location.href = "/auth";
                }
            }
        }
    };

    const handleSend = async () => {
        if (value.trim()) {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                window.location.href = `/chat?prompt=${encodeURIComponent(value.trim())}`;
            } else {
                // Save to local storage and redirect to auth
                localStorage.setItem("pending_prompt", value.trim());
                window.location.href = "/auth";
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
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
            <h1 className="text-4xl font-bold text-black dark:text-white">
                What can I help you ship?
            </h1>

            <div className="w-full">
                <div className="relative bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={value ? "" : placeholderText}
                            className={cn(
                                "w-full px-4 py-3",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-white text-sm",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-neutral-500 placeholder:text-sm",
                                "min-h-[60px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="group p-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Paperclip className="w-4 h-4 text-white" />
                                <span className="text-xs text-zinc-400 hidden group-hover:inline transition-opacity">
                                    Attach
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleEnhance}
                                disabled={!value.trim() || isEnhancing}
                                className={cn(
                                    "px-2 py-1 rounded-lg text-sm transition-all border flex items-center justify-between gap-1.5",
                                    value.trim() && !isEnhancing
                                        ? "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                        : "border-zinc-800 text-zinc-600 cursor-not-allowed"
                                )}
                            >
                                {isEnhancing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4" />
                                )}
                                <span className="text-xs">Enhance</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSend}
                                className={cn(
                                    "px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1",
                                    value.trim()
                                        ? "bg-white text-black"
                                        : "text-zinc-400"
                                )}
                            >
                                <ArrowUpIcon
                                    className={cn(
                                        "w-4 h-4",
                                        value.trim()
                                            ? "text-black"
                                            : "text-zinc-400"
                                    )}
                                />
                                <span className="sr-only">Send</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-4">
                    <ActionButton
                        icon={<ImageIcon className="w-4 h-4" />}
                        label="Clone a Screenshot"
                    />
                    <ActionButton
                        icon={<Layout className="w-4 h-4" />}
                        label="Import from Figma"
                    />
                    <ActionButton
                        icon={<FileUp className="w-4 h-4" />}
                        label="Upload a Project"
                    />
                    <ActionButton
                        icon={<MonitorIcon className="w-4 h-4" />}
                        label="Landing Page"
                    />
                    <ActionButton
                        icon={<CircleUserRound className="w-4 h-4" />}
                        label="Sign Up Form"
                    />
                </div>
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    return (
        <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
}
