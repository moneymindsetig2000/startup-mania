import { Header } from "@/components/layout/Header"
import { Hero } from "@/components/layout/Hero"
import { ChatPage } from "@/pages/chat/ChatPage"
import { AuthPage } from "@/pages/auth/AuthPage"
import { FeaturesPage } from "@/pages/features/FeaturesPage"
import { ShowcasePage } from "@/pages/showcase/ShowcasePage"
import { PricingPage } from "@/pages/pricing/PricingPage"
import { AboutPage } from "@/pages/about/AboutPage"

function App() {
  const path = window.location.pathname
  const isChatPage = path === "/chat"
  const isAuthPage = path === "/auth"

  if (isAuthPage) return <AuthPage />
  if (path === "/features") return <FeaturesPage />
  if (path === "/showcase") return <ShowcasePage />
  if (path === "/pricing") return <PricingPage />
  if (path === "/about") return <AboutPage />

  return (
    isChatPage ? <ChatPage /> : (
      <div className="min-h-screen bg-black">
        <Header />
        <main>
          <Hero />
        </main>
      </div>
    )
  )
}

export default App
