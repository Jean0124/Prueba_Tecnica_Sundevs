export interface Statistics {
  viewCount: string
  likeCount: string
  commentCount?: string
}

export interface YoutubeItem {
  snippet: {
    title: string
    channelTitle: string
    publishedAt: string
    thumbnails: { high: { url: string } }
  }
  statistics: Statistics
}

export function relativeTime(fechaISO: string, ahora = new Date()): string {
  const fecha = new Date(fechaISO)
  const dias = Math.floor((ahora.getTime() - fecha.getTime()) / 86_400_000)

  if (dias < 0) return 'Hace unos momentos'
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Hace 1 día'
  if (dias < 7) return `Hace ${dias} días`

  const semanas = Math.floor(dias / 7)
  if (dias < 30) return semanas === 1 ? 'Hace 1 semana' : `Hace ${semanas} semanas`

  const meses = Math.floor(dias / 30)
  if (dias < 365) return meses === 1 ? 'Hace 1 mes' : `Hace ${meses} meses`

  const anios = Math.floor(dias / 365)
  return anios === 1 ? 'Hace 1 año' : `Hace ${anios} años`
}

export function hypeLevel(elemento: YoutubeItem): number {
  if (!('commentCount' in elemento.statistics)) return 0

  const vistas = Number(elemento.statistics.viewCount)
  if (vistas === 0) return 0

  const interacciones =
    Number(elemento.statistics.likeCount) + Number(elemento.statistics.commentCount)
  const base = interacciones / vistas

  return /tutorial/i.test(elemento.snippet.title) ? base * 2 : base
}
