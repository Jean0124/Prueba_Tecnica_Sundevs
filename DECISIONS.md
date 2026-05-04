# Decisiones Técnicas

## Enfoque general de la solución

La prueba pedía un backend en **NestJS** y un frontend en **ReactJS**. La solución tiene dos proyectos separados dentro del mismo repositorio:

- **Backend** → aplicación NestJS en `backend/`, con un controlador que expone `GET /api/videos` en el puerto 3001.
- **Frontend** → React Client Component (`VideoBoard.tsx`) servido por Next.js en el puerto 3000, que consume el endpoint de NestJS.

Esta separación mantiene una arquitectura clara: el backend transforma y filtra, el frontend solo renderiza lo que recibe.

## Decisiones técnicas principales

### Backend (NestJS)

**Estructura de módulos**
Se siguió la arquitectura estándar de NestJS: `AppModule` → `VideosModule` → `VideosController` + `VideosService`. El controlador solo delega al servicio; toda la lógica de negocio vive en el servicio.

**Lectura del archivo con `readFileSync` + `path.join(process.cwd(), ...)`**
El servicio lee `data/mock-youtube-api.json` desde el filesystem, simulando la lectura de una fuente externa de datos. Se usa `process.cwd()` que en ejecución normal apunta a la carpeta `backend/`.

**Cálculo de Hype**
La fórmula y sus modificadores se extrajeron a `videos.utils.ts` como funciones puras independientes del framework:

- Fórmula base: `(likes + comentarios) / vistas`
- Modificador Tutorial: `/tutorial/i.test(titulo)` detecta la palabra en cualquier capitalización (`Tutorial`, `tutorial`, `TuToRiaL`)
- Comentarios desactivados: `!('commentCount' in elemento.statistics)` — distingue "propiedad ausente" de "propiedad en cero"
- División por cero: si `viewCount === 0`, retorna `0` antes de calcular

**Tiempo sin librerías**
Se implementó con aritmética nativa sobre timestamps (`Date.getTime()`), calculando la diferencia en días y mapeándola a texto amigable: días → semanas → meses → años.

**CORS**
Se habilitó CORS en `main.ts` con `app.enableCors({ origin: 'http://localhost:3000' })` para permitir que el frontend en el puerto 3000 consuma el backend en el puerto 3001.

**Prefijo global `/api`**
Se usó `app.setGlobalPrefix('api')` en lugar de poner el prefijo en el decorator del controlador, siguiendo la convención de NestJS. El endpoint resultante es `GET /api/videos`.

**Manejo de errores**
El servicio envuelve la lógica en `try/catch` y lanza `InternalServerErrorException` si el JSON no existe o está corrupto. NestJS convierte esto automáticamente en una respuesta 500.

**Ordenado en el backend**
Los videos se devuelven ya ordenados por `hype` descendente. El frontend no necesita reordenar.

### Extracción de funciones puras (`videos.utils.ts`)

Las funciones `hypeLevel` y `relativeTime` se extrajeron a su propio módulo en lugar de vivir dentro del servicio. Esto tiene dos ventajas:

- Se pueden importar y testear de forma aislada sin levantar NestJS
- El parámetro `ahora` en `relativeTime` permite pasar una fecha fija en los tests, sin necesidad de mockear el objeto `Date` global

### Frontend (`VideoBoard.tsx`)

**Client Component con `useState` + `useEffect`**
Se eligió sobre un Server Component async para hacer explícitos los estados de carga y error tal como pide la prueba. Permite mostrar un skeleton animado durante la petición y un mensaje de error con botón de reintento si falla.

**El primer elemento será el mejor**
Como el API ya devuelve los datos ordenados, el primer elemento del array siempre es el ganador. Se obtiene con destructuring: `const [videoCorona, ...resto] = videosFiltrados`.

**Borde animado**
Se implementó con un `div` wrapper que tiene `background: linear-gradient(...)` animado via CSS keyframes en `globals.css`. El div interior con `border-radius` y fondo oscuro crea el efecto de borde gradiente sin necesidad de librerías de animación.

**Hype categorizado**
Para hacer el número abstracto más legible se añade una etiqueta: `🔥 Viral` (>0.20) / `📈 Alto` (>0.10) / `📊 Medio` (>0.04) / `📉 Bajo` (>0) / `Sin actividad` (=0). Los umbrales se definieron observando la distribución de los datos del mock.

