# AGENTS.md — Guía de desarrollo para agentes de IA

Este archivo es la fuente de verdad para cualquier agente que trabaje en este codebase.
Toda la información proviene de leer el código real. No hay suposiciones.

---

## 1. Stack tecnológico

| Tecnología            | Versión                          | Rol                                                                                                     |
| --------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Astro**             | `^6.1.9`                         | Framework principal. Genera HTML estático (`output: 'static'`).                                         |
| **Tailwind CSS**      | `^4.2.4`                         | Utilidades CSS. Integrado vía `@tailwindcss/vite`, **no** como plugin de Astro.                         |
| **@tailwindcss/vite** | `^4.2.4`                         | Plugin de Vite que activa Tailwind v4 en el pipeline de Astro.                                          |
| **GSAP**              | `^3.15.0` (npm) / `3.15.0` (CDN) | Animaciones. El paquete npm está declarado pero **el runtime se carga desde jsDelivr CDN** con `defer`. |
| **Lenis**             | `^1.3.23`                        | Smooth scroll. Importado como módulo npm (`import Lenis from 'lenis'`).                                 |
| **Node.js**           | `>=22.12.0`                      | Versión mínima requerida (campo `engines` en package.json).                                             |

**Fuentes de verdad:** `package.json`, `astro.config.mjs`, `src/layouts/Layout.astro`.

---

