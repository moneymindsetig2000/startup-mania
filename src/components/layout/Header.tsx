import { useState, useEffect } from "react";
import { Rocket } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    let isMounted = true;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (isMounted) {
            setIsScrolled(window.scrollY > 50);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-[padding,background-color,border-color,backdrop-filter] duration-500 will-change-[padding,background-color,backdrop-filter] ${
        isScrolled 
          ? "border-white/10 bg-black/80 backdrop-blur-xl py-4" 
          : "border-transparent bg-transparent py-6"
      }`}
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Rocket className="text-black w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">Startup Mania</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          {["Features", "Showcase", "Pricing", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-white/70 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Log in
          </button>
          <button onClick={() => (window.location.pathname = "/chat")} className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-black/20">
            Go to Chat
          </button>
        </div>
      </div>
    </header>
  );
}
