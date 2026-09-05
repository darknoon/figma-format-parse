import DesignSystem from "./design-system"
import AcceptInput from "./parser/accept-input"

function App() {
  if (window.location.pathname.replace(/\/$/, "") === "/design-system") return <DesignSystem />

  return (
    <main className="min-h-screen w-full bg-gray-100 font-sans">
      <AcceptInput />
    </main>
  )
}

export default App
