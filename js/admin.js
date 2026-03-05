/**
 * admin.js — Admin Panel Logic
 * Handles login/logout, property CRUD, and dashboard stats.
 * Password is hashed client-side; for production use a proper backend.
 */

// ── CONFIG ──
// To change the password: replace this hash with: btoa('your-new-password')
const ADMIN_TOKEN_KEY = 'aval_admin_session';
const CORRECT_HASH = btoa('aval2026');

document.addEventListener('DOMContentLoaded', () => {
  AdminPage.init();
});

const AdminPage = {
  currentSection: 'dashboard',
  editingId: null,

  init() {
    if (this._isLoggedIn()) {
      this._showPanel();
    } else {
      this._showLogin();
    }
    this._bindLogin();
    this._bindSidebar();
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

  _setActiveNav(name) {
  document.querySelectorAll('[data-section]').forEach(b =>
    b.classList.toggle('admin-sidebar__link--active', b.dataset.section === name));
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
async _renderDashboard(el) {
  el.innerHTML = `<p style="padding:24px;color:var(--gray-400);">Cargando...</p>`;
  const all        = await Store.getAll();
  const ventas     = all.filter(p => p.tipo === 'venta').length;
  const alquileres = all.filter(p => p.tipo === 'alquiler').length;
  el.innerHTML = `
    <div class="admin-stats">
      <div class="admin-stat-card"><span class="admin-stat-card__icon">🏠</span><div class="admin-stat-card__num">${all.length}</div><div class="admin-stat-card__label">Total publicaciones</div></div>
      <div class="admin-stat-card"><span class="admin-stat-card__icon">🏷️</span><div class="admin-stat-card__num">${ventas}</div><div class="admin-stat-card__label">En venta</div></div>
      <div class="admin-stat-card"><span class="admin-stat-card__icon">🔑</span><div class="admin-stat-card__num">${alquileres}</div><div class="admin-stat-card__label">En alquiler</div></div>
    </div>
    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <span class="admin-table-title">Últimas publicaciones</span>
        <button class="btn btn--primary btn--sm" onclick="AdminPage._renderSection('add');AdminPage._setActiveNav('add')">+ Agregar</button>
      </div>
      ${this._buildTable(all.slice(0, 6))}
    </div>`;
},

  /* ── PROPERTIES LIST with drag to reorder ── */
async _renderProperties(el) {
  el.innerHTML = `<p style="padding:24px;color:var(--gray-400);">Cargando...</p>`;
  const all = await Store.getAll();
  el.innerHTML = `
    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <div>
          <span class="admin-table-title">Todas las publicaciones (${all.length})</span>
          <p style="font-size:12px;color:var(--gray-400);margin-top:4px;">☰ Arrastrá las filas para cambiar el orden</p>
        </div>
        <button class="btn btn--primary btn--sm" onclick="AdminPage._renderSection('add');AdminPage._setActiveNav('add')">+ Agregar</button>
      </div>
      <table class="admin-table">
        <thead><tr>
          <th style="width:32px;"></th>
          <th>Imagen</th><th>Título</th><th>Tipo</th><th>Precio</th><th>Acciones</th>
        </tr></thead>
        <tbody id="sortableList">
          ${all.map(p => `
            <tr draggable="true" data-id="${p.id}" class="sortable-row" style="cursor:grab;">
              <td style="color:var(--gray-400);font-size:18px;padding-left:16px;">⠿</td>
              <td><img class="admin-table__thumb" src="${p.img}" alt="" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=40'"></td>
              <td><div class="admin-table__title">${p.title}</div></td>
              <td><span class="admin-badge admin-badge--${p.tipo}">${p.tipo}</span></td>
              <td>${p.price}</td>
              <td><div class="admin-table__actions">
                <a class="admin-action-btn" href="../pages/property.html?id=${p.id}" target="_blank" title="Ver">🌐</a>
                <button class="admin-action-btn" onclick="AdminPage.editProperty(${p.id})" title="Editar" style="font-size:15px;">✏️</button>
                <button class="admin-action-btn admin-action-btn--del" onclick="AdminPage.deleteProperty(${p.id})" title="Eliminar">🗑️</button>
              </div></td>
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

tbody.addEventListener('dragend', async e => {
  dragRow.style.opacity = '';
  dragRow = null;
  const ids = [...tbody.querySelectorAll('tr[data-id]')].map(r => Number(r.dataset.id));
  const all = await Store.getAll();
  const sorted = ids.map(id => all.find(p => p.id === id)).filter(Boolean);
  await Store.save(sorted);
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
                  <a class="admin-action-btn" href="../pages/property.html?id=${p.id}" target="_blank" title="Ver">🌐</a>
                  <button class="admin-action-btn" onclick="AdminPage.editProperty(${p.id})" title="Editar" style="font-size:15px;">✏️</button>
                  <button class="admin-action-btn admin-action-btn--del" onclick="AdminPage.deleteProperty(${p.id})" title="Eliminar">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  },

  /* ── ADD FORM ── */
_renderAddForm(el) {
  this.editingId = null;
  this._renderForm(el, null);
},

_barrioOptions(selected = '') {
  const groups = {
    'Montevideo': ['Aguada','Aires Puros','Atahualpa','Bella Vista','Blanqueada','Brazo Oriental','Buceo','Carrasco','Carrasco Norte','Centro','Cerrito','Ciudad Vieja','Colón','Conciliación','Cordón','Flor de Maroñas','Goes','Jacinto Vera','La Comercial','La Teja','Larrañaga','Las Acacias','Lezica','Malvín','Malvín Norte','Maroñas','Mercado Modelo','Montevideo Viejo','Nuevo París','Palermo','Parque Batlle','Parque Rodó','Paso de las Duranas','Peñarol','Pocitos','Pocitos Nuevo','Prado','Punta Carretas','Punta Gorda','Reducto','Reus','Sayago','Step','Tres Cruces','Unión','Villa Española','Villa Muñoz','Villanueva'],
    'Ciudad de la Costa': ['Ciudad de la Costa','Shangrila','El Pinar','Solymar','Lagomar','Salinas','Neptunia','Zinnia','Bello Horizonte','Lomas de Solymar','Parque Miramar','Colinas de Solymar'],
    'Otros': ['Otros'],
  };
  let html = `<option value="">— Seleccionar barrio —</option>`;
  for (const [label, barrios] of Object.entries(groups)) {
    html += `<optgroup label="${label}">`;
    html += barrios.map(b => `<option value="${b}" ${b === selected ? 'selected' : ''}>${b}</option>`).join('');
    html += `</optgroup>`;
  }
  return html;
},

_renderForm(el, prop) {
  const isEdit = !!prop;
  const p = prop || {};
  el.innerHTML = `
    <div class="admin-form-card">
      <div class="admin-form-card__header">
        <div class="admin-form-card__title">${isEdit ? 'Editar: ' + p.title : 'Nueva publicación'}</div>
      </div>
      <div class="admin-form-card__body">

        <div class="form-group">
          <label class="form-label">Título de la propiedad *</label>
          <input id="aTitle" class="form-control" type="text" value="${p.title || ''}" placeholder="Ej: AVAL Venta Apto Centro 2 Dorm">
        </div>

        <div class="admin-form-grid">
          <div class="form-group">
            <label class="form-label">Tipo *</label>
            <select id="aTipo" class="form-control">
              <option value="venta" ${(p.tipo||'venta')==='venta' ? 'selected':''}>Venta</option>
              <option value="alquiler" ${p.tipo==='alquiler' ? 'selected':''}>Alquiler</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Precio *</label>
            <div style="display:flex;gap:8px;">
              <select id="aMoneda" class="form-control" style="width:110px;flex-shrink:0;">
                <option value="$" ${(p.moneda||'$')==='$' ? 'selected':''}>$ (Pesos)</option>
                <option value="U$S" ${p.moneda==='U$S' ? 'selected':''}>U$S (Dólares)</option>
              </select>
              <input id="aPrice" class="form-control" type="text" value="${p.price || ''}" placeholder="Ej: 25.000">
            </div>
          </div>
        </div>

        <div class="admin-form-grid">
          <div class="form-group">
            <label class="form-label">Zona</label>
            <input id="aZone" class="form-control" type="text" value="${p.zone || ''}" placeholder="Ej: Pocitos, Montevideo">
          </div>
          <div class="form-group">
            <label class="form-label">Barrio</label>
            <select id="aBarrio" class="form-control">${this._barrioOptions(p.barrio || '')}</select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Imagen de portada *</label>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
            <input id="aImg" class="form-control" type="text" value="${p.img || ''}" placeholder="URL o subí desde tu computadora →">
            <label class="btn btn--ghost btn--sm" style="cursor:pointer;white-space:nowrap;flex-shrink:0;">
              📁 Subir
              <input type="file" accept="image/*" style="display:none" onchange="AdminPage._loadFile(this,'aImg','aImgPreview')">
            </label>
          </div>
          <div id="aImgPreview">${p.img ? `<img src="${p.img}" style="max-height:80px;border-radius:8px;border:1px solid var(--gray-200);">` : ''}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Fotos del carrusel <span style="font-weight:400;color:var(--gray-400)">(arrastrá para reordenar)</span></label>
          <div id="photosContainer">
            ${((p.photos || []).slice(1)).map(url => this._photoRow(url)).join('')}
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
            <button type="button" class="btn btn--ghost btn--sm" onclick="AdminPage.addPhotoUrl()">+ URL de foto</button>
            <label class="btn btn--ghost btn--sm" style="cursor:pointer;">
              📁 Subir desde computadora
              <input type="file" accept="image/*" multiple style="display:none" onchange="AdminPage._loadMultipleFiles(this)">
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Video de YouTube (opcional)</label>
          <input id="aYoutube" class="form-control" type="text" value="${p.youtube || ''}" placeholder="https://www.youtube.com/watch?v=...">
          <small style="color:var(--gray-400);font-size:12px;margin-top:4px;display:block;">Se muestra al final del carrusel de fotos.</small>
        </div>

        <div class="form-group">
          <label class="form-label">Link de la publicación *</label>
          <input id="aLink" class="form-control" type="text" value="${p.link || ''}" placeholder="URL completa de MercadoLibre o Gallito">
        </div>

        <div class="form-group">
          <label class="form-label">Ubicación en Google Maps (embed URL)</label>
          <input id="aMapUrl" class="form-control" type="text" value="${p.mapUrl || ''}" placeholder="https://www.google.com/maps/embed?pb=...">
          <small style="color:var(--gray-400);font-size:12px;margin-top:4px;display:block;">Google Maps → Compartir → Incorporar mapa → copiá el src del iframe.</small>
        </div>

        <div class="form-group">
          <label class="form-label">Descripción</label>
          <textarea id="aDesc" class="form-control" placeholder="Descripción de la propiedad...">${p.desc || ''}</textarea>
        </div>

        <div style="display:flex;gap:12px;margin-top:8px;">
          <button class="btn btn--primary" onclick="AdminPage.saveProperty()">${isEdit ? '💾 Guardar cambios' : 'Guardar publicación'}</button>
          <button class="btn btn--ghost" onclick="AdminPage._renderSection('properties')">Cancelar</button>
        </div>

      </div>
    </div>`;
  this._initPhotoDragSort();
},

_photoRow(url = '') {
  const preview = url ? `<img src="${url}" style="width:48px;height:36px;object-fit:cover;border-radius:5px;flex-shrink:0;" onerror="this.style.display='none'">` : '';
  return `
    <div class="photo-input-row" draggable="true" style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:grab;background:#f8fafc;border:1px solid var(--gray-200);border-radius:8px;padding:6px 8px;">
      <span style="color:var(--gray-400);font-size:16px;user-select:none;">⠿</span>
      ${preview}
      <input class="form-control photo-input" type="text" value="${url}" placeholder="URL de foto" style="flex:1;">
      <label class="btn btn--ghost btn--sm" style="cursor:pointer;flex-shrink:0;padding:5px 8px;" title="Subir desde computadora">
        📁
        <input type="file" accept="image/*" style="display:none" onchange="AdminPage._loadFileIntoRow(this)">
      </label>
      <button type="button" class="btn btn--danger btn--sm" onclick="this.closest('.photo-input-row').remove()" style="flex-shrink:0;">✕</button>
    </div>`;
},

addPhotoUrl() {
  const container = document.getElementById('photosContainer');
  if (!container) return;
  const div = document.createElement('div');
  div.innerHTML = this._photoRow('');
  container.appendChild(div.firstElementChild);
  this._initPhotoDragSort();
},

async _loadFile(input, targetId, previewId) {
  const file = input.files[0];
  if (!file) return;
  const btn = input.closest('label');
  if (btn) btn.textContent = '⏳ Subiendo...';
  try {
    const url = await Store.uploadPhoto(file);
    const t = document.getElementById(targetId);
    if (t) t.value = url;
    const prev = document.getElementById(previewId);
    if (prev) prev.innerHTML = `<img src="${url}" style="max-height:80px;border-radius:8px;border:1px solid var(--gray-200);">`;
  } catch(e) {
    Toast.error('Error al subir la foto. Intentá de nuevo.');
  }
  if (btn) { btn.innerHTML = '📁 Subir <input type="file" accept="image/*" style="display:none" onchange="AdminPage._loadFile(this,\''+targetId+'\',\''+previewId+'\')">'; }
},

async _loadMultipleFiles(input) {
  const container = document.getElementById('photosContainer');
  if (!container) return;
  const files = [...input.files];
  Toast.show(`Subiendo ${files.length} foto${files.length > 1 ? 's' : ''}...`);
  for (const file of files) {
    try {
      const url = await Store.uploadPhoto(file);
      const div = document.createElement('div');
      div.innerHTML = this._photoRow(url);
      container.appendChild(div.firstElementChild);
      this._initPhotoDragSort();
    } catch(e) {
      Toast.error(`Error subiendo ${file.name}`);
    }
  }
  Toast.success('✅ Fotos subidas');
},

async _loadFileIntoRow(input) {
  const file = input.files[0];
  if (!file) return;
  const row = input.closest('.photo-input-row');
  const label = input.closest('label');
  if (label) label.textContent = '⏳';
  try {
    const url = await Store.uploadPhoto(file);
    const textInput = row.querySelector('.photo-input');
    if (textInput) textInput.value = url;
    let img = row.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.style.cssText = 'width:48px;height:36px;object-fit:cover;border-radius:5px;flex-shrink:0;';
      textInput?.before(img);
    }
    img.src = url;
  } catch(e) {
    Toast.error('Error al subir. Intentá de nuevo.');
  }
  if (label) label.innerHTML = '📁 <input type="file" accept="image/*" style="display:none" onchange="AdminPage._loadFileIntoRow(this)">';
},

_initPhotoDragSort() {
  const container = document.getElementById('photosContainer');
  if (!container) return;
  let dragEl = null;
  container.addEventListener('dragstart', e => {
    dragEl = e.target.closest('.photo-input-row');
    if (dragEl) { setTimeout(() => dragEl.style.opacity = '0.4', 0); e.dataTransfer.effectAllowed = 'move'; }
  });
  container.addEventListener('dragend', () => { if (dragEl) { dragEl.style.opacity = ''; dragEl = null; } });
  container.addEventListener('dragover', e => {
    e.preventDefault();
    const target = e.target.closest('.photo-input-row');
    if (!target || target === dragEl) return;
    const after = e.clientY > target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2;
    container.insertBefore(dragEl, after ? target.nextSibling : target);
  });
},

  _bindAddForm() {
    // Form is dynamically rendered, binding happens via onclick on the button
  },

async editProperty(id) {
  const prop = await Store.getById(id);
  if (!prop) return;
  this.editingId = id;
  const content = document.getElementById('adminContent');
  const title   = document.getElementById('adminTitle');
  if (title) title.textContent = 'Editar publicación';
  this._renderForm(content, prop);
},

  /* ── CRUD ── */
async saveProperty() {
  const title   = Form.val('aTitle');
  const tipo    = Form.val('aTipo');
  const price   = Form.val('aPrice');
  const moneda  = Form.val('aMoneda');
  const img     = Form.val('aImg');
  const link    = Form.val('aLink');
  const desc    = Form.val('aDesc');
  const zone    = Form.val('aZone');
  const barrio  = Form.val('aBarrio');
  const mapUrl  = Form.val('aMapUrl');
  const youtube = Form.val('aYoutube');

  if (!title || !price || !img || !link) {
    Toast.error('Completá los campos obligatorios (*)'); return;
  }

  const extraPhotos = [...document.querySelectorAll('.photo-input')]
    .map(i => i.value.trim()).filter(Boolean);
  const photos = [img, ...extraPhotos];
  const data = { title, tipo, price, moneda, img, link, desc, zone, barrio, mapUrl, photos, youtube };

  Toast.show('Guardando...');
  if (this.editingId) {
    await Store.updateOne(this.editingId, data);
    Toast.success('✅ Publicación actualizada');
    this.editingId = null;
  } else {
    await Store.add(data);
    Toast.success('✅ Publicación agregada');
  }

  this._renderSection('properties');
  this._setActiveNav('properties');
},

async deleteProperty(id) {
  if (!confirm('¿Seguro que querés eliminar esta publicación?')) return;
  await Store.remove(id);
  Toast.show('Publicación eliminada');
  this._renderSection(this.currentSection);
},
};