## 2. Comandos esenciales

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo (astro dev)
npm run build        # Build de producción (astro build)
npm run preview      # Preview del build (astro preview)
```

Fuente: campo `scripts` de `package.json`.

---

## 3. Principios generales de código

Estas reglas aplican a todo código nuevo, sin excepción.

- **DRY**: si un bloque aparece dos veces, extraerlo. Si una clase global ya existe en `global.css`, usarla en lugar de reescribirla.
- **Mínimo código posible**: implementar exactamente lo que el objetivo requiere. Sin abstracciones para casos hipotéticos, sin configuraciones "por si acaso".
- **Happy path primero**: no agregar guards, fallbacks ni validaciones para escenarios que el proyecto no haya demostrado necesitar. Los únicos guards obligatorios son los de SSR (`typeof window === 'undefined'`) y los de CDN (`!window.gsap`) —ambos ya probados por la arquitectura.
- **Una solución, no varias**: elegir el mejor enfoque e implementarlo. No entregar "opción A / opción B" ni código comentado como alternativa.
- **Eliminar código muerto**: no dejar imports sin usar, variables declaradas sin leer, clases CSS sin referencia en el template, ni funciones que nunca se llaman.
- **Legibilidad sobre ingenio**: un bloque directo y explícito vale más que una cadena de `.reduce()` encadenados si el resultado es el mismo.
- **No programación defensiva especulativa**: no capturar errores que no pueden ocurrir, no validar tipos en código interno bien tipado, no añadir `try/catch` a operaciones que no lanzan excepciones.

---

## 4. Decisiones técnicas inamovibles

Estas restricciones son duras. Violarlas rompe el sistema o introduce regresiones.

### 4.1 Tailwind v4 — NO usar sintaxis de v3

Este proyecto usa **Tailwind v4**. El archivo `global.css` usa `@import "tailwindcss"` y el bloque `@theme {}` para definir tokens de diseño. Las clases `bg-bg`, `text-accent`, `font-display`, etc. se generan desde `@theme`.

- ❌ No usar `@tailwind base`, `@tailwind components`, `@tailwind utilities` (sintaxis v3)
- ❌ No usar `@apply` (directiva de v3, eliminada en v4)
- ❌ No instalar `@astrojs/tailwind` (incompatible con Astro 6; fue removido en commit `a3c8959`)
- ❌ No mover la configuración de Tailwind fuera del plugin de Vite

### 4.2 GSAP — CDN obligatorio, no importar desde npm en runtime

GSAP se carga en el `<head>` del layout con `<script is:inline defer src="https://cdn.jsdelivr.net/...">`. Todos los componentes acceden a él vía `window.gsap`, `window.ScrollTrigger` y `window.SplitText`.

- ❌ No hacer `import gsap from 'gsap'` en ningún componente ni script de runtime
- ❌ No mover GSAP al bundle de Vite/npm
- ✅ Siempre leer GSAP desde `window.gsap` dentro de funciones que se ejecutan en `load`

### 4.3 `100svh` — nunca usar `100vh`

El hero y los paneles de ScrollStory usan `min-height: 100svh` y `height: 100svh`. En mobile, `100vh` incluye la barra del navegador y produce overflow visual.

- ❌ No escribir `100vh` en ningún elemento de pantalla completa
- ✅ Usar siempre `100svh`

### 4.4 Guard de SSR obligatorio en todo script con acceso al DOM

Todo script que lea el DOM o `window` debe protegerse en la primera línea:

```js
if (typeof window === "undefined") return;
```

### 4.5 Registro de plugins GSAP — solo en `lenis.js`

`gsap.registerPlugin(ScrollTrigger)` se llama **una sola vez** en `src/scripts/lenis.js`. No registrar plugins en componentes individuales.

### 4.6 Output estático

`astro.config.mjs` declara `output: 'static'`. No cambiar a `server` ni `hybrid` sin revisión completa de la arquitectura.

---

## 5. Estructura de archivos

```
webture/
├── public/                   # Assets estáticos copiados tal cual al build
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── W.webp                # Icono apple-touch
│   └── WebTure.webp          # Logo principal
│
├── src/
│   ├── components/           # Un componente = una sección de la página
│   │   ├── Navbar.astro      # Nav fija + menú mobile + IIFE self-contained
│   │   ├── Hero.astro        # Sección inicial, parallax GSAP self-contained
│   │   ├── TechBand.astro    # Marquee de tecnologías (CSS puro, sin GSAP)
│   │   ├── ScrollStory.astro # Scroll horizontal con GSAP pin (3 paneles)
│   │   ├── Projects.astro    # Carrusel drag/touch; lógica en animations.js
│   │   ├── Services.astro    # Grid de servicios; GSAP self-contained
│   │   ├── Metrics.astro     # Contadores animados + slider de testimonios
│   │   ├── Process.astro     # 4 pasos; GSAP self-contained
│   │   ├── Pricing.astro     # Toggle pago único/mantenimiento + GSAP
│   │   └── Contact.astro     # CTA final con WhatsApp + trust bar
│   │
│   ├── layouts/
│   │   └── Layout.astro      # Shell HTML: meta, OG, fuentes, GSAP CDN, lenis+initAll
│   │
│   ├── pages/
│   │   └── index.astro       # Única página; ensambla todos los componentes
│   │
│   ├── scripts/
│   │   ├── animations.js     # Funciones compartidas: initSplitTitles, initCounters,
│   │   │                     # initProcessLine, initFadeUps, initProjectsCarousel, initAll
│   │   └── lenis.js          # Inicializa Lenis + registra ScrollTrigger + ticker GSAP
│   │
│   └── styles/
│       └── global.css        # Tokens @theme, :root vars, reset, clases globales
│
├── astro.config.mjs           # output: 'static', plugin Tailwind vía Vite
├── tailwind.config.mjs        # Solo content glob; sin theme.extend (tokens en CSS)
├── tsconfig.json              # Extiende astro/tsconfigs/strict
├── AGENTS.md                  # Este archivo
└── package.json
```

---

## 6. Sistema de diseño

Todo el sistema vive en `src/styles/global.css`. Los tokens se declaran en dos lugares sincronizados: el bloque `@theme {}` (genera clases Tailwind) y `:root {}` (accesibles desde GSAP y JS).

### Colores

| Token CSS                                   | Valor                    | Uso                                         |
| ------------------------------------------- | ------------------------ | ------------------------------------------- |
| `--bg` / `--color-bg`                       | `#080808`                | Fondo principal del body                    |
| `--surface` / `--color-surface`             | `#111111`                | Fondo de cards y secciones elevadas         |
| `--surface-2` / `--color-surface-2`         | `#181818`                | Cards anidadas, barras internas             |
| `--accent` / `--color-accent`               | `#b388ff`                | Color primario: botones, highlights, íconos |
| `--accent-dim` / `--color-accent-dim`       | `#7e57c2`                | Hover de accent                             |
| `--accent-glow`                             | `rgba(179,136,255,0.15)` | Solo en `:root`; fondos con glow medio      |
| `--accent-glow-soft`                        | `rgba(179,136,255,0.06)` | Solo en `:root`; fondos con glow sutil      |
| `--text` / `--color-text`                   | `#f2f2f2`                | Texto principal                             |
| `--text-muted` / `--color-text-muted`       | `#777777`                | Texto secundario                            |
| `--text-dim` / `--color-text-dim`           | `#4a4a4a`                | Texto muy apagado (labels, meta)            |
| `--border` / `--color-border`               | `#1e1e1e`                | Bordes sutiles                              |
| `--border-bright` / `--color-border-bright` | `#2a2a2a`                | Bordes sobre surface                        |

