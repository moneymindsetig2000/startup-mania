import { Header } from "@/components/layout/Header"
import { Hero } from "@/components/layout/Hero"
import { ChatPage } from "@/pages/chat/ChatPage"
import { AuthPage } from "@/pages/auth/AuthPage"
import { FeaturesPage } from "@/pages/features/FeaturesPage"
import { ShowcasePage } from "@/pages/showcase/ShowcasePage"
import { PricingPage } from "@/pages/pricing/PricingPage"
import { AboutPage } from "@/pages/about/AboutPage"
import { PrivacyPolicyPage } from "@/pages/legal/PrivacyPolicyPage"
import { TermsPage } from "@/pages/legal/TermsPage"

function App() {
  const path = window.location.pathname
  const isChatPage = path === "/chat"
  const isAuthPage = path === "/auth"

  if (isAuthPage) return <AuthPage />
  if (path === "/features") return <FeaturesPage />
  if (path === "/showcase") return <ShowcasePage />
  if (path === "/pricing") return <PricingPage />
  if (path === "/about") return <AboutPage />
  if (path === "/privacy") return <PrivacyPolicyPage />
  if (path === "/terms") return <TermsPage />

  return (
    isChatPage ? <ChatPage /> : (
      <div className="min-h-screen bg-black flex flex-col">
        <Header />
        <main className="flex-1">
          <Hero />
        </main>
        
        {/* Simple Footer */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-xl py-4">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-xs font-medium">
              &copy; {new Date().getFullYear()} Pixora (Startup Mania). All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => window.location.pathname = "/privacy"} 
                className="text-white/40 hover:text-white/80 transition-colors text-xs font-medium cursor-pointer"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => window.location.pathname = "/terms"} 
                className="text-white/40 hover:text-white/80 transition-colors text-xs font-medium cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </footer>
      </div>
    )
  )
}

export default App
