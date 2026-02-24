/**
 * ui.js — Shared UI Helpers
 */

/* ── NAVBAR ── */
const Navbar = {
  init() {
    const nav    = document.querySelector('.navbar');
    const burger = document.getElementById('navBurger');
    const mobile = document.getElementById('navMobile');

    // Scroll: transparent → white (only on pages without navbar--solid)
    if (nav && !nav.classList.contains('navbar--solid')) {
      const update = () => nav.classList.toggle('navbar--scrolled', window.scrollY > 80);
      window.addEventListener('scroll', update, { passive: true });
      update();
    }

    if (burger && mobile) {
      burger.addEventListener('click', () => {
        const open = mobile.classList.toggle('open');
        burger.setAttribute('aria-expanded', open);
      });
    }
  },
};

/* ── TOAST ── */
const Toast = {
  _el: null, _timer: null,
  _getEl() { if (!this._el) this._el = document.getElementById('toast'); return this._el; },
  show(msg, type='') {
    const el = this._getEl(); if (!el) return;
    el.textContent = msg;
    el.className = `toast toast--visible${type ? ' toast--'+type : ''}`;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => el.classList.remove('toast--visible'), 3500);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error'); },
};

/* ── CARD BUILDER — elegant horizontal rows ── */
const CardBuilder = {
  build(prop) {
    const badge = prop.tipo === 'venta'
      ? '<span class="prop-card__badge prop-card__badge--venta">Venta</span>'
      : '<span class="prop-card__badge prop-card__badge--alquiler">Alquiler</span>';
    const waMsg      = encodeURIComponent(`Hola! Me interesa la propiedad: ${prop.title}`);
    const zone       = prop.barrio || prop.zone || '';
    const priceLabel = prop.tipo === 'alquiler' ? '<span style="font-size:12px;font-weight:400;opacity:0.5">/mes</span>' : '';
    return `
      <div class="prop-card">
        <div class="prop-card__img-wrap">
          <img class="prop-card__img" src="${prop.img}" alt="${prop.title}" loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=70'">
          ${badge}
        </div>
        <div class="prop-card__body">
          ${zone ? `<div class="prop-card__zone">${zone}</div>` : ''}
          <div class="prop-card__title">${prop.title}</div>
          <div class="prop-card__price"><strong>${prop.price}</strong>${priceLabel}</div>
        </div>
        <div class="prop-card__actions">
          <a class="prop-card__cta prop-card__cta--primary"
             href="pages/property.html?id=${prop.id}">Ver detalles →</a>
          <a class="prop-card__cta prop-card__cta--wa"
             href="https://wa.me/59899029301?text=${waMsg}"
             target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
        </div>
      </div>`;
  },
};

/* ── FORM HELPERS ── */
const Form = {
  val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; },
  clear(...ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; }); },
};

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => Navbar.init());