**Videos con hype = 0 diferenciados**
Se aplica `opacity-50 grayscale` para indicar visualmente que el video no tiene actividad significativa, sin eliminarlos de la grilla.

**Buscador en vivo**
Se añadió un input que filtra el array en memoria por título mientras el usuario escribe. No hace peticiones adicionales al API. Cuando hay búsqueda activa, la card destacada se oculta y todos los resultados van a la grilla desde posición #1.

## Organización del proyecto

```
backend/
  src/
    main.ts              → Bootstrap NestJS (CORS, prefijo, puerto)
    app.module.ts        → Módulo raíz
    videos/
      videos.module.ts   → Módulo de videos
      videos.controller.ts → GET /api/videos
      videos.service.ts  → Lógica de transformación y ordenamiento
      videos.utils.ts    → Funciones puras hypeLevel y relativeTime
  data/                  → Datos mock (simula proveedor externo)
app/
  components/
    VideoBoard.tsx       → Toda la lógica del frontend
  lib/
    videos.ts            → Funciones puras (reutilizadas por los tests)
  globals.css            → Única hoja de estilos global (animaciones)
tests/
  videos.test.mts        → 18 tests unitarios sin dependencias externas
```

## Supuestos y simplificaciones

- Se asumió que "comentarios desactivados" significa que la propiedad `commentCount` **no existe** en `statistics`, no que su valor sea `"0"`.
- Se asumió que si `viewCount` es `"0"`, el hype es `0` para evitar `Infinity` por división por cero.
- La fórmula de tiempo relativo usa meses de 30 días y años de 365 días (para texto amigable).
- No se implementó paginación ya que el dataset es fijo.
- El origen de CORS está hardcodeado a `http://localhost:3000` ya que es un entorno local de desarrollo.

## Problemas encontrados y soluciones

**Los títulos tenían caracteres corruptos (`fÃ¡cil`, `POLÃMICA`)**
El JSON original fue generado con un bug de encoding. Se corrigieron directamente en el archivo, ya que no eran muchos.

**Las imágenes del mock estaban caídas**
`via.placeholder.com` estaba caído, se reemplazó por `placehold.co`.

**El cálculo de las fechas sin librerías**
Se implementó con aritmética nativa sobre `Date.getTime()`. Aunque las librerías ofrecen maneras más concisas, la implementación propia es más transparente y cumple la restricción de la prueba.

## Tests unitarios

Se escribieron 18 tests usando el runner nativo de Node.js — **sin instalar ninguna dependencia adicional**. Los tests cubren todos los casos de `hypeLevel` y `relativeTime`:

- `hypeLevel`: comentarios desactivados, vistas en cero, fórmula base, modificador tutorial (3 variantes de capitalización), sin modificador, combinación vistas=0 con tutorial
- `relativeTime`: hoy, fecha futura, 1 día, N días, 1 semana, N semanas, 1 mes, N meses, 1 año, N años

## Prompts de IA utilizados

Se utilizó **Claude** como asistente durante el desarrollo.

**Prompt de verificación de datos:**
> [Se adjuntó el archivo `mock-youtube-api.json`] verificame si este archivo está correcto o tiene un error

Primero lo revisé yo y después le pregunté si lo revisaba por si se me pasaba algo. Con los datos reales se verificó que la lógica de Hype producía resultados correctos antes de escribir el código final.

**Prompt de mejora iterativa:**
> "alguna mejora u optimización que le podamos hacer?"

Mediante Claude se pudieron optimizar algunos procesos para no gastar rendimiento innecesario y para que fuera más legible. El asistente propuso mejoras y decidí cuáles eran correctas para el proyecto, entendiendo todo lo que se hacía.

**Prompt de mejoras de frontend:**
> "como podríamos mejorar el front y creo que estos colores no están bien visualmente?"

Ya teniendo el front se le preguntó por alguna mejora visual, con lo cual nos dio algunas sugerencias que ayudaron a llegar al modelo final.

**Prompt de tests:**
> "podrías darme una pequeña guía de cómo realizar tests en Next.js sin dependencias externas"

Como buena práctica me gusta hacer tests unitarios para probar los procesos del backend que son los más importantes.


Al final se implementaron dos mejoras adicionales: un buscador en vivo que filtra por título en memoria y el skeleton de carga para mejorar la accesibilidad con lectores de pantalla.