**Regla de uso**: siempre usar el token (`var(--accent)`) en lugar del valor hex. Las únicas excepciones aceptadas son colores sin token en el sistema: `#000` (negro de contraste sobre accent), `#25D366` (verde de marca WhatsApp), y los colores decorativos de los dots macOS (`#ff5f57`, `#febc2e`, `#28c840`).

### Tipografías

| Variable         | Familia        | Pesos cargados                  |
| ---------------- | -------------- | ------------------------------- |
| `--font-display` | Syne           | 700, 800                        |
| `--font-body`    | DM Sans        | 400, 500, 600 (normal + italic) |
| `--font-mono`    | JetBrains Mono | 400, 500                        |

Las fuentes se cargan desde Google Fonts con el patrón `media="print" onload="this.media='all'"` para no bloquear el render.

### Radios

| Variable      | Valor  | Uso                                            |
| ------------- | ------ | ---------------------------------------------- |
| `--radius`    | `12px` | Componentes pequeños (inputs, badges, botones) |
| `--radius-lg` | `20px` | Cards grandes, modales, paneles                |

### Breakpoints

| Nombre informal | Valor              | Descripción                        |
| --------------- | ------------------ | ---------------------------------- |
| Mobile pequeño  | `max-width: 479px` | Ajustes extra-pequeños             |
| Mobile          | `max-width: 767px` | Layout de una columna, menú burger |
| Tablet          | `max-width: 959px` | Grids pasan a 2 columnas           |

### Clases globales reutilizables

| Clase            | Descripción                                                                           |
| ---------------- | ------------------------------------------------------------------------------------- |
| `.wrap`          | Contenedor centrado: `max-width: 1240px`, padding `32px` → `24px` → `20px`            |
| `.btn-primary`   | Botón sólido accent, `color: #000`                                                    |
| `.btn-ghost`     | Botón outline, `border: 1px solid --border-bright`                                    |
| `.accent-italic` | `<em>` con `color: var(--accent)`, `font-style: italic`, `font-weight: 800`           |
| `.fade-up`       | Estado inicial de animación GSAP (`opacity: 0; transform: translateY(32px)`)          |
| `.label`         | Eyebrow text: uppercase, `font-size: 0.75rem`, `letter-spacing: 0.12em`, color accent |
| `.sr-only`       | Visualmente oculto, accesible para screen readers                                     |
| `.skip-link`     | Enlace "Saltar al contenido", visible solo con foco                                   |

---

## 7. Estilo de código

### Estructura de archivos `.astro`

Cada componente sigue esta estructura obligatoria:

```
---
// frontmatter: TypeScript/JS para lógica de build y datos estáticos
// Props, constantes, arrays de contenido
---

<!-- Template: HTML puro + expresiones Astro -->

<style>
  /* Scoped por defecto en Astro — NO añadir :global() sin necesidad */
  /* Comentarios de sección con ─── patrón */
</style>

<script>
  /* Script del componente */
</script>
```

### Convenciones

- **Frontmatter en español**: comentarios de lógica y datos en español.
- **CSS scoped siempre**: todos los estilos van dentro del `<style>` del componente. `global.css` es solo para tokens y clases verdaderamente transversales. No crear archivos CSS adicionales.
- **Sin estilos inline en el template**: no usar `style="color: red"` ni equivalentes para lógica de diseño. La única excepción son las CSS custom properties dinámicas que GSAP o el template necesitan: `style={`--c1: ${color1}`}`.
- **Datos en frontmatter**: arrays de contenido (cards, pasos, planes) se declaran como `const` en el frontmatter y se renderizan con `.map()` en el template.
- **SVGs inline**: todos los íconos son SVGs inline con `aria-hidden="true"` en los decorativos.
- **Separadores de sección CSS**: usar `/* ─── Nombre ─────────────── */` con guiones largos (─).
- **Tokens sobre valores literales**: usar `var(--accent)` en lugar de `#b388ff`, `var(--radius)` en lugar de `12px`, etc.
- **TypeScript strict**: el tsconfig extiende `astro/tsconfigs/strict`. No usar `any` sin justificación.

---

## 8. Reglas de animaciones

### Cómo se carga GSAP

GSAP se carga en `Layout.astro` con tres scripts `is:inline defer` desde jsDelivr:

```html
<script
  is:inline
  defer
  src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"
></script>
<script
  is:inline
  defer
  src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"
></script>
<script
  is:inline
  defer
  src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js"
></script>
```

`is:inline` evita que Astro envuelva los scripts en módulos intermedios (elimina un waterfall). `defer` garantiza orden de ejecución.

