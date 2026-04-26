"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { streamEnhancedPrompt } from "@/lib/gemini";
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
    Loader2,
    X,
    Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        "Landing page for a SaaS startup...",
        "Dashboard for analytics...",
        "Sign up form with validation...",
        "Portfolio for a developer...",
        "Pricing section for SaaS...",
        "Navigation bar for mobile...",
        "Hero section for agency...",
        "What can I help you ship today?"
    ], []);
    
    const placeholderText = useTypewriter(prompts, 40, 1500);
    const [value, setValue] = useState("");
    const [selectedImages, setSelectedImages] = useState<{ id: string; preview: string; base64: string; mimeType: string }[]>([]);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newImages = await Promise.all(files.map(async (file) => {
            return new Promise<{ id: string; preview: string; base64: string; mimeType: string }>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve({
                        id: Math.random().toString(36).substr(2, 9),
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
            const removed = prev.find(img => img.id === id);
            if (removed) URL.revokeObjectURL(removed.preview);
            return filtered;
        });
    };

    const getFullPrompt = () => {
        if (selectedImages.length === 0) return value.trim();
        // For simple redirect, we might just pass the text, but the user wants images
        // Since we are redirecting to /chat?prompt=..., passing full base64 images in URL is bad.
        // We should store them in localStorage temporarily.
        return value.trim();
    };

    const handleSendWithImages = () => {
        if (value.trim() || selectedImages.length > 0) {
            // Save images to localStorage for retrieval in ChatPage
            if (selectedImages.length > 0) {
                localStorage.setItem("pending_images", JSON.stringify(selectedImages.map(img => ({ mimeType: img.mimeType, data: img.base64 }))));
            }
            window.location.href = `/chat?prompt=${encodeURIComponent(value.trim())}`;
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendWithImages();
        }
    };

    const handleSend = async () => {
        handleSendWithImages();
    };

    const handleEnhance = async () => {
        if (!value.trim() || isEnhancing) return;
        const originalValue = value;
        setIsEnhancing(true);
        setValue(""); // Clear for streaming effect
        
        try {
            await streamEnhancedPrompt(originalValue, (chunk) => {
                setValue(prev => prev + chunk);
                adjustHeight();
            });
        } catch (err) {
            console.error("Enhancement failed:", err);
            setValue(originalValue);
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
            <h1 className="text-4xl font-bold text-black dark:text-white">
                What can I help you ship?
            </h1>

            <div className="w-full">
                <div className="relative bg-neutral-900 rounded-xl border border-neutral-800">
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
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*"
                                multiple
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
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
                                    (value.trim() || selectedImages.length > 0)
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
                        icon={<MonitorIcon className="w-4 h-4" />}
                        label="Landing Page"
                        onClick={() => {
                            setValue("Create a high-converting landing page for a SaaS startup with modern aesthetics.");
                            setTimeout(adjustHeight, 0);
                        }}
                    />
                    <ActionButton
                        icon={<Layout className="w-4 h-4" />}
                        label="Dashboard"
                        onClick={() => {
                            setValue("Design a sleek analytics dashboard with dark mode and real-time data visualizations.");
                            setTimeout(adjustHeight, 0);
                        }}
                    />
                    <ActionButton
                        icon={<CircleUserRound className="w-4 h-4" />}
                        label="Sign Up Form"
                        onClick={() => {
                            setValue("Build a modern sign-up form with glassmorphism and client-side validation.");
                            setTimeout(adjustHeight, 0);
                        }}
                    />
                    <ActionButton
                        icon={<ImageIcon className="w-4 h-4" />}
                        label="Portfolio"
                        onClick={() => {
                            setValue("Create a minimalist developer portfolio showcasing projects and skills.");
                            setTimeout(adjustHeight, 0);
                        }}
                    />
                    <ActionButton
                        icon={<FileUp className="w-4 h-4" />}
                        label="Pricing Section"
                        onClick={() => {
                            setValue("Design a beautiful pricing section with three tiers and a monthly/yearly toggle.");
                            setTimeout(adjustHeight, 0);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-all active:scale-95"
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
}
