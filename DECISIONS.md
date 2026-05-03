# Decisiones Técnicas

## Enfoque general de la solución

La prueba nos pedía un backend en NestJS y un frontend en ReactJS. El proyecto ya estaba inicializado como una aplicación **Next.js 16**, por lo que se adoptó Next.js como solución unificada que cumple ambos roles:

- **Backend** → Route Handler en `app/api/videos/route.ts` (equivale a un controller de NestJS con un endpoint `GET /api/videos`)

- **Frontend** → React Client Component en `app/components/VideoBoard.tsx`

Esta decisión permitió entregar exactamente lo que se solicitó en la prueba: un endpoint HTTP que procesa datos y un frontend React que lo consume, sin agregar complejidad de infraestructura innecesaria.

## Decisiones técnicas principales

Primero que todo decidí hacer el backend y frontend en el mismo proyecto para comodidad de la persona que va a calificar la prueba, ya que no tendría que hacer muchos pasos para correr el proyecto. Para un proyecto más robusto sí es de ley hacerlo por separado.

### Backend (`route.ts`)

**Lectura del archivo con `readFileSync` + `path.join(process.cwd(), ...)`**
Los Route Handlers corren en el runtime de Node.js (servidor), por lo que pueden acceder al filesystem. Se leyó el JSON directamente desde `data/mock-youtube-api.json` en lugar de importarlo como módulo, simulando así la lectura de una fuente externa de datos.

**Cálculo de Hype**
Aquí fue donde hicimos la magia:

- Fórmula base: `(likes + comentarios) / vistas`
- Modificador Tutorial: `/tutorial/i.test(titulo)` detecta la palabra en cualquier combinación de mayúsculas/minúsculas (`Tutorial`, `tutorial`, `TuToRiaL`)
- Comentarios desactivados: se verifica con `!('commentCount' in elemento.statistics)` — esto distingue entre "la propiedad no existe" (desactivados) y "la propiedad existe con valor 0"
- División por cero: si `viewCount === 0`, se retorna `0` antes de calcular

**Tiempo sin librerías**
Se implementó con aritmética nativa sobre timestamps (`Date.getTime()`), calculando la diferencia en días y mapeándola a texto: días → semanas → meses → años.

**Ordenado en el backend**
Los videos se devuelven ya ordenados por `hype` descendente. El frontend no necesita reordenar, para no sobrecargar el front con esa lógica.

**Try/catch con respuesta 500**
Si el archivo JSON no existe o está corrupto, el endpoint devuelve `{ error: "..." }` con status 500 en lugar de dejar crashear el servidor.

### Extracción de funciones puras (`app/lib/videos.ts`)

Las funciones `hypeLevel` y `relativeTime` se extrajeron a su propio módulo en lugar de vivir dentro del route handler. Esto tiene nos da dos ventajas:

- Se pueden importar y testear de forma aislada sin levantar Next.js
- El parámetro `ahora` en `relativeTime` permite pasar una fecha fija en los tests, sin necesidad de mockear el objeto `Date` global

### Frontend (`VideoBoard.tsx`)

**Client Component con `useState` + `useEffect`**
Se eligió sobre un Server Component async para hacer explícitos los estados de carga y error tal como pide la prueba. Permite mostrar un skeleton animado durante la petición y un mensaje de error con botón de reintento si falla.

**El primer elemento será el mejor**
Como el API ya devuelve los datos ordenados, el primer elemento del array siempre es el ganador. Se obtiene con destructuring: `const [videoCorona, ...resto] = videosFiltrados`.

**Borde animado**
Se implementó con un `div` wrapper que tiene `background: linear-gradient(...)` animado via CSS keyframes en `globals.css`. El div interior con `border-radius` y fondo oscuro crea el efecto de borde gradiente sin necesidad de librerías de animación.

**Hype categorizado**
Para hacer el número abstracto más legible se añade una etiqueta: `🔥 Viral` (>0.20) / `📈 Alto` (>0.10) / `📊 Medio` (>0.04) / `📉 Bajo` (>0) / `Sin actividad` (=0). Los umbrales se definieron observando la distribución de los datos del mock, para que se vea mejor visualmente.

