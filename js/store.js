/**
 * store.js — Central Data Store
 * All property data lives here. Uses localStorage for persistence.
 */

const STORAGE_KEY = 'aval_properties';

const DEFAULT_PROPERTIES = [];

const Store = {
  /**
   * Load all properties (from localStorage or defaults)
   * @returns {Array}
   */
  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [...DEFAULT_PROPERTIES];
    } catch {
      return [...DEFAULT_PROPERTIES];
    }
  },

  /**
   * Get a single property by id
   * @param {number} id
   * @returns {Object|undefined}
   */
  getById(id) {
    return this.getAll().find(p => p.id === Number(id));
  },

  /**
   * Save the full array back to localStorage
   * @param {Array} props
   */
  save(props) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(props));
  },

  /**
   * Add a new property
   * @param {Object} prop — without id
   * @returns {Object} — with generated id
   */
  add(prop) {
    const props = this.getAll();
    const newProp = { ...prop, id: Date.now() };
    props.unshift(newProp);
    this.save(props);
    return newProp;
  },

  /**
   * Remove a property by id
   * @param {number} id
   */
  remove(id) {
    const props = this.getAll().filter(p => p.id !== Number(id));
    this.save(props);
  },

  /**
   * Filter properties
   * @param {string} tipo   — 'todas' | 'venta' | 'alquiler'
   * @param {string} query  — search string
   * @param {string} barrio — '' means all
   * @returns {Array}
   */
  filter(tipo = 'todas', query = '', barrio = '') {
    let props = this.getAll();
    if (tipo !== 'todas') props = props.filter(p => p.tipo === tipo);
    if (barrio) props = props.filter(p => (p.barrio || '') === barrio);
    if (query.trim()) {
      const q = query.toLowerCase();
      props = props.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.desc   || '').toLowerCase().includes(q) ||
        (p.zone   || '').toLowerCase().includes(q) ||
        (p.barrio || '').toLowerCase().includes(q)
      );
    }
    return props;
  },

  /**
   * Get all unique barrios sorted alphabetically
   * @returns {string[]}
   */
  getBarrios() {
    return [
      // ── Montevideo ──
      'Aguada', 'Aires Puros', 'Atahualpa', 'Bella Vista',
      'Blanqueada', 'Brazo Oriental', 'Buceo', 'Carrasco', 'Carrasco Norte',
      'Centro', 'Cerrito', 'Ciudad Vieja', 'Colón', 'Conciliación',
      'Cordón', 'Flor de Maroñas', 'Goes', 'Jacinto Vera',
      'La Comercial', 'La Teja', 'Larrañaga', 'Las Acacias',
      'Lezica', 'Malvín', 'Malvín Norte', 'Maroñas',
      'Mercado Modelo', 'Montevideo Viejo', 'Nuevo París',
      'Palermo', 'Parque Batlle', 'Parque Rodó', 'Paso de las Duranas',
      'Peñarol', 'Pocitos', 'Pocitos Nuevo', 'Prado',
      'Punta Carretas', 'Punta Gorda', 'Reducto', 'Reus',
      'Sayago', 'Step', 'Tres Cruces', 'Unión',
      'Villa Española', 'Villa Muñoz', 'Villanueva',
      // ── Ciudad de la Costa ──
      'Ciudad de la Costa',
      'Shangrila', 'El Pinar', 'Solymar', 'Lagomar',
      'Salinas', 'Neptunia', 'Zinnia', 'Bello Horizonte',
      'Lomas de Solymar', 'Parque Miramar', 'Colinas de Solymar',
      // ── Otros ──
      'Otros',
    ];
  },

  /**
   * Get similar properties (same tipo, exclude current id)
   * @param {number} id
   * @param {string} tipo
   * @returns {Array}
   */
  getSimilar(id, tipo) {
    return this.getAll()
      .filter(p => p.id !== Number(id) && p.tipo === tipo)
      .slice(0, 3);
  },
};
