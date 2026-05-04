# La Cartelera de Hype Tecnológico :D

Hola de antemano muchas gracias por tenerme en cuenta y espero que el proyecto sea de su agrado. Esta aplicación fullstack consume datos simulados de la API de YouTube, los procesa con reglas de negocio y los presenta en una cartelera visual rankeada por "Nivel de Hype".

**Stack:** NestJS (backend) + Next.js/React (frontend)

## Requisitos

Antes de comenzar asegúrate de tener esto instalado en tu máquina:

- [Node.js](https://nodejs.org/) v18 o superior
- [Git](https://git-scm.com/downloads)
- npm v9 o superior

## Instalación

Clona el repositorio:

```bash
git clone https://github.com/Jean0124/pruebaTecnica.git

cd la_cartelera_de_hype_tecnologico
```

Instala las dependencias del **frontend** (desde la raíz):

```bash
npm install
```

Instala las dependencias del **backend**:

```bash
cd backend

npm install
```

## Levantar el proyecto localmente

El proyecto requiere **dos terminales** corriendo al mismo tiempo.

### Terminal 1 — Backend (NestJS, puerto 3001)

```bash
cd backend
npm run start:dev
```

Verás el mensaje: `Backend corriendo en http://localhost:3001`

### Terminal 2 — Frontend (Next.js, puerto 3000)

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

> El backend debe estar corriendo antes de abrir el frontend, de lo contrario verás el estado de error.

## Correr los tests

Se incluyen 18 tests unitarios usando el runner nativo de Node.js — sin dependencias adicionales:

para correrlos se debe estar en la carpeta base no en el backend
```bash
npm test
```

Cubre todos los casos de `hypeLevel` (fórmula base, modificador tutorial, comentarios desactivados, división por cero) y `relativeTime` (hoy, ayer, días, semanas, meses, años).

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `http://localhost:3001/api/videos` | Devuelve los videos procesados, ordenados por Nivel de Hype descendente |

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
├── backend/                        # Servidor NestJS (puerto 3001)
│   ├── src/
│   │   ├── main.ts                 # Bootstrap: CORS, prefijo /api, puerto 3001
│   │   ├── app.module.ts           # Módulo raíz
│   │   └── videos/
│   │       ├── videos.module.ts    # Módulo de videos
│   │       ├── videos.controller.ts# GET /api/videos
│   │       ├── videos.service.ts   # Lógica de transformación y ordenamiento
│   │       └── videos.utils.ts     # Funciones puras hypeLevel y relativeTime
│   ├── data/
│   │   └── mock-youtube-api.json   # Datos simulados de YouTube API
│   ├── package.json
│   └── tsconfig.json
├── app/                            # Frontend Next.js/React (puerto 3000)
│   ├── components/
│   │   └── VideoBoard.tsx          # Grilla de videos con buscador, estados loading/error
│   ├── lib/
│   │   └── videos.ts               # Funciones puras (usadas por los tests)
│   ├── globals.css                 # Estilos globales + animación shimmer dorada
│   ├── layout.tsx
│   └── page.tsx                    # Página principal
└── tests/
    └── videos.test.mts             # 18 tests unitarios (Node.js test runner nativo)
```

> Muchas gracias por probar mi proyecto y espero sea de su agrado :D