**Videos con hype = 0 diferenciados**
Se aplica `opacity-50 grayscale` para indicar visualmente que el video no tiene actividad significativa, sin eliminarlos de la grilla. A veces los videos con menos vistas traen soluciones interesantes, entonces no podríamos descartarlos del todo :D

**Buscador en vivo**
Se añadió un input que filtra el array en memoria por título mientras el usuario escribe. No hace peticiones adicionales al API — simplemente aplica un `.filter()` sobre el array ya cargado. Cuando hay búsqueda activa, la card destacada se oculta y todos los resultados van a la grilla desde posición #1.


## Organización del proyecto

```
app/
  api/videos/route.ts    → endpoint GET /api/videos (lógica de backend)
  components/
    VideoBoard.tsx       → toda la lógica del frontend
  lib/
    videos.ts            → funciones puras hypeLevel y relativeTime (testables)
  globals.css            → única hoja de estilos global (animaciones)
data/                    → datos mock (simula proveedor externo)
tests/
  videos.test.mts        → 18 tests unitarios sin dependencias externas
```

Se mantuvo una separación de responsabilidades clara: el backend transforma y filtra, el frontend solo renderiza lo que recibe.

## Supuestos y simplificaciones

- Se asumió que "comentarios desactivados" significa que la propiedad `commentCount` **no existe** en `statistics`, no que su valor sea `"0"`.
- Se asumió que si `viewCount` es `"0"`, el hype es `0` para evitar `Infinity` por división por cero, ya que no tiene sentido calcular engagement sin audiencia.
- La fórmula de tiempo relativo usa meses de 30 días y años de 365 días (para texto amigable).
- No se implementó paginación ya que el dataset es fijo. Si fuera dinámico, sí se implementaría.

## Problemas encontrados y soluciones

**Los títulos tenían caracteres corruptos (`fÃ¡cil`, `POLÃMICA`)**
El JSON original fue generado con un bug de encoding que traía los caracteres raros. Se corrigieron directamente en el archivo JSON, ya que no eran muchos. Si fueran muchos hubiera decidido hacer un método que los acomodara automáticamente. No se cambiaron los títulos con "tutorial" para mostrar que el modificador funciona independientemente de mayúsculas y minúsculas.

**Las imágenes del mock estaban caídas**
Al ver la página en el front noté que las imágenes no cargaban. Mirando el JSON vi que `via.placeholder.com` estaba caído, por lo que lo reemplacé por `placehold.co` que sí funcionaba.


**El cálculo de las fechas**
Como no se podían utilizar librerías externas, se implementó con lo que ofrece JavaScript nativo. Aunque las librerías ofrecen maneras más concisas de hacerlo, la implementación propia es más transparente para entender qué está pasando.


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

Mediante Claude se pudieron optimizar algunos procesos para no gastar rendimiento innecesario y para que fuera más legible para cualquier desarrollador que lo leyera. El asistente propuso mejoras y decidí cuáles eran correctas para el proyecto, entendiendo todo lo que se hacía.

**Prompt de mejoras de frontend:**
> "como podríamos mejorar el front y creo que estos colores no están bien visualmente?"

Ya teniendo el front se le preguntó por alguna mejora visual, con lo cual nos dio algunas sugerencias que ayudaron a llegar al modelo final.

**Prompt de tests:**
> "podrías darme una pequeña guía de cómo realizar tests en Next.js sin dependencias externas"

Como buena práctica me gusta hacer tests unitarios para probar los procesos del backend que son los más importantes. Como en Next.js no sabía bien cómo hacerlos sin instalar Jest, le pregunté si me guiaba para ir haciéndolos mientras aprendía de camino :D


Al final Se implementaron dos mejoras adicionales: un buscador en vivo que filtra por título en memoria y el skeleton de carga para mejorar la accesibilidad con lectores de pantalla.
