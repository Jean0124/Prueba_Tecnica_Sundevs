# La Cartelera de Hype Tecnológico :D

Hola de antemano muchas gracias por tenerme en cuenta y espero que el proyecto sea de su agrado. Esta Aplicación fullstack consume datos simulados de la API de YouTube, procesa los datos y los presenta en una cartelera visual rankeada por "Nivel de Hype".

## Requisitos

Antes de comenzar asegúrate de tener esto instalado en tu máquina, de lo contrario no va a funcionar:

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior

## Instalación

```bash
npm install
```

## Levantar el proyecto localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

> El backend y el frontend corren en el mismo proceso. No hay que levantar dos servidores separados.

## Correr los tests

Se incluyen 18 tests unitarios usando el runner nativo de Node.js — sin dependencias adicionales:

```bash
npm test
```

Cubre todos los casos de `hypeLevel` (fórmula base, modificador tutorial, comentarios desactivados, división por cero) y `relativeTime` (hoy, ayer, días, semanas, meses, años).

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/videos` | Devuelve los videos procesados, ordenados por Nivel de Hype descendente |

### Ejemplo de respuesta de `/api/videos`

```json
[
  {
    "id": "vid_003",
    "thumbnail": "https://placehold.co/300x200/282c34/61dafb?text=TailwindCSS",
    "title": "TailwindCSS errores comunes - Tutorial",
    "author": "JuniorDev99",
    "publishedAt": "Hace 2 años",
    "hype": 0.308
  }
]
```

## Estructura del proyecto

```
├── app/
│   ├── api/
│   │   └── videos/
│   │       └── route.ts       # Endpoint GET /api/videos (lógica de backend)
│   ├── components/
│   │   └── VideoBoard.tsx     # Grilla de videos con buscador, estados loading/error
│   ├── lib/
│   │   └── videos.ts          # Funciones puras hypeLevel y relativeTime
│   ├── globals.css            # Estilos globales + animación shimmer dorada
│   ├── layout.tsx
│   └── page.tsx               # Página principal
├── data/
│   └── mock-youtube-api.json  # Datos simulados de YouTube API (fuente de datos)
└── tests/
    └── videos.test.mts        # Tests unitarios (Node.js test runner nativo)
```

> Muchas gracias por probar mi proyecto y espero sea de su agrado :D
