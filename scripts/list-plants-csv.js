/*
node scripts/list-plants-csv.js > ./plants.csv
node scripts/list-plants-csv.js vegetables > ./veg.csv
*/

/* eslint-disable no-console */
const admin = require('firebase-admin');
const path = require('path');

try {
  const serviceAccount = require(path.join(__dirname, '..', 'private', 'service-account.json'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} catch (e) {
  console.error('Failed to init Firebase Admin. Make sure private/service-account.json exists.');
  process.exit(1);
}

const db = admin.firestore();

const FIELDS = [
//   'id', 'name', 'slug', 'price', 'inventory', 'categories', 'description', 'thumbnail', 'fullImage', 'infoUrl'
  'name', 'price', 'inventory', 'description'
];

function toCsvRow(obj) {
  const val = (v) => {
    if (Array.isArray(v)) v = v.join('|');
    if (v === undefined || v === null) v = '';
    v = String(v);
    // escape quotes and wrap
    return `"${v.replace(/"/g, '""')}"`;
  };
  return FIELDS.map(f => val(obj[f])).join(',');
}

(async () => {
  try {
    const filterSlugs = process.argv.slice(2).map(s => s.toLowerCase());

    let q = db.collection('plants');
    if (filterSlugs.length === 1) q = q.where('categories', 'array-contains', filterSlugs[0]);

    const snapshot = await q.get();
    if (snapshot.empty) {
      console.log('No plants found.');
      process.exit(0);
    }

    let docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (filterSlugs.length > 1) {
      docs = docs.filter(p => {
        const cats = (p.categories || []).map(x => String(x).toLowerCase());
        return filterSlugs.every(slug => cats.includes(slug));
      });
    }

    // sort by name
    docs.sort((a, b) => String(a.name||'').localeCompare(String(b.name||''), undefined, { sensitivity: 'base' }));

    // header
    console.log(FIELDS.map(f => `"${f}"`).join(','));
    // rows
    for (const d of docs) console.log(toCsvRow(d));

    process.exit(0);
  } catch (err) {
    console.error('Error listing plants (CSV):', err);
    process.exit(1);
  }
})();
