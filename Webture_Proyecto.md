# WEBTURE — Documento de Seguimiento del Proyecto

> Última actualización: Chat actual — ScrollStory.astro en progreso
> Este documento debe leerse al inicio de cada nuevo chat para retomar el contexto exacto.

---

## 🧠 CONTEXTO ESENCIAL

**Quién:** Desarrollador de 19 años, 7mo semestre de ingeniería (de 8), Armenia, Quindío, Colombia.

**Qué es WebTure:** Agencia de desarrollo web para negocios locales en Armenia, Quindío. Nombre = Web + Future. Paleta: morado `#b388ff` + negro `#080808`.

**Por qué existe:**

1. Practicar programación a nivel profesional
2. Generar ingresos reales (primer ingreso pasivo)

**Cliente objetivo:** Dueño de negocio local en Armenia, 35–55 años, sin web o con web mala. Toma decisiones rápido si ve confianza + precio claro.

**WhatsApp de contacto:** +573046565684
**Email:** hola@webture.co
**Deploy destino:** Cloudflare Pages
**Dominio futuro:** webture.co

---

## 🛠 STACK TECNOLÓGICO DEFINITIVO

| Tecnología        | Versión | Rol                                  |
| ----------------- | ------- | ------------------------------------ |
| Astro             | ^6.1.9  | Framework principal — SSG            |
| GSAP              | ^3.15.0 | Animaciones (CDN, NO npm bundle)     |
| Lenis             | ^1.3.23 | Smooth scroll (npm, sí en bundle)    |
| Tailwind CSS      | ^4.2.4  | Utilidades de estilo                 |
| @tailwindcss/vite | ^4.2.4  | Plugin oficial Tailwind v4 + Astro 6 |
| Vanilla JS        | —       | Lógica e interacciones               |
| Strapi            | —       | CMS headless (proyectos, pendiente)  |
| Cloudflare Pages  | —       | Deploy y hosting                     |

### Decisiones técnicas críticas ya tomadas:

- **Tailwind v4:** usa `@import "tailwindcss"` + `@theme {}` en CSS. NO `@tailwind base/components/utilities`. NO `tailwind.config.js` funcional.
- **GSAP desde CDN** jsDelivr en el `<head>` del Layout → `window.gsap`, `window.ScrollTrigger`, `window.SplitText` globales.
- **Lenis en bundle** vía npm. Importado en `lenis.js` con guard `typeof window !== 'undefined'`.
- **Hero.astro maneja sus propias animaciones GSAP.** `animations.js` NO llama `initHeroEntrance()` ni `initHeroParallax()` para evitar conflictos.
- **IIFE en scripts inline** para no contaminar el scope global.
- **`100svh`** en lugar de `100vh` para mobile correcto.

---

## 🎨 SISTEMA DE DISEÑO

### Colores

```css
--bg: #080808 --surface: #111111 --surface-2: #181818 --accent: #b388ff
  --accent-dim: #7e57c2 --accent-glow: rgba(179, 136, 255, 0.15)
  --accent-glow-soft: rgba(179, 136, 255, 0.06) --text: #f2f2f2
  --text-muted: #777777 --text-dim: #4a4a4a --border: #1e1e1e
  --border-bright: #2a2a2a --radius: 12px --radius-lg: 20px;
```

### Tipografías (Google Fonts)

```
Syne 700, 800          → --font-display → títulos grandes
DM Sans 400,500,600    → --font-body    → texto corrido
JetBrains Mono 400,500 → --font-mono    → etiquetas, badges, precios
```

### Clases globales definidas en global.css

- `.wrap` → max-width 1240px, margin auto, padding 0 32px
- `.btn-primary` → botón morado sólido reutilizable
- `.btn-ghost` → botón outline reutilizable
- `.accent-italic` → color accent + italic + weight 800
- `.split-title` → clase objetivo para SplitText en animations.js

---

## 📐 MAPA DE SECCIONES

