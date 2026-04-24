import { ShaderAnimation } from "@/components/ui/shader-animation";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";

export function Hero() {
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] pt-20">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ShaderAnimation />
      </div>
      
      <div className="relative z-20 w-full flex flex-col items-center">
        <VercelV0Chat />
      </div>
    </section>
  );
}
