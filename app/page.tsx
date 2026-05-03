import VideoBoard from './components/VideoBoard'

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 md:px-10">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden>📺</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            La Cartelera de Hype Tecnológico
          </h1>
        </div>
        <p className="text-zinc-500 text-sm ml-12">
          Los videos que están rompiendo el internet del dev
        </p>
      </header>
      <VideoBoard />
    </main>
  )
}
