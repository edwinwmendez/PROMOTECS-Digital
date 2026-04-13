---
name: design-system
project: PROMOTECS-Digital
version: 1.0.0
created: 2026-04-10
author: edwinwmendez
status: fuente-de-verdad-visual
description: Sistema de diseño oficial de PROMOTECS-Digital. Todo archivo .css y .html debe respetar estos tokens y reglas. Actualización requiere refresh del foundation.
---

# Design System — PROMOTECS-Digital

> Este documento es la **fuente de verdad visual** del proyecto. Cualquier miembro del Grupo 14 que vaya a tocar un `.css` o `.html` debe leerlo antes. Los valores aquí definidos se materializan en `css/tokens.css` como variables CSS y son los únicos valores permitidos en el resto del proyecto.

## Identidad de marca

- **Tono**: Académico-institucional, prestigio, autoridad, confianza.
- **Estilo**: Corporativo peruano, alto contraste, formas geométricas diagonales (esquinas amarillas triangulares recurrentes en piezas oficiales).
- **Combinación dominante**: Navy blue + Gold/Yellow — el combo clásico de instituciones educativas serias.
- **Referencias recurrentes**: Escudos con laureles, ribbons, tipografía condensada en bold, fotos de personas en contextos profesionales.

**Esto NO es un proyecto de startup moderna con gradientes violetas. Es una institución académica peruana formal. El diseño debe reflejarlo.**

---

## 1. Paleta de colores

Los colores se agrupan por **rol semántico**, no por nombre de color.

### Marca / Primario — Navy

```
--color-navy-900   #061A36   textos sobre blanco, hovers profundos
--color-navy-800   #0B2545   fondo del header institucional
--color-navy-700   #13315C   fondo de secciones oscuras
--color-navy-600   #1D3D6F   hovers de botones primarios
--color-navy-500   #2C5282   links, bordes activos
```

### Acento / Dorado — Gold (prestigio, del logo)

```
--color-gold-700   #B8860B   detalles finos, bordes premium
--color-gold-600   #D4A017   tono base del escudo
--color-gold-500   #E5A823   acentos decorativos
```

### CTA / Amarillo — Yellow (llamadas a la acción)

```
--color-yellow-500  #FFC20E   botones "Inscríbete", "Ver más"
--color-yellow-400  #FFD43B   hover de CTAs
--color-yellow-300  #FFE066   highlights, badges
```

### Neutrales

```
--color-white       #FFFFFF
--color-gray-50     #F8FAFC   fondos suaves
--color-gray-100    #F1F5F9   cards, secciones alternas
--color-gray-200    #E2E8F0   bordes, dividers
--color-gray-400    #94A3B8   texto deshabilitado
--color-gray-600    #475569   texto secundario
--color-gray-800    #1E293B   texto principal alternativo
```

### Semánticos (estados del sistema)

```
--color-success   #16A34A   certificado válido
--color-danger    #DC2626   certificado inválido, errores
--color-warning   #F59E0B   advertencias
--color-info      #2563EB   mensajes informativos
```

---

## 2. Tipografía

Dos fuentes, ambas gratuitas en Google Fonts, **obligatoriamente cargadas con preconnect** para cumplir el RNF01 (carga <5s).

### Display — Montserrat

```
Font:    Montserrat
Weights: 700, 800, 900
Uso:     h1, h2, logo-text, CTAs principales
Por qué: Fuente de instituciones académicas modernas. Bold, condensada,
         transmite autoridad. Replica el feeling de las piezas de PROMOTECS
         sin costar licencias.
```

### Body — Inter

```
Font:    Inter
Weights: 400, 500, 600, 700
Uso:     párrafos, labels, botones, nav, tablas
Por qué: Fuente de interfaces modernas por excelencia. Hiper-legible a
         tamaños pequeños. Diseñada para pantallas.
```

### Escala tipográfica (Major Third — 1.250)

```
--text-xs     12px   (0.75rem)    captions, labels
--text-sm     14px   (0.875rem)   texto auxiliar, breadcrumbs
--text-base   16px   (1rem)       BODY DEFAULT
--text-lg     18px   (1.125rem)   párrafos destacados
--text-xl     20px   (1.25rem)    subtítulos de card
--text-2xl    24px   (1.5rem)     h4
--text-3xl    30px   (1.875rem)   h3
--text-4xl    36px   (2.25rem)    h2
--text-5xl    48px   (3rem)       h1
--text-6xl    60px   (3.75rem)    hero display
```

