/**
 * property.js — Property Detail Page Logic
 * Carousel, tabs, map, similar listings.
 */

document.addEventListener('DOMContentLoaded', () => {
  PropertyPage.init();
});

const PropertyPage = {
  prop:         null,
  currentSlide: 0,

  init() {
    const id = new URLSearchParams(window.location.search).get('id');
    this.prop = Store.getById(id);
    if (!this.prop) { this._renderNotFound(); return; }
    this._renderAll();
    this._bindTabs();
  },

  /* ── RENDER ALL ── */
  _renderAll() {
    const p = this.prop;
    document.title = `${p.title} — Aval Propiedades`;

    this._set('breadcrumbTitle', p.title);
    this._set('detailTitle',     p.title);
    this._set('detailPrice',     `${p.moneda || ''} ${p.price}`);
    this._set('sidebarPrice',    `${p.moneda || ''} ${p.price}`);
    this._set('sidebarTipo',     p.tipo === 'venta' ? 'En venta' : 'En alquiler');
    this._set('detailDesc',      p.desc || 'Consultá más detalles comunicándote con nosotros.');
    this._set('detailZone',         p.zone   || '—');
    this._set('detailZoneLabel',    p.zone   || '—');
    this._set('detailBarrio',       p.barrio || '—');
    this._set('detailBarrioDetail', p.barrio || '—');
    this._set('detailBarrio',    p.barrio || '—');

    const badge = document.getElementById('detailBadge');
    if (badge) {
      badge.textContent = p.tipo === 'venta' ? 'Venta' : 'Alquiler';
      badge.className   = `prop-detail__badge prop-detail__badge--${p.tipo}`;
    }

    // WhatsApp links
    const waMsg = encodeURIComponent(`Hola! Me interesa esta propiedad: ${p.title} — ${p.link}`);
    document.querySelectorAll('[data-wa-link]').forEach(el => {
      el.href = `https://wa.me/59899029301?text=${waMsg}`;
    });

    // External links
    document.querySelectorAll('[data-ext-link]').forEach(el => {
      el.href = p.link;
    });

    this._renderCarousel();
    this._renderMap();
    this._renderSimilar();
  },

  /* ── CAROUSEL ── */
  _renderCarousel() {
  const p      = this.prop;
  const photos = (p.photos && p.photos.length) ? p.photos : [p.img];
  const wrap   = document.getElementById('carouselWrap');
  if (!wrap) return;

  this.currentSlide = 0;
  const ytEmbed   = p.youtube ? this._youtubeEmbedUrl(p.youtube) : null;
  const totalSlides = photos.length + (ytEmbed ? 1 : 0);

  const photoSlides = photos.map((src, i) => `
    <div class="carousel__slide ${i === 0 ? 'carousel__slide--active' : ''}" data-index="${i}">
      <img src="${src}" alt="Foto ${i+1}" class="carousel__img"
           onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80'">
    </div>`).join('');

  const videoSlide = ytEmbed ? `
    <div class="carousel__slide" data-index="${photos.length}">
      <iframe src="${ytEmbed}" class="carousel__img" style="border:none;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen title="Video de la propiedad"></iframe>
    </div>` : '';

  const dotsHTML = totalSlides > 1 ? `
    <div class="carousel__dots">
      ${Array.from({length: totalSlides}, (_, i) =>
        `<button class="carousel__dot ${i === 0 ? 'carousel__dot--active' : ''}" data-dot="${i}" aria-label="Slide ${i+1}"></button>`
      ).join('')}
    </div>` : '';

  const arrowsHTML = totalSlides > 1 ? `
    <button class="carousel__arrow carousel__arrow--prev" id="carouselPrev">&#8249;</button>
    <button class="carousel__arrow carousel__arrow--next" id="carouselNext">&#8250;</button>
    <div class="carousel__counter" id="carouselCounter">1 / ${totalSlides}</div>` : '';

    wrap.innerHTML = `
    <div class="carousel">
      <div class="carousel__track" id="carouselTrack">
        ${photoSlides}${videoSlide}
        ${arrowsHTML}${dotsHTML}
      </div>
    </div>`;

  if (totalSlides > 1) {
    document.getElementById('carouselPrev')?.addEventListener('click', () => this._prevSlide());
    document.getElementById('carouselNext')?.addEventListener('click', () => this._nextSlide());
    wrap.querySelectorAll('[data-dot]').forEach(dot =>
      dot.addEventListener('click', () => this._goToSlide(Number(dot.dataset.dot))));
    let touchStartX = 0;
    const track = document.getElementById('carouselTrack');
    track?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track?.addEventListener('touchend',   e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? this._nextSlide() : this._prevSlide();
    });
  }
},

  _goToSlide(index) {
  const p     = this.prop;
  const photos = (p.photos && p.photos.length) ? p.photos : [p.img];
  const total  = photos.length + (p.youtube ? 1 : 0);
  this.currentSlide = (index + total) % total;
  document.querySelectorAll('.carousel__slide').forEach((s, i) =>
    s.classList.toggle('carousel__slide--active', i === this.currentSlide));
  document.querySelectorAll('.carousel__dot').forEach((d, i) =>
    d.classList.toggle('carousel__dot--active', i === this.currentSlide));
  const counter = document.getElementById('carouselCounter');
  if (counter) counter.textContent = `${this.currentSlide + 1} / ${total}`;
},

