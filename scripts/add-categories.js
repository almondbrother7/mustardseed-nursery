/* node scripts/add-categories.js */
/* eslint-disable no-console */
const admin = require('firebase-admin');
const serviceAccount = require('../private/service-account.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const slugify = (s) => (s || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '');

const NEW_CATEGORIES = [
  {
    label: 'Fruits',
    tagline: 'Sweet harvests for your table.',
    about: '',
    icon: '🍎',
    links: [],
    sortOrder: 10,
  },
  {
    label: 'Vegetables',
    tagline: 'Garden-fresh goodness every season.',
    about: '',
    icon: '🥕',
    links: [],
    sortOrder: 20,
  },
  {
    label: 'Edibles (other)',
    tagline: 'Herbs, spices, and tasty extras.',
    about: '',
    icon: '🥬',
    links: [],
    sortOrder: 30,
  },
  {
    label: 'Tea Flowers & Leaves',
    tagline: 'Sip nature’s calming brew.',
    about: '',
    icon: '🍵',
    links: [],
    sortOrder: 40,
  },
  {
    label: 'Products (other)',
    tagline: 'Unique items from our nursery to you.',
    about: '',
    icon: '🧺',
    links: [],
    sortOrder: 50,
  },
];

// validation
function validateCategory(c) {
  const required = ['label', 'sortOrder'];
  for (const key of required) {
    if (c[key] === undefined || c[key] === null || c[key] === '') {
      throw new Error(`Category missing required field: ${key}`);
    }
  }
}

(async () => {
  try {
    const batch = db.batch();

    for (const c of NEW_CATEGORIES) {
      validateCategory(c);
      const slug = c.slug ? slugify(c.slug) : slugify(c.label);

      const ref = db.collection('categories').doc(slug);

      // Only the fields you specified or already use:
      const doc = {
        slug,
        label: c.label,
        tagline: c.tagline || '',
        about: c.about || '',
        icon: c.icon || '', 
        links: Array.isArray(c.links) ? c.links : [],
        sortOrder: Number(c.sortOrder),
      };

      batch.set(ref, doc, { merge: true }); // safe to re-run
    }

    await batch.commit();
    console.log('✅ Categories added/updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add categories:', err);
    process.exit(1);
  }
})();