### Carga en HTML

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
```

---

## 3. Espaciado (sistema de 8px)

**Regla de oro**: nunca usar valores arbitrarios. Todo debe salir de esta escala.

```
--space-1     4px     micro separaciones
--space-2     8px     dentro de botones compactos
--space-3    12px     dentro de inputs
--space-4    16px     separación estándar
--space-6    24px     entre elementos de una sección
--space-8    32px     entre secciones pequeñas
--space-12   48px     entre secciones
--space-16   64px     entre bloques mayores
--space-24   96px     padding vertical del hero
--space-32  128px     separaciones épicas
```

---

## 4. Border radius

```
--radius-none    0        bordes rectos
--radius-sm      4px      chips, tags
--radius-md      8px      cards, inputs, botones DEFAULT
--radius-lg     12px      cards destacadas
--radius-xl     16px      modales, hero cards
--radius-full  9999px     badges tipo pill, avatares
```

---

## 5. Sombras

Las sombras usan `navy-800` con opacidad, **no negro puro**. Esta es la diferencia entre un sitio "barato" y uno profesional.

```
--shadow-sm    0 1px 2px rgba(11, 37, 69, 0.05)
--shadow-md    0 4px 6px rgba(11, 37, 69, 0.08)
--shadow-lg    0 10px 20px rgba(11, 37, 69, 0.10)
--shadow-xl    0 20px 40px rgba(11, 37, 69, 0.15)
```

---

## 6. Breakpoints (responsive, mobile-first)

```
mobile   < 640px    base, mobile-first
sm       ≥ 640px    móvil landscape
md       ≥ 768px    tablet
lg       ≥ 1024px   desktop pequeño
xl       ≥ 1280px   desktop estándar
2xl      ≥ 1536px   desktop grande
```

**Mobile-first obligatorio**: se escribe el CSS base para móvil y se agregan `@media (min-width: ...)` para pantallas mayores. **Nunca al revés.**

---

## 7. Principios de uso (las reglas del sistema)

1. **Navy = confianza institucional.** Úsalo en headers, footer, bloques oficiales.
2. **Gold = prestigio.** Úsalo con **MODERACIÓN** — bordes decorativos del logo, separadores, íconos premium. **No es un color de botón.**
3. **Yellow = acción.** Los botones CTA principales van en `--color-yellow-500`. Cuando veas amarillo en la interfaz, significa "haz clic aquí".
4. **Jamás más de 3 colores de marca en una misma sección.** Navy + blanco + un acento (gold **O** yellow). Nunca los tres juntos excepto en el header completo.
5. **Texto principal siempre `navy-900` o `gray-800`** sobre fondos claros. **NUNCA negro puro** — se ve barato y cansa la vista.
6. **Yellow nunca con texto blanco.** `Yellow + white = ilegible.` `Yellow + navy-900 = perfecto.`

---

## 8. Estructura de archivos CSS

```
css/
├── tokens.css         ← Variables CSS (todo este documento materializado)
├── reset.css          ← Normaliza estilos entre navegadores
├── base.css           ← Estilos globales (body, h1-h6, links)
├── components/        ← Componentes reutilizables
│   ├── button.css
│   ├── card.css
│   ├── form.css
│   ├── navbar.css
│   └── badge.css
├── layouts/           ← Estructuras de página
│   ├── header.css
│   └── footer.css
└── pages/             ← Estilos específicos de cada página
    ├── landing.css
    ├── catalogo.css
    ├── inscripcion.css
    ├── validacion.css
    └── contacto.css
```

**Regla**: `tokens.css` se importa primero. Todo el resto usa `var(--...)`. Nadie hard-codea valores.

---

## 9. Ejemplo de uso

```css
/* ❌ INCORRECTO — valores hard-codeados */
.button-primary {
  background: #FFC20E;
  color: #061A36;
  padding: 16px 24px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* ✅ CORRECTO — usando tokens */
.button-primary {
  background: var(--color-yellow-500);
  color: var(--color-navy-900);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  box-shadow: var(--shadow-md);
}
```

---

**Si mañana el cliente dice "cambien el azul", cambias UNA línea en `tokens.css` y todo el sitio se actualiza.** Esa es la diferencia entre un proyecto mantenible y uno que se cae a pedazos.