_youtubeEmbedUrl(url) {
  try {
    const u = new URL(url);
    let id = u.searchParams.get('v');
    if (!id) id = u.pathname.split('/').pop();
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch { return null; }
},

  _prevSlide() { this._goToSlide(this.currentSlide - 1); },
  _nextSlide() { this._goToSlide(this.currentSlide + 1); },

  /* ── MAP ── */
  _renderMap() {
    const mapWrap = document.getElementById('mapWrap');
    if (!mapWrap) return;

    if (this.prop.mapUrl) {
      mapWrap.innerHTML = `
        <iframe
          src="${this.prop.mapUrl}"
          class="prop-map-iframe"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Ubicación en Google Maps">
        </iframe>`;
    } else {
      mapWrap.innerHTML = `
        <div class="prop-map">
          📍 Zona: <strong>${this.prop.zone || this.prop.barrio || '—'}</strong><br>
          <small style="margin-top:6px;display:block;">Para ver la ubicación exacta, consultá la publicación original o contactanos.</small>
        </div>`;
    }
  },

  /* ── TABS ── */
  _bindTabs() {
    const tabs   = document.querySelectorAll('.prop-tab');
    const panels = document.querySelectorAll('.prop-tab-content');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t   => t.classList.remove('prop-tab--active'));
        panels.forEach(p => p.classList.remove('prop-tab-content--active'));
        tab.classList.add('prop-tab--active');
        document.getElementById(tab.dataset.tab)?.classList.add('prop-tab-content--active');
      });
    });
  },

  /* ── SIMILAR ── */
  _renderSimilar() {
    const p       = this.prop;
    const section = document.getElementById('similarSection');
    const grid    = document.getElementById('similarGrid');
    if (!grid || !section) return;
    const similar = Store.getSimilar(p.id, p.tipo);
    if (!similar.length) { section.style.display = 'none'; return; }
    grid.innerHTML = similar.map(s => CardBuilder.build(s)).join('');
  },

  /* ── NOT FOUND ── */
  _renderNotFound() {
    document.body.innerHTML = `
      <div style="min-height:100vh;display:grid;place-items:center;font-family:'DM Sans',sans-serif;background:#0a1628;color:white;text-align:center;padding:40px;">
        <div>
          <div style="font-size:60px;margin-bottom:16px;">🏚️</div>
          <h1 style="font-family:'Playfair Display',serif;font-size:32px;margin-bottom:12px;">Propiedad no encontrada</h1>
          <p style="color:rgba(255,255,255,0.55);margin-bottom:28px;">La propiedad que buscás no existe o fue eliminada.</p>
          <a href="../index.html" style="background:#2563eb;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">← Volver al inicio</a>
        </div>
      </div>`;
  },

  _set(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },
};