### Patrón obligatorio para cualquier script con GSAP

```js
function initAlgo() {
  if (typeof window === "undefined") return; // guard SSR
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return; // guard carga CDN
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // guard a11y
  // ... lógica de animación
}

if (document.readyState === "complete") {
  initAlgo();
} else {
  window.addEventListener("load", initAlgo, { once: true });
}
```

El doble check de `readyState` existe porque los scripts GSAP son `defer`: cuando el módulo del componente se ejecuta, GSAP puede ya estar disponible o no, dependiendo del orden de carga.

### Qué anima cada parte

| Lugar                                      | Qué anima                               | Cómo                              |
| ------------------------------------------ | --------------------------------------- | --------------------------------- |
| `animations.js` → `initSplitTitles()`      | Elementos `.split-title` (chars 3D)     | GSAP + SplitText, ScrollTrigger   |
| `animations.js` → `initCounters()`         | Elementos `[data-count]`                | GSAP tween de objeto numérico     |
| `animations.js` → `initProcessLine()`      | `.process-line path` (SVG stroke)       | `strokeDashoffset` + scrub        |
| `animations.js` → `initFadeUps()`          | Todos los `.fade-up`                    | GSAP stagger agrupado por padre   |
| `animations.js` → `initProjectsCarousel()` | `.proj-track` (drag + dots)             | GSAP entrada + scroll nativo      |
| `Navbar.astro`                             | Scroll `.scrolled`, burger, menú mobile | IIFE self-contained, sin GSAP     |
| `Hero.astro`                               | Entrada timeline + parallax scrub       | GSAP self-contained, `load`       |
| `ScrollStory.astro`                        | Scroll horizontal pin                   | GSAP `pin: true`, `scrub: 1`      |
| `Services.astro`                           | Header + cards fade                     | GSAP self-contained               |
| `Metrics.astro`                            | Métricas + testimonios + rotación       | GSAP + setInterval self-contained |
| `Process.astro`                            | Header + cards                          | GSAP self-contained               |
| `Pricing.astro`                            | Header + toggle + cards                 | GSAP self-contained               |
| `Contact.astro`                            | Timeline completo                       | GSAP self-contained               |
| `TechBand.astro`                           | Marquee                                 | CSS `animation: techmarquee` puro |

### Registro de plugins

`gsap.registerPlugin(ScrollTrigger)` ocurre **solo en `lenis.js`**, nunca en los componentes.

### `will-change`

- `will-change: transform` solo en `.ss-track` y `body::after` (grain animado).
- En mobile (`max-width: 767px`): `will-change: auto` en ambos — desactivar explícitamente para no crear capas GPU innecesarias.

---

## 9. Commits

Usar **Conventional Commits** en todos los commits.

```
tipo(scope): descripción en imperativo, minúsculas, sin punto final
```

### Tipos válidos

| Tipo       | Cuándo usarlo                                                              |
| ---------- | -------------------------------------------------------------------------- |
| `feat`     | Nueva funcionalidad o componente                                           |
| `fix`      | Corrección de bug                                                          |
| `style`    | Cambios visuales sin lógica (CSS, espaciado)                               |
| `refactor` | Reorganización de código sin cambio de comportamiento                      |
| `chore`    | Dependencias, configuración, archivos de proyecto                          |
| `docs`     | Cambios en documentación (`AGENTS.md`, `Webture_Proyecto.md`, `README.md`) |

### Ejemplos

```
feat(hero): add parallax entrance animation
fix(navbar): correct mobile menu z-index overlap
style(pricing): increase card padding on mobile
refactor(animations): extract counter logic to initCounters
chore(deps): update lenis to 1.3.23
docs(agents): add commit conventions section
```

### Reglas

- El scope es el nombre del componente o módulo afectado: `hero`, `navbar`, `animations`, `global`, `layout`, etc.
- La descripción describe el **qué** en imperativo: "add", "fix", "remove", no "added" ni "fixes".
- No mencionar Claude, Copilot ni ningún agente de IA en los mensajes de commit.
- No agrupar cambios no relacionados en un solo commit.

---

## 10. Flujo de trabajo

- **Una rama por componente o feature**: nombrar `feat/nombre-componente` o `fix/descripcion-bug`.
- **Un solo componente por commit** salvo que los cambios sean directamente dependientes (ej: un token en `global.css` que requiere actualizar el componente que lo usa).
- **Al terminar un componente**, actualizar su estado en `Webture_Proyecto.md`.
- **No editar `Layout.astro` en el mismo commit** que un componente individual, a menos que el cambio en el layout sea requisito directo del componente.

