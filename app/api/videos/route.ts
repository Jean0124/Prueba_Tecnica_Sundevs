import { readFileSync } from 'fs'
import path from 'path'
import { hypeLevel, relativeTime, YoutubeItem } from '@/app/lib/videos'

export async function GET() {
  try {
    // process.cwd() apunta a la raíz del proyecto en tiempo de ejecución
    const rutaArchivo = path.join(process.cwd(), 'data', 'mock-youtube-api.json')
    const { items } = JSON.parse(readFileSync(rutaArchivo, 'utf-8')) as {
      items: (YoutubeItem & { id: string })[]
    }

    const videos = items
      .map((elemento) => ({
        id: elemento.id,
        thumbnail: elemento.snippet.thumbnails.high.url,
        title: elemento.snippet.title,
        author: elemento.snippet.channelTitle,
        publishedAt: relativeTime(elemento.snippet.publishedAt),
        hype: hypeLevel(elemento),
      }))
      // Ordenamos descendente para que el frontend reciba el array ya rankeado
      // y pueda obtener la Joya de la Corona con un simple videos[0]
      .sort((a, b) => b.hype - a.hype)

    return Response.json(videos)
  } catch (error) {
    // Si el JSON no existe o está corrupto, devolvemos 500 en lugar de crashear
    console.error('[GET /api/videos]', error)
    return Response.json(
      { error: 'No se pudieron procesar los videos' },
      { status: 500 }
    )
  }
}
