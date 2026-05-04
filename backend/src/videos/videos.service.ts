import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { readFileSync } from 'fs'
import { join } from 'path'
import { hypeLevel, relativeTime, YoutubeItem } from './videos.utils'

@Injectable()
export class VideosService {
  getVideos() {
    try {
      const rutaArchivo = join(__dirname, '..', '..', 'data', 'mock-youtube-api.json')
      const { items } = JSON.parse(readFileSync(rutaArchivo, 'utf-8')) as {
        items: (YoutubeItem & { id: string })[]
      }

      return items
        .map((elemento) => ({
          id: elemento.id,
          thumbnail: elemento.snippet.thumbnails.high.url,
          title: elemento.snippet.title,
          author: elemento.snippet.channelTitle,
          publishedAt: relativeTime(elemento.snippet.publishedAt),
          hype: hypeLevel(elemento),
        }))
        .sort((a, b) => b.hype - a.hype)
    } catch (error) {
      console.error('[GET /api/videos]', error)
      throw new InternalServerErrorException('No se pudieron procesar los videos')
    }
  }
}
