/* =========================================================
   Ornella Chervo · Portfolio 2026 · interacciones
   ========================================================= */
(() => {
    const P = window.PROYECTOS;
    const $ = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];
    const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const punteroFino = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const num = (i) => String(i + 1).padStart(2, '0');
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const img = (slug, archivo) => `img/${slug}/${archivo}.webp`;
    const lerp = (a, b, t) => a + (b - a) * t;
    const flecha = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5l7-7m0 0H5.5m6 0v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    /* ---------- Título: letras que aparecen ---------- */
    let n = 0;
    $$('[data-partir]').forEach((el) => {
        const texto = el.textContent.trim();
        el.textContent = '';
        el.setAttribute('aria-hidden', 'true');
        for (const ch of texto) {
            const s = document.createElement('span');
            s.className = 'letra';
            s.style.setProperty('--i', n++);
            s.textContent = ch;
            el.appendChild(s);
        }
    });

    /* ---------- Luz que sigue al cursor en la portada ---------- */
    const hero = $('.hero');
    if (punteroFino) {
        const luz = $('.hero-luz');
        hero.addEventListener('pointermove', (e) => {
            const r = hero.getBoundingClientRect();
            luz.style.setProperty('--mx', `${e.clientX - r.left}px`);
            luz.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    }

    /* ---------- Abanico de cartas ---------- */
    const abanico = $('#abanico');
    // Orden de las cartas: las portadas más llamativas quedan al centro
    const ORDEN_ABANICO = ['deartentonine', 'squizo', 'metal-y-piedra', 'hockey-di-tella', 'el-viaje-de-totoro', 'fungi',
        'el-viaje-de-ulises', 'caprichismo', 'sync', 'fast-fashion', 'giroptico', 'revista-kill-bill', 'oniria'];
    const enAbanico = ORDEN_ABANICO.map((s) => P.find((p) => p.slug === s)).filter(Boolean);
    P.forEach((p) => { if (!enAbanico.includes(p)) enAbanico.push(p); });
    abanico.innerHTML = enAbanico.map((p, i) => `
        <a class="carta entrando" href="#/${p.slug}" data-i="${i}" aria-label="Ver ${esc(p.titulo)}">
            <span class="carta-etiqueta">${esc(p.titulo)}</span>
            <span class="carta-img"><img src="${img(p.slug, 'mini')}" width="520" height="390" alt="" decoding="async"></span>
        </a>`).join('');
    const cartas = $$('.carta', abanico);
    const medio = (cartas.length - 1) / 2;
    let hover = -1, balanceo = 0, ultimoMovimiento = 0;

    function paso() { return innerWidth < 640 ? 6.2 : innerWidth < 1100 ? 5 : 5.4; }

    function ubicarCartas() {
        const st = paso();
        cartas.forEach((c, i) => {
            let rot = (i - medio) * st + balanceo;
            let y = 0, s = 1;
            if (hover >= 0) {
                const d = i - hover;
                if (d === 0) { y = innerWidth < 640 ? -24 : -44; s = 1.06; }
                else {
                    const caida = Math.exp(-Math.abs(d) / 1.6);
                    rot += Math.sign(d) * 3.2 * caida;
                    y = -10 * caida;
                }
            }
            c.style.setProperty('--rot', `${rot.toFixed(2)}deg`);
            c.style.setProperty('--y', `${y}px`);
            c.style.setProperty('--s', s);
            c.style.zIndex = i === hover ? 100 : 50 - Math.round(Math.abs(i - medio));
        });
        hero.classList.toggle('con-carta', hover >= 0);
    }

    // Entrada: las cartas suben desde abajo y se abren del centro hacia afuera
    requestAnimationFrame(() => {
        ubicarCartas();
        cartas.forEach((c, i) => {
            c.style.transitionDelay = sinMovimiento ? '0ms' : `${700 + Math.abs(i - medio) * 70}ms`;
        });
        requestAnimationFrame(() => {
            cartas.forEach((c) => c.classList.remove('entrando'));
            setTimeout(() => cartas.forEach((c) => (c.style.transitionDelay = '')), 1800);
        });
    });

    cartas.forEach((c, i) => {
        c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hover = i; ubicarCartas(); } });
        c.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hover = -1; ubicarCartas(); } });
        c.addEventListener('focus', () => { hover = i; ubicarCartas(); });
        c.addEventListener('blur', () => { hover = -1; ubicarCartas(); });
    });

    if (punteroFino) {
        hero.addEventListener('pointermove', (e) => {
            ultimoMovimiento = performance.now();
            const nuevo = ((e.clientX / innerWidth) - 0.5) * -7;
            if (Math.abs(nuevo - balanceo) > 0.25) { balanceo = nuevo; ubicarCartas(); }
        });
    }
    // Balanceo suave cuando nadie toca nada: la mano de cartas "respira"
    if (!sinMovimiento) {
        setInterval(() => {
            if (document.hidden || hover >= 0 || performance.now() - ultimoMovimiento < 2500) return;
            if (hero.getBoundingClientRect().bottom < 0) return;
            balanceo = Math.sin(performance.now() / 1600) * 2.4;
            ubicarCartas();
        }, 450);
    }
    addEventListener('resize', ubicarCartas);

    /* ---------- Navegación ---------- */
    const nav = $('#nav');
    const navLinks = $('.nav-links');
    const resaltado = $('.nav-resaltado');
    $$('a', navLinks).forEach((a) => {
        a.addEventListener('pointerenter', () => {
            resaltado.style.width = `${a.offsetWidth}px`;
            resaltado.style.transform = `translateX(${a.offsetLeft}px)`;
            resaltado.style.opacity = 1;
        });
    });
    navLinks.addEventListener('pointerleave', () => (resaltado.style.opacity = 0));

    const contacto = $('#contacto');
    const marca = $('.marca-gigante');
    function alScrollear() {
        const sobreAzul = scrollY < hero.offsetHeight - 40;
        nav.classList.toggle('solida', !sobreAzul);
        const r = contacto.getBoundingClientRect();
        if (r.top < innerHeight) {
            const prog = Math.min(1, Math.max(0, (innerHeight - r.top) / r.height));
            marca.style.setProperty('--marca-y', `${(1 - prog) * 40}%`);
        }
    }
    addEventListener('scroll', alScrollear, { passive: true });
    alScrollear();

    /* ---------- Grilla e índice ---------- */
    const grilla = $('#grilla');
    const indice = $('#indice');
    grilla.innerHTML = P.map((p, i) => `
        <a class="tarjeta revelar" href="#/${p.slug}" data-slug="${p.slug}" style="view-transition-name: t-${p.slug}">
            <div class="tarjeta-media">
                <img src="${img(p.slug, 'portada')}" width="1200" height="900" alt="${esc(p.titulo)} – ${esc(p.cat)}" loading="lazy" decoding="async">
                <span class="tarjeta-flecha">${flecha}</span>
            </div>
            <div class="tarjeta-pie">
                <span class="tarjeta-num">${num(i)}</span>
                <h3 class="tarjeta-titulo">${esc(p.titulo)}</h3>
                <span class="tarjeta-cat">${esc(p.cat)}</span>
            </div>
        </a>`).join('');
    indice.innerHTML = P.map((p, i) => `
        <li data-slug="${p.slug}">
            <a class="fila" href="#/${p.slug}" data-slug="${p.slug}">
                <span class="fila-num">${num(i)}</span>
                <span class="fila-titulo">${esc(p.titulo)}</span>
                <span class="fila-cat">${esc(p.cat)}</span>
                <span class="fila-flecha">${flecha}</span>
            </a>
        </li>`).join('');

    /* ---------- Controles segmentados (pastilla que se desliza) ---------- */
    function moverPastilla(grupo) {
        const activo = $('[aria-selected="true"]', grupo);
        const pastilla = $('.segmentado-pastilla', grupo);
        pastilla.style.width = `${activo.offsetWidth}px`;
        pastilla.style.transform = `translateX(${activo.offsetLeft}px)`;
    }
    function seleccionar(grupo, boton) {
        $$('button', grupo).forEach((b) => b.setAttribute('aria-selected', b === boton));
        moverPastilla(grupo);
    }
    const filtros = $('#filtros');
    const vistas = $('#vistas');
    const conteo = $('#conteo');
    let filtroActual = 'todos';

    function aplicarFiltro(f) {
        filtroActual = f;
        let visibles = 0;
        P.forEach((p) => {
            const ok = f === 'todos' || p.filtros.includes(f);
            if (ok) visibles++;
            $(`.tarjeta[data-slug="${p.slug}"]`, grilla).hidden = !ok;
            $(`li[data-slug="${p.slug}"]`, indice).hidden = !ok;
        });
        conteo.textContent = visibles;
        $$('.tarjeta', grilla).forEach((t) => t.classList.add('visto'));
    }
    filtros.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || b.dataset.filtro === filtroActual) return;
        seleccionar(filtros, b);
        filtros.scrollTo({ left: b.offsetLeft - filtros.clientWidth / 2 + b.offsetWidth / 2, behavior: 'smooth' });
        if (document.startViewTransition && !sinMovimiento) document.startViewTransition(() => aplicarFiltro(b.dataset.filtro));
        else aplicarFiltro(b.dataset.filtro);
    });
    vistas.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || b.getAttribute('aria-selected') === 'true') return;
        seleccionar(vistas, b);
        const cambiar = () => {
            const lista = b.dataset.vista === 'indice';
            grilla.hidden = lista;
            indice.hidden = !lista;
            $$('.tarjeta', grilla).forEach((t) => t.classList.add('visto'));
        };
        if (document.startViewTransition && !sinMovimiento) document.startViewTransition(cambiar);
        else cambiar();
    });
    const acomodarPastillas = () => { moverPastilla(filtros); moverPastilla(vistas); };
    addEventListener('resize', acomodarPastillas);
    document.fonts && document.fonts.ready.then(acomodarPastillas);
    acomodarPastillas();

    $('#sorprendeme').addEventListener('click', () => {
        const actual = location.hash.slice(2);
        let p;
        do { p = P[Math.floor(Math.random() * P.length)]; } while (p.slug === actual);
        location.hash = `#/${p.slug}`;
    });

    /* ---------- Revelado al hacer scroll ---------- */
    const observador = new IntersectionObserver((entradas) => {
        let k = 0;
        entradas.forEach((en) => {
            if (!en.isIntersecting) return;
            en.target.style.setProperty('--retraso', `${Math.min(k++, 4) * 80}ms`);
            en.target.classList.add('visto');
            observador.unobserve(en.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.revelar').forEach((el) => observador.observe(el));

    /* ---------- Burbuja "Ver proyecto" y vista previa del índice ---------- */
    if (punteroFino && !sinMovimiento) {
        const burbuja = $('#burbuja');
        const previa = $('#vista-previa');
        const previaImg = $('img', previa);
        const m = { x: -300, y: -300 };
        const b = { x: -300, y: -300, s: 0, ts: 0 };
        const v = { x: -300, y: -300, s: 0, ts: 0, giro: 0 };
        let corriendo = false;

        addEventListener('pointermove', (e) => {
            m.x = e.clientX; m.y = e.clientY;
            const t = e.target;
            b.ts = t.closest && t.closest('.tarjeta-media') && !document.body.classList.contains('hoja-abierta') ? 1 : 0;
            const fila = t.closest && t.closest('.fila');
            v.ts = fila && !document.body.classList.contains('hoja-abierta') ? 1 : 0;
            if (fila) {
                const src = img(fila.dataset.slug, 'mini');
                if (!previaImg.src.endsWith(src)) previaImg.src = src;
            }
            if (!corriendo && (b.ts || v.ts || b.s > 0.01 || v.s > 0.01)) { corriendo = true; requestAnimationFrame(bucle); }
        }, { passive: true });

        function bucle() {
            const vx = m.x - v.x;
            b.x = lerp(b.x, m.x, 0.22); b.y = lerp(b.y, m.y, 0.22); b.s = lerp(b.s, b.ts, 0.18);
            v.x = lerp(v.x, m.x, 0.12); v.y = lerp(v.y, m.y, 0.12); v.s = lerp(v.s, v.ts, 0.16);
            v.giro = lerp(v.giro, Math.max(-12, Math.min(12, vx * 0.08)), 0.15);
            burbuja.style.transform = `translate(${b.x}px, ${b.y}px) scale(${0.6 + 0.4 * b.s})`;
            burbuja.style.opacity = b.s;
            previa.style.transform = `translate(${v.x + 40}px, ${v.y}px) rotate(${v.giro}deg) scale(${0.85 + 0.15 * v.s})`;
            previa.style.opacity = v.s;
            if (b.ts || v.ts || b.s > 0.01 || v.s > 0.01) requestAnimationFrame(bucle);
            else {
                corriendo = false;
                burbuja.style.opacity = previa.style.opacity = 0;
            }
        }
    }

    /* ---------- Hoja de proyecto ---------- */
    const app = $('#app');
    const capa = $('#hoja-capa');
    const hoja = $('#hoja');
    const cabecera = $('#hoja-cabecera');
    const scroller = $('#hoja-scroll');
    const contenido = $('#hoja-contenido');
    const contador = $('#hoja-contador');
    const miniTitulo = $('#hoja-mini-titulo');
    let abierta = false, actual = -1, disparador = null, entroDesdeElSitio = false, timerCierre;

    function galeriaHTML(p) {
        const g = p.galeria;
        const partes = [];
        for (let i = 0; i < g.length; i++) {
            const [w, h] = g[i];
            const vertical = w / h < 1.15;
            const siguienteVertical = g[i + 1] && g[i + 1][0] / g[i + 1][1] < 1.15;
            const fig = (k, clase) => `<figure class="revelar-hoja ${clase}"><img src="${img(p.slug, num(k))}" width="${g[k][0]}" height="${g[k][1]}" alt="${esc(p.titulo)} – imagen ${k + 1}" loading="lazy" decoding="async"></figure>`;
            if (vertical && siguienteVertical) { partes.push(fig(i, ''), fig(i + 1, '')); i++; }
            else partes.push(fig(i, 'ancha'));
        }
        return partes.join('');
    }

    function render(i) {
        const p = P[i];
        const sig = P[(i + 1) % P.length];
        const meta = [
            `<div><h3>Herramientas</h3><ul class="chips">${p.herramientas.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`,
            `<div><h3>Áreas</h3><ul class="chips">${p.areas.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`,
            p.links.length ? `<div><h3>Ver más</h3><ul class="p-links">${p.links.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener">${esc(l.texto)} ↗</a></li>`).join('')}</ul></div>` : '',
        ].join('');
        contenido.innerHTML = `
            <header class="p-cabecera">
                <p class="p-cat">${esc(p.cat)}</p>
                <h2 class="p-titulo" id="hoja-titulo">${esc(p.titulo)}</h2>
                ${p.subtitulo ? `<p class="p-sub">${esc(p.subtitulo)}</p>` : ''}
            </header>
            <div class="p-cuerpo">
                <p class="p-desc">${esc(p.desc)}</p>
                <aside class="p-meta">${meta}</aside>
            </div>
            ${p.video ? `
            <div class="p-video">
                <img src="${img(p.slug, 'portada')}" alt="">
                <button type="button" data-video="${p.video}" aria-label="Reproducir el video de ${esc(p.titulo)}">
                    <span class="play"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>Ver video</span>
                </button>
            </div>` : ''}
            <div class="p-galeria">${galeriaHTML(p)}</div>
            <a class="p-siguiente" href="#/${sig.slug}" data-reemplazar>
                <span><small>Siguiente proyecto</small><strong>${esc(sig.titulo)}</strong></span>
                <img src="${img(sig.slug, 'mini')}" alt="" loading="lazy">
            </a>`;
        contador.textContent = `${num(i)} / ${P.length}`;
        miniTitulo.textContent = p.titulo;
        document.title = `${p.titulo} · Ornella Chervo`;
        scroller.scrollTop = 0;
        cabecera.classList.remove('con-borde');
        observarHoja();
    }

    // Revelado de las imágenes dentro de la hoja
    let obsHoja;
    function observarHoja() {
        obsHoja && obsHoja.disconnect();
        const figuras = $$('.revelar-hoja', contenido);
        if (sinMovimiento) return;
        figuras.forEach((f) => f.classList.add('revelar'));
        obsHoja = new IntersectionObserver((ents) => {
            ents.forEach((en) => {
                if (en.isIntersecting) { en.target.classList.add('visto'); obsHoja.unobserve(en.target); }
            });
        }, { root: scroller, threshold: 0.08 });
        figuras.forEach((f) => obsHoja.observe(f));
    }

    function abrir(i, instantaneo = false) {
        if (abierta) {
            if (i === actual) return;
            actual = i;
            if (instantaneo || sinMovimiento) { render(i); return; }
            contenido.classList.add('cambiando');
            setTimeout(() => { render(i); requestAnimationFrame(() => contenido.classList.remove('cambiando')); }, 160);
            return;
        }
        clearTimeout(timerCierre);
        actual = i;
        disparador = document.activeElement;
        render(i);
        app.style.transformOrigin = `50% ${scrollY + innerHeight / 2}px`;
        const anchoBarra = innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = anchoBarra ? `${anchoBarra}px` : '';
        document.body.classList.add('bloqueado', 'hoja-abierta');
        app.inert = true; nav.inert = true;
        capa.hidden = false; hoja.hidden = false;
        hoja.offsetHeight; // reflow para que la transición arranque
        capa.classList.add('visible');
        hoja.classList.add('visible');
        abierta = true;
        hoja.setAttribute('tabindex', '-1');
        hoja.focus({ preventScroll: true });
    }

    function cerrar() {
        if (!abierta) return;
        abierta = false;
        hoja.style.removeProperty('--arrastre');
        capa.style.opacity = '';
        capa.classList.remove('visible');
        hoja.classList.remove('visible');
        document.body.classList.remove('hoja-abierta');
        document.title = 'Ornella Chervo | Diseñadora Integral en CABA – Branding, Redes y Audiovisual';
        timerCierre = setTimeout(() => {
            capa.hidden = true; hoja.hidden = true;
            document.body.classList.remove('bloqueado');
            document.body.style.paddingRight = '';
            app.inert = false; nav.inert = false;
            app.style.transformOrigin = '';
            contenido.innerHTML = '';
            if (disparador && disparador.focus) disparador.focus({ preventScroll: true });
        }, sinMovimiento ? 0 : 500);
    }

    // Botón cerrar / capa / Esc: si llegamos desde el sitio, volvemos en el historial
    function pedirCierre() {
        if (entroDesdeElSitio) { entroDesdeElSitio = false; history.back(); }
        else { history.replaceState(null, '', location.pathname + location.search); cerrar(); }
    }
    function ir(delta, instantaneo = false) {
        const i = (actual + delta + P.length) % P.length;
        history.replaceState(null, '', `#/${P[i].slug}`);
        abrir(i, instantaneo);
    }

    function ruta() {
        const m = location.hash.match(/^#\/([\w-]+)/);
        const i = m ? P.findIndex((p) => p.slug === m[1]) : -1;
        if (i >= 0) abrir(i);
        else cerrar();
    }
    addEventListener('hashchange', ruta);
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href^="#/"]');
        if (!a) return;
        if (a.hasAttribute('data-reemplazar') || abierta) {
            e.preventDefault();
            history.replaceState(null, '', a.getAttribute('href'));
            ruta();
            return;
        }
        entroDesdeElSitio = true;
    });
    ruta();

    $('#hoja-cerrar').addEventListener('click', pedirCierre);
    $('#hoja-anterior').addEventListener('click', () => ir(-1));
    $('#hoja-siguiente').addEventListener('click', () => ir(1));
    capa.addEventListener('click', pedirCierre);

    scroller.addEventListener('scroll', () => {
        cabecera.classList.toggle('con-borde', scroller.scrollTop > 120);
    }, { passive: true });

    contenido.addEventListener('click', (e) => {
        const v = e.target.closest('[data-video]');
        if (v) {
            const caja = v.parentElement;
            caja.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.dataset.video}?autoplay=1&rel=0" title="Video del proyecto" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
            return;
        }
        const f = e.target.closest('.p-galeria figure');
        if (f) abrirZoom($('img', f));
    });

    // Arrastrar hacia abajo para cerrar
    let arrastre = null;
    cabecera.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        arrastre = { y0: e.clientY, t0: performance.now(), dy: 0 };
        hoja.classList.add('arrastrando');
        cabecera.setPointerCapture(e.pointerId);
    });
    cabecera.addEventListener('pointermove', (e) => {
        if (!arrastre) return;
        let dy = e.clientY - arrastre.y0;
        if (dy < 0) dy = -Math.sqrt(-dy) * 2; // resistencia hacia arriba
        arrastre.dy = dy;
        hoja.style.setProperty('--arrastre', `${dy}px`);
        capa.style.opacity = Math.max(0, 1 - Math.max(0, dy) / hoja.offsetHeight);
    });
    const soltar = () => {
        if (!arrastre) return;
        const vel = arrastre.dy / (performance.now() - arrastre.t0);
        hoja.classList.remove('arrastrando');
        if (arrastre.dy > 140 || (arrastre.dy > 30 && vel > 0.6)) pedirCierre();
        else { hoja.style.setProperty('--arrastre', '0px'); capa.style.opacity = ''; }
        arrastre = null;
    };
    cabecera.addEventListener('pointerup', soltar);
    cabecera.addEventListener('pointercancel', soltar);

    /* ---------- Zoom de imágenes ---------- */
    const zoom = $('#zoom');
    const zoomImg = $('img', zoom);
    function abrirZoom(fuente) {
        zoomImg.src = fuente.currentSrc || fuente.src;
        zoomImg.alt = fuente.alt;
        zoom.hidden = false;
        zoom.offsetHeight;
        zoom.classList.add('visible');
    }
    function cerrarZoom() {
        zoom.classList.remove('visible');
        setTimeout(() => (zoom.hidden = true), 300);
    }
    zoom.addEventListener('click', cerrarZoom);

    document.addEventListener('keydown', (e) => {
        if (!zoom.hidden && e.key === 'Escape') return cerrarZoom();
        if (!abierta) return;
        if (e.key === 'Escape') pedirCierre();
        else if (e.key === 'ArrowRight') ir(1, true);   // con teclado, sin animación
        else if (e.key === 'ArrowLeft') ir(-1, true);
    });

    /* ---------- Copiar mail + toast ---------- */
    const tostadas = $('#tostadas');
    function tostar(texto) {
        const li = document.createElement('li');
        li.className = 'tostada';
        li.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7.5 12.5 3 3 6-6.5" fill="none" stroke="#0d0e14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${esc(texto)}`;
        tostadas.appendChild(li);
        requestAnimationFrame(() => requestAnimationFrame(() => li.classList.add('visible')));
        setTimeout(() => { li.classList.remove('visible'); setTimeout(() => li.remove(), 450); }, 2600);
    }
    $('#copiar-mail').addEventListener('click', async (e) => {
        const mail = e.currentTarget.dataset.mail;
        try {
            await navigator.clipboard.writeText(mail);
            tostar('Mail copiado. ¡Te leo!');
        } catch {
            location.href = `mailto:${mail}`;
        }
    });
})();
