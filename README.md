# Lulitas Designs · Sitio web

Web oficial de **Lulitas Designs** — papelería imprimible y digital, hecha a medida.
Por **Patricia**, desde Argentina 🇦🇷.

> Sitio estático en HTML/CSS/JS vanilla, **sin build**. Deploy directo en
> **GitHub Pages** o **Cloudflare Pages**.

---

## Filosofía

El sitio es una **carta de presentación** y un **puerto de contacto** —
no una tienda. La persona que llega tiene que poder:

1. Entender de un vistazo qué hace Patricia.
2. Ver el portfolio.
3. Pedir un presupuesto en menos de 5 segundos.

No hay carrito ni checkout: cada pedido se cotiza personalmente por
WhatsApp / email / Instagram, porque cada pieza es a medida.

---

## Estructura

```
lulitas-web/
├── index.html                ← home única con todas las secciones
├── pages/                    ← (reservado para subpáginas futuras)
├── _headers                  ← cabeceras Cloudflare Pages
├── _redirects                ← redirecciones
├── robots.txt
├── README.md
└── assets/
    ├── css/
    │   ├── main.css          ← paleta + layout (variables en :root)
    │   └── animations.css    ← reveals, parallax, micro-interacciones
    ├── js/
    │   ├── main.js           ← nav, drawer, smooth-scroll, cursor
    │   └── animations.js     ← IntersectionObserver, count-up, parallax
    └── images/
        └── favicon.svg
```

---

## Branding

Tomado del logo y del feed de Instagram (@lulitas.designs).

### Paleta

| Token             | Hex       | Uso |
|-------------------|-----------|-----|
| `--wine`          | `#5e3023` | Color principal (logo LD) |
| `--wine-deep`     | `#3d1f17` | Footer, títulos profundos |
| `--blush-1` / `2` | `#fce5d8` / `#f7d0bf` | Fondos suaves |
| `--blush-deep`    | `#e08c7a` | Acentos cálidos |
| `--cream`         | `#fcf6f0` | Fondo principal |
| `--pink`, `--mint`, `--sky`, `--butter`, `--lavender` | Pasteles | Stickers, accents |

### Tipografías (Google Fonts, vía CDN)

- **Fraunces** — display serif con personalidad
- **Caveat** — script handwritten para acentos
- **Manrope** — sans-serif para body

---

## Cómo cambiar cosas

### Cambiar email o contacto
- `index.html` — secciones `.contact-cards`, `.footer-col` y los `mailto:`.

### Cambiar paleta
- `assets/css/main.css` — bloque `:root`.

### Agregar / editar servicios
- `index.html` — sección `<section class="services">`. Cada `.service-card`
  es un servicio. Para destacar uno, agregar la clase `service-card-feature`
  y opcionalmente el `<span class="service-flag">Más pedido</span>`.

### Agregar piezas al portfolio
- `index.html` — sección `<section class="portfolio">`. Cada `.pf-card` es
  una pieza. Para imágenes reales, reemplazar el `.pf-mock-*` por un
  `<img src="assets/images/...">` dentro de `.pf-art`.

---

## Deploy

### GitHub Pages

1. Crear repo en GitHub (público o privado con plan).
2. Subir todo este folder.
3. Settings → Pages → Source: **Deploy from branch** → `main` / `(root)`.
4. Esperar al check verde. URL: `https://<user>.github.io/<repo>/`.

### Cloudflare Pages

1. Push a un repo en GitHub.
2. Cloudflare Pages → **Create project** → **Connect to Git** → seleccionar el repo.
3. **Build command**: *(vacío)*
4. **Build output directory**: `/`
5. **Root directory**: `/`
6. Conectar dominio personalizado cuando lo tengas.

Sin build, sin Node, sin dependencias.

---

## Performance & Accesibilidad

- HTML semántico (`<main>`, `<nav>`, `<section>`, `<article>`).
- `prefers-reduced-motion` respetado — las animaciones se desactivan.
- Cursor custom solo en dispositivos con puntero fino (hover habilitado).
- Mobile-first con breakpoints en 520, 880 px.
- Loader con failsafe (se oculta sí o sí a los 2.2 s).
- Fuentes con `display=swap`.

---

## Créditos

- Diseño & desarrollo: **[Vantia Digital](https://vantia.digital)**.
- Branding y todos los productos: **Patricia · Lulitas Designs**.
