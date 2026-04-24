import { Header } from "@/components/layout/Header"
import { Hero } from "@/components/layout/Hero"
import { ChatPage } from "@/pages/chat/ChatPage"

function App() {
  const isChatPage = window.location.pathname === "/chat"

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
