/**
 * home.js — Home page logic
 */
document.addEventListener('DOMContentLoaded', () => HomePage.init());

const HomePage = {
  currentFilter: 'todas',
  currentQuery:  '',
  currentBarrio: '',

  init() {
    this._populateBarrioSelects();
    this.render();
    this._bindFilterButtons();
    this._bindSearchInput();
    this._bindBarrioSelect();
    this._bindHeroSearch();
    this._bindContactForm();
  },

  render() {
    const grid  = document.getElementById('propsGrid');
    const count = document.getElementById('resultsCount');
    if (!grid) return;
    const props = Store.filter(this.currentFilter, this.currentQuery, this.currentBarrio);
    if (count) count.textContent = `${props.length} propiedad${props.length !== 1 ? 'es' : ''}`;
    if (!props.length) {
      grid.innerHTML = `<p class="props-empty">No se encontraron propiedades con esos filtros.</p>`;
      return;
    }
    grid.innerHTML = props.map(p => CardBuilder.build(p)).join('');
  },

  _populateBarrioSelects() {
    const mvd = [
      'Aguada','Aires Puros','Atahualpa','Bella Vista','Blanqueada',
      'Brazo Oriental','Buceo','Carrasco','Carrasco Norte','Centro',
      'Cerrito','Ciudad Vieja','Colón','Conciliación','Cordón',
      'Flor de Maroñas','Goes','Jacinto Vera','La Comercial','La Teja',
      'Larrañaga','Las Acacias','Lezica','Malvín','Malvín Norte',
      'Maroñas','Mercado Modelo','Montevideo Viejo','Nuevo París',
      'Palermo','Parque Batlle','Parque Rodó','Paso de las Duranas',
      'Peñarol','Pocitos','Pocitos Nuevo','Prado','Punta Carretas',
      'Punta Gorda','Reducto','Reus','Sayago','Step','Tres Cruces',
      'Unión','Villa Española','Villa Muñoz','Villanueva',
    ];
    const cdc = [
      'Ciudad de la Costa','Shangrila','El Pinar','Solymar','Lagomar',
      'Salinas','Neptunia','Zinnia','Bello Horizonte',
      'Lomas de Solymar','Parque Miramar','Colinas de Solymar',
    ];
    const toOpts = arr => arr.map(b => `<option value="${b}">${b}</option>`).join('');
    const opts = `
      <option value="">Todos los barrios</option>
      <optgroup label="Montevideo">${toOpts(mvd)}</optgroup>
      <optgroup label="Ciudad de la Costa">${toOpts(cdc)}</optgroup>
      <optgroup label="Otros"><option value="Otros">Otros</option></optgroup>`;

    const sel = document.getElementById('barrioSelect');
    if (sel) sel.innerHTML = opts;
    const heroSel = document.getElementById('heroBarrio');
    if (heroSel) heroSel.innerHTML = opts;
  },

  _bindFilterButtons() {
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('filter-bar__btn--active'));
        btn.classList.add('filter-bar__btn--active');
        this.currentFilter = btn.dataset.filter;
        this.render();
      });
    });
  },

  _bindSearchInput() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('input', () => { this.currentQuery = input.value; this.render(); });
  },

  _bindBarrioSelect() {
    const sel = document.getElementById('barrioSelect');
    if (!sel) return;
    sel.addEventListener('change', () => { this.currentBarrio = sel.value; this.render(); });
  },

  _bindHeroSearch() {
    const btn = document.getElementById('heroSearchBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const tipo   = document.getElementById('heroTipo')?.value   || 'todas';
      const barrio = document.getElementById('heroBarrio')?.value || '';
      const query  = document.getElementById('heroQuery')?.value  || '';

      this.currentFilter = tipo;
      this.currentBarrio = barrio;
      this.currentQuery  = query;

      // Sync filter bar
      document.querySelectorAll('[data-filter]').forEach(b =>
        b.classList.toggle('filter-bar__btn--active', b.dataset.filter === tipo));
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = query;
      const barrioSel = document.getElementById('barrioSelect');
      if (barrioSel) barrioSel.value = barrio;

      document.getElementById('propiedades')?.scrollIntoView({ behavior: 'smooth' });
      this.render();
    });
  },

  _bindContactForm() {
    const btn = document.getElementById('contactSubmit');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const name  = Form.val('contactName');
      const email = Form.val('contactEmail');
      const msg   = Form.val('contactMsg');
      if (!name || !email) { Toast.error('Completá nombre y email'); return; }
      const text = encodeURIComponent(`Hola! Soy ${name} (${email}).\n${msg}`);
      window.open(`https://wa.me/59899029301?text=${text}`, '_blank');
      Toast.success('✅ Redirigiendo a WhatsApp…');
      Form.clear('contactName', 'contactEmail', 'contactPhone', 'contactMsg');
    });
  },
};
