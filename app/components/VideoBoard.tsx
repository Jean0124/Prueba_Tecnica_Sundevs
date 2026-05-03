'use client' // necesario para usar hooks (useState, useEffect) y manejar eventos del navegador

import { useState, useEffect } from 'react'

// Forma del objeto que devuelve nuestro endpoint /api/videos
interface Video {
  id: string
  thumbnail: string
  title: string
  author: string
  publishedAt: string // ya viene transformado ("Hace 2 meses")
  hype: number        // ya viene calculado con todas las reglas aplicadas
}

// Devuelve una etiqueta legible según el valor numérico del hype.
// Los umbrales se definieron observando la distribución real del mock:
// ~0.30 es el máximo posible (tutorial con alto engagement), ~0.04 el mínimo con actividad
function etiquetaHype(hype: number): { texto: string; color: string } {
  if (hype === 0)    return { texto: 'Sin actividad', color: 'text-zinc-600' }
  if (hype > 0.2)   return { texto: '🔥 Viral',      color: 'text-orange-400' }
  if (hype > 0.1)   return { texto: '📈 Alto',        color: 'text-amber-400' }
  if (hype > 0.04)  return { texto: '📊 Medio',       color: 'text-yellow-600' }
  return                   { texto: '📉 Bajo',         color: 'text-zinc-500' }
}

