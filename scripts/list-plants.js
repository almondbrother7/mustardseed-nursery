/*
node scripts/list-plants.js          # all plants (pretty JSON)
node scripts/list-plants.js vegetables     # filter by one category slug
node scripts/list-plants.js fruits vegetables  # AND filter by multiple slugs
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

(async () => {
  try {
    // Optional args: node scripts/list-plants.js fruits vegetables
    const filterSlugs = process.argv.slice(2).map(s => s.toLowerCase());

    let q = db.collection('plants');
    // If you pass a single category slug, we can use array-contains efficiently
    if (filterSlugs.length === 1) {
      q = q.where('categories', 'array-contains', filterSlugs[0]);
    }

    const snapshot = await q.get();
    if (snapshot.empty) {
      console.log('No plants found.');
      process.exit(0);
    }

    let docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // If multiple category filters, do client-side AND filter
    if (filterSlugs.length > 1) {
      docs = docs.filter(p => {
        const cats = (p.categories || []).map(x => String(x).toLowerCase());
        return filterSlugs.every(slug => cats.includes(slug));
      });
    }

    // Sort by name (case-insensitive)
    docs.sort((a, b) => String(a.name||'').localeCompare(String(b.name||''), undefined, { sensitivity: 'base' }));

    console.log(JSON.stringify(docs, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error listing plants:', err);
    process.exit(1);
  }
})();