| #   | Componente        | ID           | Estado         |
| --- | ----------------- | ------------ | -------------- |
| —   | Layout.astro      | —            | ✅ Completo    |
| —   | Navbar.astro      | #nav         | ✅ Completo    |
| 1   | Hero.astro        | #inicio      | ✅ Completo    |
| 2   | TechBand.astro    | —            | ✅ Completo    |
| 3   | ScrollStory.astro | #scrollstory | ✅ Completo    |
| 4   | Projects.astro    | #proyectos   | ✅ Completo    |
| 5   | Services.astro    | #servicios   | ✅ Completo    |
| 6   | Metrics.astro     | —            | ✅ Completo    |
| 7   | Process.astro     | #proceso     | ⏳ Pendiente   |
| 8   | Pricing.astro     | #precios     | ⏳ Pendiente   |
| 9   | Contact.astro     | #contacto    | ⏳ Pendiente   |
| 10  | Footer.astro      | —            | ⏳ Pendiente   |
| —   | index.astro       | —            | ⏳ Pendiente   |

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
webture/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.astro        ✅
│   │   ├── Hero.astro          ✅
│   │   ├── TechBand.astro      ✅
│   │   ├── ScrollStory.astro   ✅
│   │   ├── Projects.astro      ✅
│   │   ├── Services.astro      ✅
│   │   ├── Metrics.astro       ✅
│   │   ├── Process.astro       ⏳
│   │   ├── Pricing.astro       ⏳
│   │   ├── Contact.astro       ⏳
│   │   └── Footer.astro        ⏳
│   ├── layouts/
│   │   └── Layout.astro        ✅
│   ├── scripts/
│   │   ├── lenis.js            ✅
│   │   └── animations.js       ✅ (actualizado: no llama Hero animations)
│   ├── styles/
│   │   └── global.css          ✅
│   └── pages/
│       └── index.astro         ⏳
├── astro.config.mjs             ✅
├── tailwind.config.mjs          ✅ (solo referencia, no funcional)
└── package.json                 ✅
```

---

## ✅ ARCHIVOS COMPLETADOS — Detalles técnicos

### `astro.config.mjs`

- Usa `@tailwindcss/vite` como plugin de Vite
- Output: `static`
- Sin `@astrojs/tailwind`

### `global.css` (289 líneas)

- `@import "tailwindcss"` en línea 1
- `@theme {}` define tokens para utilities de Tailwind v4
- `:root {}` define alias cortos para GSAP/JS
- Grain animado con `@keyframes grain` (10 pasos)
- `.btn-primary` y `.btn-ghost` globales
- `prefers-reduced-motion` desactiva todo

### `lenis.js` (26 líneas)

- Guard `typeof window !== 'undefined'`
- Exporta `null` en SSR, instancia real en browser
- Sincronizado con `ScrollTrigger.update`
- `gsap.ticker.lagSmoothing(0)`

### `animations.js` (496 líneas)

- Todas las funciones con guard SSR
- `gsap.matchMedia()` para `prefers-reduced-motion`
- `initProjectsCarousel()` con touch support mobile
- `initTestimonials()` pausa en hover
- `try/catch` en SplitText con fallback
- `initAll()` NO llama `initHeroEntrance()` ni `initHeroParallax()`

### `Layout.astro`

- GSAP desde CDN jsDelivr (3 scripts en `<head>`)
- Fuentes Google: Syne + DM Sans + JetBrains Mono en 1 request
- Meta tags completos: OG, Twitter, robots, canonical, theme-color
- `<html lang="es" class="lenis">`
- `<script type="module">` al final del body importa lenis.js + animations.js

### `Navbar.astro`

- Script IIFE sin GSAP (solo classList + style)
- Scroll listener con `{ passive: true }`
- Estado `.scrolled`: backdrop-blur(20px) + border-bottom
- Burger → X: spans con `transform-origin: center`, `translateY(±7px) rotate(±45deg)`
- Mobile menu: `pointer-events: none` mientras cerrado
- `body.overflow: hidden` cuando menú abierto
- Tecla ESC cierra el menú
- CTA → WhatsApp con URL encoded

### `Hero.astro` (594 líneas)

- 3 capas: `.hero-mesh` (orbes), `.hero-grid` (líneas SVG), contenido
- `.mesh-orb` con `filter: blur(120px)` y animación `orbFloat`
- Grid con `background-image` SVG lines + `mask-image` radial-gradient
- `.hero-visual`: mockup de browser con barras shimmer + score 98
- Marquee: `translateX(-50%)` sobre track duplicado
- Script propio con timeline de entrada + parallax multicapa scrub
- Verifica `prefersReduced` antes de activar parallax
- `100svh` para mobile correcto

### `TechBand.astro`

- Array en frontmatter, `.map()` genera ambas series
- Serie 2 con `aria-hidden="true"`
- Solo CSS animation, sin JS ni GSAP
- `animation-play-state: paused` en hover
- Fades laterales con `mask-image` gradient

---

## 🔄 EN PROGRESO — `ScrollStory.astro`

### Concepto:

- Sección de `300vh` total
- `div.ss-sticky` con `position: sticky; height: 100vh`
- 3 capítulos: El problema / La solución / El resultado
- GSAP `ScrollTrigger` controla qué capítulo es visible según progreso del scroll

### Capítulos:

- **Cap 0:** Gráfico de barras comparativo (Sin web 12% / Plantilla 31% / WebTure 92%)
- **Cap 1:** 3 pillar cards (Velocidad / Diseño / Responsive)
- **Cap 2:** Timeline mini de 4 días (Briefing → Diseño → Desarrollo → Lanzamiento)

### Rail lateral:

- 3 dots clickeables que hacen scroll programático con `lenis.scrollTo()`
- El dot activo tiene glow morado

### Lógica JS:

- `ScrollTrigger.create` con `onUpdate` según `self.progress`
- `< 0.33` → capítulo 0, `< 0.66` → capítulo 1, `>= 0.66` → capítulo 2
- `MutationObserver` detecta cambio de clase y anima con GSAP `fromTo`
- Barras del cap 0 se animan con `transform: scaleX(1)` al activarse
- Importa `lenis` desde `/src/scripts/lenis.js`

---

## ⏳ PENDIENTE — Instrucciones para próximos componentes

### `Projects.astro` (#proyectos)

Datos hardcodeados (Strapi se conecta después):

```js
[
  {
    nombre: "El Fogón Armenio",
    cliente: "Restaurante El Fogón",
    ciudad: "Armenia, Quindío",
    descripcion: "Sitio web con menú digital, reservas online y SEO local.",
    tags: ["Astro", "SEO", "WhatsApp"],
    resultado: "+340% reservas",
    color1: "#b388ff",
    color2: "#7e57c2",
  },
  {
    nombre: "Clínica Sonría",
    cliente: "Clínica Dental Sonría",
    ciudad: "Manizales, Caldas",
    descripcion:
      "Landing de alta conversión para clínica dental con agenda online.",
    tags: ["Astro", "Calendly", "SEO"],
    resultado: "+180% pacientes",
    color1: "#7986cb",
    color2: "#3f51b5",
  },
  {
    nombre: "MiModa Store",
    cliente: "Tienda MiModa",
    ciudad: "Medellín, Antioquia",
    descripcion:
      "E-commerce con catálogo de productos y pasarela de pagos PSE.",
    tags: ["Astro", "Strapi", "PSE"],
    resultado: "$12M primer mes",
    color1: "#f48fb1",
    color2: "#c2185b",
  },
];
```

- Carrusel horizontal con drag (mouse + touch)
- Botones prev/next
- Dots de paginación sincronizados con scroll
- Cards con browser mockup visual en gradiente del color del proyecto

### `Services.astro` (#servicios)

3 tarjetas:

- 01: Páginas personalizadas
- 02: Posicionamiento Google — **featured** con badge "Más popular" + borde accent
- 03: Diseño de conversión
- Entrada staggered con GSAP al entrar al viewport

### `Metrics.astro`

4 contadores con `data-count`:

- `47` Proyectos entregados
- `4` Días promedio de entrega
- `98` % satisfacción
- `230` % aumento en consultas (con sufijo %)
  3 testimonios con auto-rotación cada 4s + dots control

### `Process.astro` (#proceso)

4 pasos: Consulta → Diseño → Desarrollo → Entrega

- SVG path que se "dibuja" con `stroke-dashoffset` al entrar al viewport
- Número decorativo gigante detrás de cada paso (opacity baja)

### `Pricing.astro` (#precios)

3 planes:

- **Básico** $350.000 COP — Landing Page
- **Profesional** $650.000 COP — Sitio Completo — **featured**
- **Premium** $1.100.000 COP — E-commerce / App
- Toggle "Pago único" / "Con mantenimiento mensual"
- CTAs → WhatsApp con mensaje preescrito por plan
- Garantía 7 días devolución

### `Contact.astro` (#contacto)

- H2: "Hablemos de tu sitio esta semana."
- Botón WhatsApp con efecto pulse CSS
- Email: hola@webture.co
- 3 trust stats: <24h respuesta / 4 días entrega / 100% responsive

### `Footer.astro`

- Grid 4 columnas: brand / navegación / servicios / contacto
- "Hecho con ☕ en Armenia, Colombia 🇨🇴"
- Copyright: "© 2025 WebTure · Todos los derechos reservados"

### `index.astro`

Importa todos los componentes en orden. Es el último archivo.

---

## 💰 PRECIOS DEFINIDOS

| Plan                         | Precio         | Entrega  | Destacado      |
| ---------------------------- | -------------- | -------- | -------------- |
| Básico — Landing Page        | $350.000 COP   | 4 días   | —              |
| Profesional — Sitio Completo | $650.000 COP   | 4 días   | ⭐ Más elegido |
| Premium — E-commerce / App   | $1.100.000 COP | 4-7 días | —              |

---

## 🎬 ANIMACIONES GSAP — Mapa completo

| Animación                             | Dónde vive                           | Estado |
| ------------------------------------- | ------------------------------------ | ------ |
| Entrada Hero (timeline stagger)       | Hero.astro script propio             | ✅     |
| Parallax multicapa Hero (scrub)       | Hero.astro script propio             | ✅     |
| Navbar scroll (classList)             | Navbar.astro IIFE                    | ✅     |
| Marquee TechBand (CSS)                | TechBand.astro CSS                   | ✅     |
| ScrollStory capítulos (ScrollTrigger) | ScrollStory.astro script             | 🔄     |
| SplitText títulos (.split-title)      | animations.js initSplitTitles()      | ✅ def |
| Contadores data-count                 | animations.js initCounters()         | ✅ def |
| Process line stroke-dashoffset        | animations.js initProcessLine()      | ✅ def |
| Fade-ups (.fade-up)                   | animations.js initFadeUps()          | ✅ def |
| Carrusel drag Projects                | animations.js initProjectsCarousel() | ✅ def |
| Testimonios auto-rotación             | animations.js initTestimonials()     | ✅ def |

---

## ⚠️ REGLAS QUE DEBEN RESPETARSE EN CADA CHAT

1. **Código siempre completo.** Sin `// ... resto` ni fragmentos. Todo o nada.
2. **Hero.astro es autónomo.** `animations.js` NO toca Hero. Nunca.
3. **GSAP desde CDN, no desde npm bundle.** Usar `window.gsap` globalmente.
4. **Tailwind v4.** `@import "tailwindcss"` + `@theme {}`. No v3 syntax.
5. **Guard SSR en todo JS.** `if (typeof window === 'undefined') return;`
6. **`100svh` para alturas de pantalla completa.** No `100vh`.
7. **Mobile-first.** Breakpoints: 480px / 600px / 768px / 960px / 1200px.
8. **`prefers-reduced-motion`** en todas las animaciones CSS y GSAP.
9. **CSS de cada componente va en su `<style>` propio.** No archivos separados.
10. **Cuando termines un archivo:** escribe `✅ [NombreArchivo] completo. ¿Continúo con [siguiente]?`

---

## 🔁 CÓMO ACTUALIZAR ESTE DOCUMENTO

Cada vez que completes un componente o tomes una decisión técnica nueva:

1. Cambia el estado en el Mapa de Secciones (⏳ → 🔄 → ✅)
2. Cambia el estado en la Estructura de Archivos
3. Mueve el componente de "Pendiente" a "Completados" con sus detalles técnicos
4. Actualiza el Mapa de Animaciones si aplica
5. Actualiza la fecha de "Última actualización" al inicio del documento

---

## 📚 RECURSOS DE REFERENCIA

| Recurso               | URL                      |
| --------------------- | ------------------------ |
| GSAP Docs             | gsap.com/docs            |
| GSAP Ease Visualizer  | gsap.com/ease-visualizer |
| Lenis Docs            | lenis.dev                |
| Codrops Tutoriales    | tympanus.net/codrops     |
| Inspiración principal | lightweight.info/en      |
| Awwwards              | awwwards.com             |
| Astro Docs            | docs.astro.build         |
| Tailwind v4 Docs      | tailwindcss.com/docs     |

---

_Documento generado para continuar el desarrollo de WebTure entre sesiones de chat. Actualizar después de cada componente completado._