---

## 11. Patrones prohibidos

```
❌ Entregar código fragmentado con "// ... resto del código" o "// igual que antes"
❌ import gsap from 'gsap'  — siempre usar window.gsap
❌ gsap.registerPlugin() en componentes — solo en lenis.js
❌ height: 100vh en elementos de pantalla completa — usar 100svh
❌ @tailwind base / components / utilities — sintaxis de v3
❌ @apply — directiva de v3, no existe en v4
❌ @astrojs/tailwind — incompatible con Astro 6
❌ CSS fuera de <style> del componente o de global.css
❌ Estilos inline en el template para lógica de diseño
❌ Valores hex hardcodeados cuando existe un token equivalente
❌ Añadir will-change: transform a elementos que no animan con GPU
❌ will-change activo en mobile — desactivar con will-change: auto
❌ Variables globales en window sin documentar: window.__lenis es la
   única existente; cualquier nueva debe justificarse
❌ ScrollTrigger.create() sin once: true en animaciones de entrada
❌ Leer window.gsap a nivel de módulo (fuera de funciones) — puede no estar cargado
❌ Múltiples versiones alternativas del mismo bloque de código
❌ Código muerto: imports sin usar, vars sin leer, CSS sin referencia
❌ Guards especulativos para casos que el proyecto no ha demostrado necesitar
❌ Crear nuevas páginas sin importar Layout.astro como wrapper
❌ Mencionar Claude, Copilot u otros agentes en mensajes de commit
```

---

## 12. Accesibilidad y rendimiento

### `prefers-reduced-motion`

`global.css` tiene una regla global que desactiva todas las animaciones CSS:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .fade-up {
    opacity: 1;
    transform: none;
  }
}
```

Cada componente con GSAP tiene además su propio guard en JS (ver sección 8). Los contadores muestran el valor final directamente; los marquees pasan a `flex-wrap: wrap` y ocultan el set duplicado.

### `aria-hidden` en elementos decorativos

Toda decoración visual puramente visual lleva `aria-hidden="true"`:

- Orbes de fondo (`.hero-mesh`)
- Grid de fondo (`.hero-grid`)
- SVGs de íconos en botones y listados
- Serie duplicada de TechBand y Hero marquee

### Elementos interactivos

- El menú mobile (`#navMobile`) usa `role="dialog"`, `aria-modal="true"`, `aria-hidden`, `inert` y un **focus trap** completo en el IIFE de `Navbar.astro`.
- Los carruseles (proyectos, testimonios) usan `role="tablist"` en los dots y `aria-selected` en cada dot.
- El botón pausa/play de testimonios actualiza `aria-pressed` y `aria-label` dinámicamente.
- Existe un `.skip-link` en el body que salta a `#main-content`.
- `section[id]` tiene `scroll-margin-top: 80px` para compensar el nav fijo.

### Rendimiento

- Fuentes cargadas con `media="print" onload="this.media='all'"` (non-blocking).
- `<link rel="preconnect">` para fonts.googleapis.com, fonts.gstatic.com y cdn.jsdelivr.net.
- En mobile (`max-width: 767px`): orbes con `animation: none` y `will-change: auto`; grain estático; ScrollStory en layout vertical sin GSAP pin.

---

## 13. Cómo entregar código

1. **Archivos completos siempre.** Nunca fragmentos con `// ... resto del código`, `// igual que antes` ni `// código anterior sin cambios`. Si el archivo tiene 600 líneas, entregar las 600 líneas.

2. **Un archivo a la vez.** Terminar un archivo antes de empezar el siguiente.

3. **Si un archivo supera 400 líneas**, entregarlo por secciones claramente delimitadas con un encabezado (`--- Sección: <style> ---`) pero sin omitir ninguna línea.

4. **Al terminar cada archivo escribir:** `✅ [NombreArchivo.astro] completo. ¿Continúo con [siguiente]?`

5. **No crear archivos de planificación ni documentos intermedios.** Trabajar desde el contexto de la conversación.

6. **Verificar tokens antes de escribir** un color o fuente: usar `var(--accent)`, `var(--font-display)`, etc. No hardcodear hex que tenga token equivalente.

7. **Nuevos componentes**: seguir la estructura `frontmatter → template → <style> → <script>` observada en los componentes existentes.

8. **Nuevas secciones con animaciones**: encapsular en `initNombreSeccion()` con el patrón de guard completo (SSR + CDN + reduced-motion) y el doble check de `readyState`. Decidir si la lógica va en `animations.js` (si es compartida) o en el propio componente (si es self-contained).
