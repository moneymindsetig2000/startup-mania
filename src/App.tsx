import { Header } from "@/components/layout/Header"
import { Hero } from "@/components/layout/Hero"
import { ChatPage } from "@/pages/chat/ChatPage"
import { AuthPage } from "@/pages/auth/AuthPage"

function App() {
  const path = window.location.pathname
  const isChatPage = path === "/chat"
  const isAuthPage = path === "/auth"

  if (isAuthPage) return <AuthPage />

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
