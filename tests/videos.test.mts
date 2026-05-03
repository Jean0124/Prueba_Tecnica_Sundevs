// Test runner y assertions integrados en Node.js — sin instalar nada
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { hypeLevel, relativeTime } from '../app/lib/videos.ts'

// ─── hypeLevel ────────────────────────────────────────────────────────────────

describe('hypeLevel', () => {
  it('retorna 0 cuando los comentarios están desactivados (commentCount ausente)', () => {
    const elemento = {
      snippet: { title: 'Video sin comentarios', channelTitle: '', publishedAt: '', thumbnails: { high: { url: '' } } },
      statistics: { viewCount: '10000', likeCount: '500' }, // sin commentCount
    }
    assert.equal(hypeLevel(elemento), 0)
  })

  it('retorna 0 cuando las vistas son 0 (evita división por cero)', () => {
    const elemento = {
      snippet: { title: 'Video nuevo', channelTitle: '', publishedAt: '', thumbnails: { high: { url: '' } } },
      statistics: { viewCount: '0', likeCount: '0', commentCount: '0' },
    }
    assert.equal(hypeLevel(elemento), 0)
  })

  it('calcula correctamente la fórmula base: (likes + comentarios) / vistas', () => {
    const elemento = {
      snippet: { title: 'Video normal', channelTitle: '', publishedAt: '', thumbnails: { high: { url: '' } } },
      statistics: { viewCount: '1000', likeCount: '100', commentCount: '50' },
    }
    // (100 + 50) / 1000 = 0.15
    assert.equal(hypeLevel(elemento), 0.15)
  })

  it('aplica el multiplicador ×2 si el título contiene "Tutorial"', () => {
    const elemento = {
      snippet: { title: 'React - Tutorial', channelTitle: '', publishedAt: '', thumbnails: { high: { url: '' } } },
      statistics: { viewCount: '1000', likeCount: '100', commentCount: '50' },
    }
    // 0.15 * 2 = 0.30
    assert.equal(hypeLevel(elemento), 0.30)
  })

  it('el modificador es case-insensitive: "tutorial" (minúsculas)', () => {
    const elemento = {
      snippet: { title: 'React - tutorial', channelTitle: '', publishedAt: '', thumbnails: { high: { url: '' } } },
      statistics: { viewCount: '1000', likeCount: '100', commentCount: '50' },
    }
    assert.equal(hypeLevel(elemento), 0.30)
  })

  it('el modificador es case-insensitive: "TuToRiaL" (mezclado)', () => {
    const elemento = {
      snippet: { title: 'React - TuToRiaL', channelTitle: '', publishedAt: '', thumbnails: { high: { url: '' } } },
      statistics: { viewCount: '1000', likeCount: '100', commentCount: '50' },
    }
    assert.equal(hypeLevel(elemento), 0.30)
  })

  it('NO aplica el modificador si el título no contiene "tutorial"', () => {
    const elemento = {
      snippet: { title: 'React curso completo', channelTitle: '', publishedAt: '', thumbnails: { high: { url: '' } } },
      statistics: { viewCount: '1000', likeCount: '100', commentCount: '50' },
    }
    assert.equal(hypeLevel(elemento), 0.15)
  })

  it('retorna 0 aunque tenga "tutorial" en el título si las vistas son 0', () => {
    const elemento = {
      snippet: { title: 'Tutorial sin vistas', channelTitle: '', publishedAt: '', thumbnails: { high: { url: '' } } },
      statistics: { viewCount: '0', likeCount: '0', commentCount: '0' },
    }
    assert.equal(hypeLevel(elemento), 0)
  })
})

// ─── relativeTime ─────────────────────────────────────────────────────────────

describe('relativeTime', () => {
  // Fecha de referencia fija para todos los tests
  const AHORA = new Date('2026-05-02T12:00:00Z')

  const diasAtras = (n: number) => {
    const fecha = new Date(AHORA)
    fecha.setDate(fecha.getDate() - n)
    return fecha.toISOString()
  }

  it('devuelve "Hoy" para la fecha de hoy', () => {
    assert.equal(relativeTime(AHORA.toISOString(), AHORA), 'Hoy')
  })

  it('devuelve "Hace unos momentos" para una fecha futura', () => {
    const futuro = new Date(AHORA.getTime() + 86_400_000).toISOString()
    assert.equal(relativeTime(futuro, AHORA), 'Hace unos momentos')
  })

  it('devuelve "Hace 1 día" para ayer', () => {
    assert.equal(relativeTime(diasAtras(1), AHORA), 'Hace 1 día')
  })

  it('devuelve "Hace N días" para menos de una semana', () => {
    assert.equal(relativeTime(diasAtras(5), AHORA), 'Hace 5 días')
  })

  it('devuelve "Hace 1 semana" para 7 días', () => {
    assert.equal(relativeTime(diasAtras(7), AHORA), 'Hace 1 semana')
  })

  it('devuelve "Hace N semanas" para menos de un mes', () => {
    assert.equal(relativeTime(diasAtras(21), AHORA), 'Hace 3 semanas')
  })

  it('devuelve "Hace 1 mes" para 30 días', () => {
    assert.equal(relativeTime(diasAtras(30), AHORA), 'Hace 1 mes')
  })

  it('devuelve "Hace N meses" para menos de un año', () => {
    assert.equal(relativeTime(diasAtras(90), AHORA), 'Hace 3 meses')
  })

  it('devuelve "Hace 1 año" para 365 días', () => {
    assert.equal(relativeTime(diasAtras(365), AHORA), 'Hace 1 año')
  })

  it('devuelve "Hace N años" para más de un año', () => {
    assert.equal(relativeTime(diasAtras(730), AHORA), 'Hace 2 años')
  })
})
