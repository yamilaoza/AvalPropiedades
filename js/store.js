const firebaseConfig = {
  apiKey: "AIzaSyBIR8g6BZnMVT-obkWWm6HIo_SWld8Vm2E",
  authDomain: "aval-propiedades.firebaseapp.com",
  projectId: "aval-propiedades",
  storageBucket: "aval-propiedades.firebasestorage.app",
  messagingSenderId: "605225523291",
  appId: "1:605225523291:web:d1cbd2698a775a5b8ac77e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const COL = 'properties';

const Store = {

  async getAll() {
    const snap = await db.collection(COL).orderBy('order', 'asc').get();
    return snap.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
  },

  async getById(id) {
    const all = await this.getAll();
    return all.find(p => String(p.id) === String(id));
  },

  async add(prop) {
    const all = await this.getAll();
    const newProp = { ...prop, id: Date.now(), order: all.length };
    await db.collection(COL).add(newProp);
    return newProp;
  },

  async remove(id) {
    const all = await this.getAll();
    const item = all.find(p => String(p.id) === String(id));
    if (item?._docId) await db.collection(COL).doc(item._docId).delete();
  },

  async save(props) {
    // Para reordenar — actualiza el campo order de cada uno
    const batch = db.batch();
    props.forEach((prop, i) => {
      if (prop._docId) {
        batch.update(db.collection(COL).doc(prop._docId), { order: i });
      }
    });
    await batch.commit();
  },

  async updateOne(id, data) {
    const all = await this.getAll();
    const item = all.find(p => String(p.id) === String(id));
    if (item?._docId) await db.collection(COL).doc(item._docId).update(data);
  },

  async filter(tipo = 'todas', query = '', barrio = '') {
    let props = await this.getAll();
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

  async getSimilar(id, tipo) {
    const all = await this.getAll();
    return all.filter(p => String(p.id) !== String(id) && p.tipo === tipo).slice(0, 3);
  },

  getBarrios() {
    return [
      'Aguada','Aires Puros','Atahualpa','Bella Vista','Blanqueada','Brazo Oriental',
      'Buceo','Carrasco','Carrasco Norte','Centro','Cerrito','Ciudad Vieja','Colón',
      'Conciliación','Cordón','Flor de Maroñas','Goes','Jacinto Vera','La Comercial',
      'La Teja','Larrañaga','Las Acacias','Lezica','Malvín','Malvín Norte','Maroñas',
      'Mercado Modelo','Montevideo Viejo','Nuevo París','Palermo','Parque Batlle',
      'Parque Rodó','Paso de las Duranas','Peñarol','Pocitos','Pocitos Nuevo','Prado',
      'Punta Carretas','Punta Gorda','Reducto','Reus','Sayago','Step','Tres Cruces',
      'Unión','Villa Española','Villa Muñoz','Villanueva',
      'Ciudad de la Costa','Shangrila','El Pinar','Solymar','Lagomar','Salinas',
      'Neptunia','Zinnia','Bello Horizonte','Lomas de Solymar','Parque Miramar',
      'Colinas de Solymar','Otros',
    ];
  },

  async uploadPhoto(file) {
  // Comprime la imagen antes de subir
  const compressed = await this._compressImage(file, 1400, 0.82);
  const path = `photos/${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
  const ref = storage.ref(path);
  await ref.put(compressed);
  return await ref.getDownloadURL();
},

_compressImage(file, maxWidth, quality) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
},
};