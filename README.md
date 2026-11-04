# Portfolio · Ornella Chervo

Sitio estático (HTML + CSS + JS, sin dependencias) publicado en [ornellachervo.com](https://ornellachervo.com) con GitHub Pages.

## Estructura
- `index.html` — la página.
- `css/estilos.css` — estilos (colores en `:root`, el azul es `--azul`).
- `js/proyectos.js` — **textos de los proyectos**: título, categoría, descripción, herramientas, links y video de YouTube. Para cambiar un texto, editá acá.
- `js/main.js` — animaciones e interacciones.
- `img/` — imágenes livianas (WebP) generadas a partir de `assets/` y `assets2/`.

## Sumar o cambiar imágenes
1. Poné los originales en `assets/`.
2. Agregalos a `PROYECTOS` en `tools/optimizar_imagenes.py`.
3. Corré `python3 tools/optimizar_imagenes.py` (necesita Pillow) y actualizá los tamaños de `galeria` en `js/proyectos.js`.

Cada proyecto tiene su propia URL: `ornellachervo.com/#/fungi`.