// Muestra un placeholder animado mientras se carga la data.
// Imita la forma real de la UI (1 card grande + grilla de 8) para evitar saltos visuales
function LoadingSkeleton() {
  return (
    // role="status" + aria-label para que lectores de pantalla anuncien que hay carga en curso
    <div className="animate-pulse space-y-6" role="status" aria-label="Cargando videos">
      <div className="h-64 bg-zinc-800 rounded-2xl w-full" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-xl overflow-hidden">
            <div className="aspect-video bg-zinc-800" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-zinc-800 rounded w-2/3" />
              <div className="h-2 bg-zinc-800 rounded w-1/3 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Card especial para el video con mayor hype ("El video que la está rompiendo").
// El borde dorado animado viene de la clase .crown-wrapper definida en globals.css:
// es un div con gradient background — el div interior oscuro crea el efecto de borde
function CrownCard({ video }: { video: Video }) {
  const etiqueta = etiquetaHype(video.hype)
  return (
    <div className="crown-wrapper rounded-2xl p-[2px] mb-10">
      <div className="rounded-[14px] overflow-hidden bg-zinc-950 flex flex-col md:flex-row">
        <div className="relative md:w-5/12 aspect-video md:aspect-auto overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          {/* Gradiente oscuro para mejorar legibilidad del texto sobre la imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 text-xs font-black text-amber-400 bg-black/60 px-2 py-1 rounded-full">
            #1
          </span>
        </div>

        <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-zinc-950 to-amber-950/20">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl" aria-hidden>💥</span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
                El video que la está rompiendo
              </span>
              <span className={`text-xs font-semibold ${etiqueta.color}`}>
                {etiqueta.texto}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
              {video.title}
            </h2>
            <p className="text-zinc-400 text-sm">
              <span className="text-zinc-200 font-medium">{video.author}</span>
              {' · '}
              {video.publishedAt}
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider text-zinc-500">
                Nivel de Hype
              </span>
              <span className="text-amber-400 font-bold font-mono text-lg">
                {video.hype.toFixed(4)}
              </span>
            </div>
            {/* Barra al 100% con animación propia — siempre llena porque es el máximo */}
            <div
              className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={100}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Nivel de hype: ${video.hype.toFixed(4)}`}
            >
              <div className="h-full crown-hype-bar rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Barra de progreso proporcional al video con más hype (hypeMaximo = 100%)
// Así se puede comparar visualmente el hype de cada video con el máximo
function HypeBar({ hype, hypeMaximo }: { hype: number; hypeMaximo: number }) {
  const porcentaje = hypeMaximo > 0 ? (hype / hypeMaximo) * 100 : 0
  return (
    <div className="flex items-center gap-2 mt-1">
      <div
        className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(porcentaje)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Nivel de hype: ${hype.toFixed(3)}`}
      >
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <span className="text-xs text-amber-500 font-mono w-12 text-right shrink-0" aria-hidden>
        {hype.toFixed(3)}
      </span>
    </div>
  )
}

function VideoCard({
  video,
  posicion,
  hypeMaximo,
}: {
  video: Video
  posicion: number
  hypeMaximo: number
}) {
  const etiqueta = etiquetaHype(video.hype)
  // Videos sin actividad (hype=0) se muestran apagados para destacar menos
  const estaInactivo = video.hype === 0

  return (
    <article
      className={`bg-zinc-900 border rounded-xl overflow-hidden group transition-colors duration-200 ${
        estaInactivo
          ? 'border-zinc-800/50 opacity-50 grayscale'
          : 'border-zinc-800 hover:border-zinc-600'
      }`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy" // carga diferida para imágenes fuera del viewport inicial
          className={`w-full h-full object-cover transition-transform duration-300 ${
            estaInactivo ? '' : 'group-hover:scale-105'
          }`}
        />
        <span className="absolute top-2 left-2 text-xs font-black text-white/80 bg-black/50 px-1.5 py-0.5 rounded-full" aria-label={`Posición ${posicion}`}>
          #{posicion}
        </span>
      </div>
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
          {video.title}
        </h3>
        <p className="text-xs text-zinc-400">{video.author}</p>
        <p className="text-xs text-zinc-600">{video.publishedAt}</p>
        <div className="flex items-center justify-between pt-0.5">
          <span className={`text-[10px] font-semibold ${etiqueta.color}`}>
            {etiqueta.texto}
          </span>
        </div>
        <HypeBar hype={video.hype} hypeMaximo={hypeMaximo} />
      </div>
    </article>
  )
}

export default function VideoBoard() {
  // Estado principal: lista de videos, carga y error
  const [videos, setVideos] = useState<Video[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Texto del buscador — filtra sobre el array ya cargado sin llamadas extra al API
  const [busqueda, setBusqueda] = useState('')

  // Se ejecuta una sola vez al montar el componente (array vacío [] como dependencia)
  useEffect(() => {
    fetch('/api/videos')
      .then((respuesta) => {
        // fetch no lanza error en respuestas 4xx/5xx — hay que verificarlo manualmente
        if (!respuesta.ok)
          throw new Error(`Error ${respuesta.status}: no se pudieron cargar los videos`)
        return respuesta.json() as Promise<Video[]>
      })
      .then(setVideos)
      .catch((error: Error) => setError(error.message))
      .finally(() => setCargando(false)) // se ejecuta siempre, haya error o no
  }, [])

  if (cargando) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
        <span className="text-5xl" aria-hidden>⚠️</span>
        <p className="text-red-400 font-medium text-sm max-w-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (videos.length === 0) return null

  // Filtramos por título ignorando mayúsculas/minúsculas y espacios extra
  const terminoBusqueda = busqueda.trim().toLowerCase()
  const videosFiltrados = terminoBusqueda
    ? videos.filter((video) => video.title.toLowerCase().includes(terminoBusqueda))
    : videos

  // El API devuelve los videos ordenados por hype desc, así que el primero
  // siempre es el ganador. El resto va a la grilla normal
  const [videoCorona, ...resto] = videosFiltrados
  // hypeMaximo se usa como referencia del 100% en las barras de progreso de la grilla
  const hypeMaximo = videoCorona?.hype ?? 0

  return (
    <div>
      {/* Buscador en vivo — filtra el array en memoria, sin peticiones adicionales */}
      <div className="mb-8">
        <label htmlFor="buscador" className="sr-only">Buscar videos</label>
        <input
          id="buscador"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por título..."
          className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 focus:outline-none rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 text-sm transition-colors"
          aria-label="Buscar videos por título"
        />
      </div>

      {/* Mensaje cuando la búsqueda no encuentra resultados */}
      {videosFiltrados.length === 0 ? (
        <p className="text-center text-zinc-500 py-20 text-sm">
          No se encontraron videos para{' '}
          <span className="text-zinc-300 font-medium">&ldquo;{busqueda}&rdquo;</span>
        </p>
      ) : (
        <>
          {/* Solo mostramos la card destacada cuando no hay búsqueda activa */}
          {!terminoBusqueda && <CrownCard video={videoCorona} />}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Con búsqueda activa todos los resultados van a la grilla desde posición 1 */}
            {(terminoBusqueda ? videosFiltrados : resto).map((video, i) => (
              <VideoCard
                key={video.id}
                video={video}
                posicion={terminoBusqueda ? i + 1 : i + 2}
                hypeMaximo={hypeMaximo}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
