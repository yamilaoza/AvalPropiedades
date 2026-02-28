/**
 * admin.js — Admin Panel Logic
 * Handles login/logout, property CRUD, and dashboard stats.
 * Password is hashed client-side; for production use a proper backend.
 */

// ── CONFIG ──
// To change the password: replace this hash with: btoa('your-new-password')
const ADMIN_TOKEN_KEY = 'aval_admin_session';
const CORRECT_HASH    = btoa('aval2026'); 

document.addEventListener('DOMContentLoaded', () => {
  AdminPage.init();
});

const AdminPage = {
  currentSection: 'dashboard',

  init() {
    if (this._isLoggedIn()) {
      this._showPanel();
    } else {
      this._showLogin();
    }
    this._bindLogin();
    this._bindSidebar();
    this._bindAddForm();
  },

  /* ── AUTH ── */
  _isLoggedIn() {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) === CORRECT_HASH;
  },

  _showLogin() {
    document.getElementById('loginWrap').style.display   = 'grid';
    document.getElementById('adminLayout').style.display = 'none';
  },

  _showPanel() {
    document.getElementById('loginWrap').style.display   = 'none';
    document.getElementById('adminLayout').style.display = 'flex';
    this._renderSection('dashboard');
  },

  _bindLogin() {
    const btn      = document.getElementById('loginBtn');
    const passEl   = document.getElementById('loginPass');
    const errorEl  = document.getElementById('loginError');

    const attempt = () => {
      const hash = btoa(passEl.value);
      if (hash === CORRECT_HASH) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, hash);
        errorEl.classList.remove('login-card__error--visible');
        this._showPanel();
      } else {
        errorEl.classList.add('login-card__error--visible');
        passEl.value = '';
        passEl.focus();
      }
    };

    btn?.addEventListener('click', attempt);
    passEl?.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });
  },

  logout() {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    this._showLogin();
    Toast.show('Sesión cerrada.');
  },

  /* ── SIDEBAR ── */
  _bindSidebar() {
    document.querySelectorAll('[data-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._renderSection(btn.dataset.section);
        document.querySelectorAll('[data-section]').forEach(b => b.classList.remove('admin-sidebar__link--active'));
        btn.classList.add('admin-sidebar__link--active');
      });
    });
  },

  _renderSection(name) {
    this.currentSection = name;
    const content = document.getElementById('adminContent');
    const title   = document.getElementById('adminTitle');

    const sections = {
      dashboard:  { title: 'Dashboard',            fn: () => this._renderDashboard(content) },
      properties: { title: 'Publicaciones',         fn: () => this._renderProperties(content) },
      add:        { title: 'Agregar publicación',   fn: () => this._renderAddForm(content) },
    };

    const sec = sections[name];
    if (!sec) return;

    if (title) title.textContent = sec.title;
    sec.fn();
  },

  /* ── DASHBOARD ── */
  _renderDashboard(el) {
    const all       = Store.getAll();
    const ventas    = all.filter(p => p.tipo === 'venta').length;
    const alquileres = all.filter(p => p.tipo === 'alquiler').length;

    el.innerHTML = `
      <div class="admin-stats">
        <div class="admin-stat-card">
          <span class="admin-stat-card__icon">🏠</span>
          <div class="admin-stat-card__num">${all.length}</div>
          <div class="admin-stat-card__label">Total publicaciones</div>
        </div>
        <div class="admin-stat-card">
          <span class="admin-stat-card__icon">🏷️</span>
          <div class="admin-stat-card__num">${ventas}</div>
          <div class="admin-stat-card__label">En venta</div>
        </div>
        <div class="admin-stat-card">
          <span class="admin-stat-card__icon">🔑</span>
          <div class="admin-stat-card__num">${alquileres}</div>
          <div class="admin-stat-card__label">En alquiler</div>
        </div>
      </div>
      <div class="admin-table-wrap">
        <div class="admin-table-header">
          <span class="admin-table-title">Últimas publicaciones</span>
          <button class="btn btn--primary btn--sm" onclick="AdminPage._renderSection('add');document.querySelectorAll('[data-section]').forEach(b=>b.classList.toggle('admin-sidebar__link--active',b.dataset.section==='add'))">+ Agregar</button>
        </div>
        ${this._buildTable(Store.getAll().slice(0, 6))}
      </div>`;
  },

  /* ── PROPERTIES LIST with drag to reorder ── */
  _renderProperties(el) {
    const all = Store.getAll();
    el.innerHTML = `
      <div class="admin-table-wrap">
        <div class="admin-table-header">
          <div>
            <span class="admin-table-title">Todas las publicaciones (${all.length})</span>
            <p style="font-size:12px;color:var(--gray-400);margin-top:4px;">
              ☰ Arrastrá las filas para cambiar el orden en que aparecen en la página
            </p>
          </div>
          <button class="btn btn--primary btn--sm"
            onclick="AdminPage._renderSection('add');document.querySelectorAll('[data-section]').forEach(b=>b.classList.toggle('admin-sidebar__link--active',b.dataset.section==='add'))">
            + Agregar
          </button>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width:32px;"></th>
              <th>Imagen</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="sortableList">
            ${all.map(p => `
              <tr draggable="true" data-id="${p.id}" class="sortable-row" style="cursor:grab;">
                <td style="color:var(--gray-400);font-size:18px;padding-left:16px;">⠿</td>
                <td><img class="admin-table__thumb" src="${p.img}" alt="" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=40'"></td>
                <td><div class="admin-table__title">${p.title}</div></td>
                <td><span class="admin-badge admin-badge--${p.tipo}">${p.tipo}</span></td>
                <td>${p.price}</td>
                <td>
                  <div class="admin-table__actions">
                    <a class="admin-action-btn" href="../pages/property.html?id=${p.id}" target="_blank" title="Ver">👁️</a>
                    <button class="admin-action-btn admin-action-btn--del" onclick="AdminPage.deleteProperty(${p.id})" title="Eliminar">🗑️</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    this._initDragSort();
  },

  /* ── DRAG & DROP SORT ── */
  _initDragSort() {
    const tbody = document.getElementById('sortableList');
    if (!tbody) return;

    let dragRow = null;

    tbody.addEventListener('dragstart', e => {
      dragRow = e.target.closest('tr');
      dragRow.style.opacity = '0.4';
      e.dataTransfer.effectAllowed = 'move';
    });

    tbody.addEventListener('dragend', e => {
      dragRow.style.opacity = '';
      dragRow = null;
      // Persist new order
      const ids = [...tbody.querySelectorAll('tr[data-id]')].map(r => Number(r.dataset.id));
      const all = Store.getAll();
      const sorted = ids.map(id => all.find(p => p.id === id)).filter(Boolean);
      // Keep any items not in view (shouldn't happen but safety)
      Store.save(sorted);
      Toast.success('✅ Orden guardado');
    });

    tbody.addEventListener('dragover', e => {
      e.preventDefault();
      const target = e.target.closest('tr');
      if (!target || target === dragRow) return;
      const rect  = target.getBoundingClientRect();
      const after = e.clientY > rect.top + rect.height / 2;
      tbody.insertBefore(dragRow, after ? target.nextSibling : target);
    });
  },

  _buildTable(props) {
    if (!props.length) return '<p style="padding:24px;color:var(--gray-400);font-size:14px;">No hay publicaciones.</p>';
    return `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Título</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${props.map(p => `
            <tr>
              <td><img class="admin-table__thumb" src="${p.img}" alt="" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=40'"></td>
              <td><div class="admin-table__title">${p.title}</div></td>
              <td><span class="admin-badge admin-badge--${p.tipo}">${p.tipo}</span></td>
              <td>${p.price}</td>
              <td>
                <div class="admin-table__actions">
                  <a class="admin-action-btn" href="../pages/property.html?id=${p.id}" target="_blank" title="Ver">👁️</a>
                  <button class="admin-action-btn admin-action-btn--del" onclick="AdminPage.deleteProperty(${p.id})" title="Eliminar">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  },

  /* ── ADD FORM ── */
  _renderAddForm(el) {
    el.innerHTML = `
      <div class="admin-form-card">
        <div class="admin-form-card__header">
          <div class="admin-form-card__title">Nueva publicación</div>
        </div>
        <div class="admin-form-card__body">

          <div class="form-group">
            <label class="form-label">Título de la propiedad *</label>
            <input id="aTitle" class="form-control" type="text" placeholder="Ej: AVAL Venta Apto Centro 2 Dorm">
          </div>

          <div class="admin-form-grid">
            <div class="form-group">
              <label class="form-label">Tipo *</label>
              <select id="aTipo" class="form-control">
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Precio *</label>
              <div style="display:flex; gap:8px;">
                <select id="aMoneda" class="form-control" style="width:100px; flex-shrink:0;">
              <option value="$">$ (Pesos Uruguayos)</option>
              <option value="U$S">U$S (Dólares)</option>
                </select>
                <input id="aPrice" class="form-control" type="text" placeholder="Ej: 25.000">
            </div>
          </div>

          <div class="admin-form-grid">
            <div class="form-group">
              <label class="form-label">Zona</label>
              <input id="aZone" class="form-control" type="text" placeholder="Ej: Pocitos, Montevideo">
            </div>
            <div class="form-group">
              <label class="form-label">Barrio</label>
              <select id="aBarrio" class="form-control">
                <option value="">— Seleccionar barrio —</option>
                <optgroup label="Montevideo">
                <option value="Aguada">Aguada</option>
                <option value="Aires Puros">Aires Puros</option>
                <option value="Atahualpa">Atahualpa</option>
                <option value="Bella Vista">Bella Vista</option>
                <option value="Blanqueada">Blanqueada</option>
                <option value="Brazo Oriental">Brazo Oriental</option>
                <option value="Buceo">Buceo</option>
                <option value="Carrasco">Carrasco</option>
                <option value="Carrasco Norte">Carrasco Norte</option>
                <option value="Centro">Centro</option>
                <option value="Cerrito">Cerrito</option>
                <option value="Ciudad Vieja">Ciudad Vieja</option>
                <option value="Colón">Colón</option>
                <option value="Conciliación">Conciliación</option>
                <option value="Cordón">Cordón</option>
                <option value="Flor de Maroñas">Flor de Maroñas</option>
                <option value="Goes">Goes</option>
                <option value="Jacinto Vera">Jacinto Vera</option>
                <option value="La Comercial">La Comercial</option>
                <option value="La Teja">La Teja</option>
                <option value="Larrañaga">Larrañaga</option>
                <option value="Las Acacias">Las Acacias</option>
                <option value="Lezica">Lezica</option>
                <option value="Malvín">Malvín</option>
                <option value="Malvín Norte">Malvín Norte</option>
                <option value="Maroñas">Maroñas</option>
                <option value="Mercado Modelo">Mercado Modelo</option>
                <option value="Montevideo Viejo">Montevideo Viejo</option>
                <option value="Nuevo París">Nuevo París</option>
                <option value="Palermo">Palermo</option>
                <option value="Parque Batlle">Parque Batlle</option>
                <option value="Parque Rodó">Parque Rodó</option>
                <option value="Paso de las Duranas">Paso de las Duranas</option>
                <option value="Peñarol">Peñarol</option>
                <option value="Pocitos">Pocitos</option>
                <option value="Pocitos Nuevo">Pocitos Nuevo</option>
                <option value="Prado">Prado</option>
                <option value="Punta Carretas">Punta Carretas</option>
                <option value="Punta Gorda">Punta Gorda</option>
                <option value="Reducto">Reducto</option>
                <option value="Reus">Reus</option>
                <option value="Sayago">Sayago</option>
                <option value="Step">Step</option>
                <option value="Tres Cruces">Tres Cruces</option>
                <option value="Unión">Unión</option>
                <option value="Villa Española">Villa Española</option>
                <option value="Villa Muñoz">Villa Muñoz</option>
                <option value="Villanueva">Villanueva</option>
                </optgroup>
                <optgroup label="Ciudad de la Costa">
                <option value="Ciudad de la Costa">Ciudad de la Costa</option>
                <option value="Shangrila">Shangrila</option>
                <option value="El Pinar">El Pinar</option>
                <option value="Solymar">Solymar</option>
                <option value="Lagomar">Lagomar</option>
                <option value="Salinas">Salinas</option>
                <option value="Neptunia">Neptunia</option>
                <option value="Zinnia">Zinnia</option>
                <option value="Bello Horizonte">Bello Horizonte</option>
                <option value="Lomas de Solymar">Lomas de Solymar</option>
                <option value="Parque Miramar">Parque Miramar</option>
                <option value="Colinas de Solymar">Colinas de Solymar</option>
                </optgroup>
                <optgroup label="Otros">
                <option value="Otros">Otros</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Imagen de portada (miniatura) *</label>
            <input id="aImg" class="form-control" type="text" placeholder="Click derecho → Copiar dirección de imagen en ML/Gallito">
            <small style="color:var(--gray-400);font-size:12px;margin-top:4px;display:block;">Esta imagen se muestra en la lista de propiedades.</small>
          </div>

          <div class="form-group">
            <label class="form-label">Fotos adicionales del carrusel</label>
            <div id="photosContainer">
              <div class="photo-input-row" style="display:flex;gap:8px;margin-bottom:8px;">
                <input class="form-control photo-input" type="text" placeholder="URL de foto 2">
                <button type="button" class="btn btn--danger btn--sm" onclick="this.parentElement.remove()">✕</button>
              </div>
            </div>
            <button type="button" class="btn btn--ghost btn--sm" onclick="AdminPage.addPhotoField()" style="margin-top:4px;">+ Agregar foto</button>
            <small style="color:var(--gray-400);font-size:12px;margin-top:6px;display:block;">Copiá el link de cada foto desde MercadoLibre/Gallito (click derecho → copiar dirección de imagen).</small>
          </div>

          <div class="form-group">
            <label class="form-label">Link de la publicación *</label>
            <input id="aLink" class="form-control" type="text" placeholder="URL completa de MercadoLibre o Gallito">
          </div>

          <div class="form-group">
            <label class="form-label">Ubicación en Google Maps (embed URL)</label>
            <input id="aMapUrl" class="form-control" type="text" placeholder="https://www.google.com/maps/embed?pb=...">
            <small style="color:var(--gray-400);font-size:12px;margin-top:4px;display:block;">
              En Google Maps: buscá la dirección → Compartir → Incorporar mapa → copiá el link del src del iframe.
            </small>
          </div>

          <div class="form-group">
            <label class="form-label">Descripción</label>
            <textarea id="aDesc" class="form-control" placeholder="Descripción breve de la propiedad..."></textarea>
          </div>

          <div style="display:flex;gap:12px;margin-top:8px;">
            <button class="btn btn--primary" onclick="AdminPage.saveProperty()">Guardar publicación</button>
            <button class="btn btn--ghost" onclick="AdminPage._renderSection('properties')">Cancelar</button>
          </div>

        </div>
      </div>`;
  },

  addPhotoField() {
    const container = document.getElementById('photosContainer');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'photo-input-row';
    row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';
    row.innerHTML = `
      <input class="form-control photo-input" type="text" placeholder="URL de foto">
      <button type="button" class="btn btn--danger btn--sm" onclick="this.parentElement.remove()">✕</button>`;
    container.appendChild(row);
  },

  _bindAddForm() {
    // Form is dynamically rendered, binding happens via onclick on the button
  },

  /* ── CRUD ── */
  saveProperty() {
    const title  = Form.val('aTitle');
    const tipo   = Form.val('aTipo');
    const price  = Form.val('aPrice');
    const moneda = Form.val('aMoneda');
    const img    = Form.val('aImg');
    const link   = Form.val('aLink');
    const desc   = Form.val('aDesc');
    const zone   = Form.val('aZone');
    const barrio = Form.val('aBarrio');
    const mapUrl = Form.val('aMapUrl');

    if (!title || !price || !img || !link) {
      Toast.error('Completá los campos obligatorios (*)');
      return;
    }

    // Collect extra photos
    const extraPhotos = [...document.querySelectorAll('.photo-input')]
      .map(i => i.value.trim())
      .filter(Boolean);
    const photos = [img, ...extraPhotos];

    Store.add({ title, tipo, price, moneda, img, link, desc, zone, barrio, mapUrl, photos });
    Toast.success('✅ Publicación agregada correctamente');
    this._renderSection('properties');
    document.querySelectorAll('[data-section]').forEach(b =>
      b.classList.toggle('admin-sidebar__link--active', b.dataset.section === 'properties'));
  },

  deleteProperty(id) {
    if (!confirm('¿Seguro que querés eliminar esta publicación?')) return;
    Store.remove(id);
    Toast.show('Publicación eliminada');
    this._renderSection(this.currentSection);
  },
};
