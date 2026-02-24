/**
 * store.js — Central Data Store
 * All property data lives here. Uses localStorage for persistence.
 */

const STORAGE_KEY = 'aval_properties';

const DEFAULT_PROPERTIES = [
  {
    id: 1,
    title: 'AVAL Alq. Apartamento a Estrenar Centro 1 Dorm c/garaje',
    tipo: 'alquiler',
    price: '$ 28.000',
    img: 'https://http2.mlstatic.com/D_NQ_NP_2X_886422-MLU82009268978_022025-F.webp',
    photos: ['https://http2.mlstatic.com/D_NQ_NP_2X_886422-MLU82009268978_022025-F.webp'],
    link: 'https://apartamento.mercadolibre.com.uy/MLU-710301534-alquiler-apartamento-a-estrenar-1-dormitorio-c-gge-centro-aval-propiedades-_JM',
    desc: 'Apartamento a estrenar en el corazón del Centro de Montevideo. 1 dormitorio con garaje incluido. Edificio moderno con todos los servicios.',
    zone: 'Centro, Montevideo',
    barrio: 'Centro',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.7!2d-56.1882!3d-34.9058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCentro%2C+Montevideo!5e0!3m2!1ses!2suy!4v1',
  },
  {
    id: 2,
    title: 'AVAL Apartamento Pocitos 2 Dormitorios y demás',
    tipo: 'venta',
    price: 'U$S 295.000',
    img: 'https://http2.mlstatic.com/D_NQ_NP_2X_940450-MLU80510795842_112024-F.webp',
    photos: ['https://http2.mlstatic.com/D_NQ_NP_2X_940450-MLU80510795842_112024-F.webp'],
    link: 'https://apartamento.mercadolibre.com.uy/MLU-701618090-aval-a-estrenar-2-dorm-y-demas-pocitos-echeverriarza-desde-usd-334500-_JM',
    desc: 'A estrenar en el barrio Pocitos, sobre Echevarriarza. 2 dormitorios en suite, living-comedor, cocina equipada y terraza.',
    zone: 'Pocitos, Montevideo',
    barrio: 'Pocitos',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.7!2d-56.1582!3d-34.9158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sPocitos%2C+Montevideo!5e0!3m2!1ses!2suy!4v1',
  },
  {
    id: 3,
    title: 'Aval Oportunidad 1 Dormitorio Aguada – Av. Libertador',
    tipo: 'venta',
    price: 'U$S 144.020',
    img: 'https://http2.mlstatic.com/D_NQ_NP_2X_724056-MLU82425966019_022025-F.webp',
    photos: ['https://http2.mlstatic.com/D_NQ_NP_2X_724056-MLU82425966019_022025-F.webp'],
    link: 'https://apartamento.mercadolibre.com.uy/MLU-711765506-aval-oportunidad-1-dormitorio-aguada-av-libertador-ed-01-libertador-_JM',
    desc: 'Excelente oportunidad en Aguada, sobre Av. Libertador. Ed. 01 Libertador. Apartamento de 1 dormitorio con buenas terminaciones.',
    zone: 'Aguada, Montevideo',
    barrio: 'Aguada',
    mapUrl: '',
  },
  {
    id: 4,
    title: 'AVAL Venta Apto Centro 2 Dormitorios – Ed. 01 Sync',
    tipo: 'venta',
    price: '$ 149.700',
    img: 'https://http2.mlstatic.com/D_NQ_NP_2X_956252-MLU80080350528_102024-F.webp',
    photos: ['https://http2.mlstatic.com/D_NQ_NP_2X_956252-MLU80080350528_102024-F.webp'],
    link: 'https://apartamento.mercadolibre.com.uy/MLU-698881690-aval-oportunidad-2-dormitorios-centro-canelones-y-rio-negro-ed-01-sync-al-frente-amenities-_JM',
    desc: 'Canelones y Río Negro. Edificio 01 Sync, al frente. 2 dormitorios con amenities completos: piscina, gimnasio y salón de eventos.',
    zone: 'Centro, Montevideo',
    barrio: 'Centro',
    mapUrl: '',
  },
  {
    id: 5,
    title: 'AVAL – Venta Aptos a Estrenar VENTURA – Tres Cruces',
    tipo: 'venta',
    price: 'U$S 99.900',
    img: 'https://ventura.com.uy/files/attachment/4608/0.33724400_1741364504.jpg',
    photos: ['https://ventura.com.uy/files/attachment/4608/0.33724400_1741364504.jpg'],
    link: 'https://www.instagram.com/p/DHJgoQIpvm1/',
    desc: 'Proyecto VENTURA en Tres Cruces. Apartamentos a estrenar con diseño moderno, terminaciones de primer nivel e inmejorable ubicación.',
    zone: 'Tres Cruces, Montevideo',
    barrio: 'Tres Cruces',
    mapUrl: '',
  },
  {
    id: 6,
    title: 'AVAL Venta Apartamento a Estrenar La Blanqueda',
    tipo: 'venta',
    price: 'U$S 106.900',
    img: 'https://ventura.com.uy/files/attachment/2039/0.38112300_1634133402.jpg',
    photos: ['https://ventura.com.uy/files/attachment/2039/0.38112300_1634133402.jpg'],
    link: 'https://www.instagram.com/p/DHJgoQIpvm1/?img_index=1',
    desc: 'Apartamento a estrenar en La Blanqueda. Excelente oportunidad de inversión. Arquitectura contemporánea y espacios luminosos.',
    zone: 'La Blanqueda, Montevideo',
    barrio: 'La Blanqueda',
    mapUrl: '',
  },
  {
    id: 7,
    title: 'AVAL Venta Apto Centro 2 Dormitorios – Paraguay y La Paz',
    tipo: 'venta',
    price: 'U$S 151.880',
    img: 'https://http2.mlstatic.com/D_NQ_NP_742786-MLU80798868811_112024-O.webp',
    photos: ['https://http2.mlstatic.com/D_NQ_NP_742786-MLU80798868811_112024-O.webp'],
    link: 'https://apartamento.mercadolibre.com.uy/MLU-701453052-aval-a-estrenar-2-dorm-y-demas-paraguay-y-la-paz-desde-usd-151880-_JM',
    desc: 'Paraguay y La Paz, a estrenar. 2 dormitorios y demás dependencias. Edificio nuevo con amenities y excelente iluminación natural.',
    zone: 'Centro, Montevideo',
    barrio: 'Centro',
    mapUrl: '',
  },
  {
    id: 8,
    title: 'AVAL Venta Terreno 2400m² – Barros Blancos, Ruta 101',
    tipo: 'venta',
    price: 'U$S 95.000',
    img: 'https://http2.mlstatic.com/D_NQ_NP_2X_833987-MLU77031464288_062024-F.webp',
    photos: ['https://http2.mlstatic.com/D_NQ_NP_2X_833987-MLU77031464288_062024-F.webp'],
    link: 'https://terreno.mercadolibre.com.uy/MLU-684437886-aval-propiedades-venta-terreno-en-barros-blancos-de-2400m-proximo-a-ruta-101-_JM',
    desc: 'Terreno de 2.400m² en Barros Blancos próximo a Ruta 101. Excelente para desarrollo residencial o comercial. Servicios disponibles.',
    zone: 'Barros Blancos, Canelones',
    barrio: 'Barros Blancos',
    mapUrl: '',
  },
  {
    id: 9,
    title: 'AVAL Venta Monoambiente Centro – Domótica y Amenities',
    tipo: 'venta',
    price: 'U$S 110.000',
    img: 'https://http2.mlstatic.com/D_NQ_NP_2X_701010-MLU80080337234_102024-F.webp',
    photos: ['https://http2.mlstatic.com/D_NQ_NP_2X_701010-MLU80080337234_102024-F.webp'],
    link: 'https://apartamento.mercadolibre.com.uy/MLU-698920540-aval-monoambiente-centro-canelones-y-rio-negro-ed-01-sync-al-frente-domotica-amenities-_JM',
    desc: 'Ed. 01 Sync. Monoambiente moderno con domótica integrada, al frente, amenities premium. Ideal inversión con alta rentabilidad.',
    zone: 'Centro, Montevideo',
    barrio: 'Centro',
    mapUrl: '',
  },
  {
    id: 10,
    title: 'AVAL Venta Apartamento con Renta – Malvín E-Tower',
    tipo: 'venta',
    price: 'U$S 215.000',
    img: 'https://http2.mlstatic.com/D_NQ_NP_609412-MLU74091183508_012024-O.webp',
    photos: ['https://http2.mlstatic.com/D_NQ_NP_609412-MLU74091183508_012024-O.webp'],
    link: 'https://apartamento.mercadolibre.com.uy/MLU-669602094-aval-excelente-apto-con-renta-en-malvin-e-tower-2-dorm-2-bn-y-gje-usd-215000-_JM',
    desc: 'Excelente apartamento con renta activa en E-Tower Malvín. 2 dormitorios, 2 baños y garaje. Inversión segura con inquilino.',
    zone: 'Malvín, Montevideo',
    barrio: 'Malvín',
    mapUrl: '',
  },
  {
    id: 11,
    title: 'AVAL Alquiler Casa Solymar Lado Sur – 2 Dormitorios',
    tipo: 'alquiler',
    price: '$ 21.000',
    img: 'https://http2.mlstatic.com/D_NQ_NP_707666-MLU51374241998_092022-O.webp',
    photos: ['https://http2.mlstatic.com/D_NQ_NP_707666-MLU51374241998_092022-O.webp'],
    link: 'https://casa.mercadolibre.com.uy/MLU-617612012-aval-alquiler-solymar-lado-sur-prox-a-gianattasio-2-dorm-y-demas-21500-t099029301-_JM',
    desc: 'Casa en Solymar lado sur, próximo a Gianattasio. 2 dormitorios y demás dependencias. Jardín y garaje. Ideal para familia.',
    zone: 'Solymar, Canelones',
    barrio: 'Solymar',
    mapUrl: '',
  },
  {
    id: 12,
    title: 'Aval Oportunidad – Último Terreno de Esquina en Altos',
    tipo: 'venta',
    price: 'U$S 125.000',
    img: 'https://imagenes.gallito.com/1024x768/210514102205830.jpg',
    photos: ['https://imagenes.gallito.com/1024x768/210514102205830.jpg'],
    link: 'https://www.gallito.com.uy/aval-oportunidad-ultimo-terreno-esquina-en-altos-uss125000-inmuebles-19743304',
    desc: 'Último terreno de esquina disponible en Altos. Ubicación privilegiada, ideal para construcción residencial. No te lo pierdas.',
    zone: 'Altos, Canelones',
    barrio: 'Altos',
    mapUrl: '',
  },
];

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
