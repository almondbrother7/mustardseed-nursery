/*
USAGE

# 0) Build (only needed if you want --dist checks)
npx ng build --configuration production

# 1) Dry run: list problems (Firestore strings + optional file existence)
npm run sweep:img
# or with dist verification (adjust folder if needed):
npm run sweep:img -- --predeploy  


# 2) Auto-fix Firestore paths (adds leading '/', ensures .jpg, trims weird chars)
npm run sweep:img:fix
# (You can also include --dist here to validate files at the same time.)

# 3) Pre-deploy guard: fails if any *-not-in-dist is found
npx ng build --configuration production
npm run sweep:img -- --predeploy  
*/

 /* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function resolveDistArg(rawDist) {
  if (rawDist) return rawDist;
  try {
    const fb = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'firebase.json'), 'utf8'));
    if (fb && fb.hosting && fb.hosting.public) return fb.hosting.public;
  } catch (_) {}
  // fallback guesses
  const guesses = [
    'dist/mustardseed-nursery',
    'dist/mustard-seed-nursery',
    'dist/mustard-seed-nursery/browser',
    'dist/mustardseed-nursery/browser',
  ];
  for (const g of guesses) {
    if (fs.existsSync(path.resolve(__dirname, '..', g))) return g;
  }
  return null;
}

// ---------- CLI args ----------
const args = process.argv.slice(2);
const FIX  = args.includes('--fix');
const rawDist = (args.find(a => a.startsWith('--dist=')) || '').split('=')[1] || null;
const PREDEPLOY = args.includes('--predeploy');
const DIST = resolveDistArg(rawDist);
if (DIST) {
  console.log('Verifying built files in:', DIST);
} else if (rawDist) {
  console.warn('Warning: specified --dist not found on disk:', rawDist);
}

// ---------- Firebase init (explicit projectId for clarity) ----------
const serviceAccount = require('../private/service-account.json');
const PROJECT_ID = serviceAccount.project_id || process.env.GCLOUD_PROJECT || '(unknown)';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: PROJECT_ID
});
console.log('Project ID:', PROJECT_ID);
if (DIST) console.log('Verifying built files in:', DIST);
const db = admin.firestore();

// ---------- Paths ----------
const SRC_ROOT = path.resolve(__dirname, '..', 'src'); // adjust if your source root differs
const COLLECTION = 'plants'; // adjust if your collection name differs

// ---------- Helpers ----------
function stripWeird(s) {
  if (!s) return s;
  return s.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}
function normalizeAssetPath(p) {
  if (!p) return null;
  let s = stripWeird(p);
  if (!s) return null;
  if (!s.startsWith('/')) s = '/' + s;
  if (s.startsWith('/assets/') && !/\.(jpg|jpeg|png|webp|gif)$/i.test(s)) {
    s += '.jpg';
  }
  return s;
}
function looksLikeHref(u) {
  if (!u) return false;
  const s = stripWeird(u);
  return /^(https?:)?\/\//i.test(s) || s.startsWith('/');
}
function srcPathFor(assetPath) {
  if (!assetPath || !assetPath.startsWith('/assets/')) return null;
  return path.join(SRC_ROOT, assetPath.slice(1));
}
function distPathFor(assetPath) {
  if (!DIST || !assetPath || !assetPath.startsWith('/assets/')) return null;
  return path.join(DIST, assetPath.slice(1));
}

async function sweepOnce({ fix = false } = {}) {
  const snap = await db.collection(COLLECTION).get();

  let checked = 0, issues = 0, fixed = 0;
  const batch = db.batch();
  const problemRows = [];
  const missingDistFiles = [];

  for (const doc of snap.docs) {
    checked++;
    const p = doc.data();
    const beforeThumb = p.thumbnail ?? null;
    const beforeFull  = p.fullImage ?? null;

    const afterThumb = normalizeAssetPath(beforeThumb);
    const afterFull  = normalizeAssetPath(beforeFull);

    const problems = [];

    // String normalization
    if (beforeThumb && afterThumb !== beforeThumb) problems.push('thumbnail-normalized');
    if (beforeFull  && afterFull  !== beforeFull)  problems.push('fullImage-normalized');

    // Missing fields
    if (!afterThumb) problems.push('thumbnail-missing');
    if (!afterFull)  problems.push('fullImage-missing');

    // File existence (src)
    const srcThumb = srcPathFor(afterThumb);
    const srcFull  = srcPathFor(afterFull);
    if (srcThumb && !fs.existsSync(srcThumb)) problems.push('thumbnail-not-in-src');
    if (srcFull  && !fs.existsSync(srcFull))  problems.push('fullImage-not-in-src');

    // File existence (dist), if provided
    const distThumb = distPathFor(afterThumb);
    const distFull  = distPathFor(afterFull);
    if (distThumb && !fs.existsSync(distThumb)) {
      problems.push('thumbnail-not-in-dist');
      missingDistFiles.push(distThumb);
    }
    if (distFull && !fs.existsSync(distFull)) {
      problems.push('fullImage-not-in-dist');
      missingDistFiles.push(distFull);
    }

    // infoUrl sanity
    const cleanedInfoUrl = stripWeird(p.infoUrl || '');
    if (cleanedInfoUrl && !looksLikeHref(cleanedInfoUrl)) problems.push('infoUrl-suspect');

    if (problems.length) {
      issues++;
      problemRows.push(`⚠ ${doc.id} (${p.name || 'unnamed'}): ${problems.join(', ')}`);

      if (fix) {
        const update = {};
        if (afterThumb !== beforeThumb) update.thumbnail = afterThumb;
        if (afterFull  !== beforeFull)  update.fullImage = afterFull;
        if (cleanedInfoUrl !== (p.infoUrl || '')) update.infoUrl = cleanedInfoUrl;

        if (Object.keys(update).length) {
          batch.update(doc.ref, update);
          fixed++;
        }
      }
    }
  }

  if (problemRows.length) {
    // Print the list (pre-fix view)
    problemRows.forEach(r => console.log(r));
  }

  if (fix && fixed) {
    await batch.commit();
  }

  return { checked, issues, fixed, listed: problemRows.length, missingDistFiles };
}

(async () => {
  // First pass
  const pass1 = await sweepOnce({ fix: FIX });

  console.log('—');
  console.log(`Checked: ${pass1.checked}`);
  console.log(`Docs with issues (before${FIX ? ' fix' : ''}): ${pass1.issues}`);
  if (FIX) console.log(`Docs updated: ${pass1.fixed}`);
  if (!DIST) console.log('Tip: pass --dist=dist/mustardseed-nursery/browser to also verify built files.');

  // If we fixed anything, recheck to confirm it's clean
  if (FIX && pass1.fixed > 0) {
    console.log('\nRechecking after fix...\n');
    const pass2 = await sweepOnce({ fix: false });
    console.log('—');
    console.log(`Post-fix: remaining docs with issues: ${pass2.issues}`);
    if (pass2.issues > 0) {
      console.log('Some issues remain. Common causes: wrong filename case, missing files in src/dist, or different collection/project.');
    } else {
      console.log('All clean ✅');
    }
  }

  // Pre-deploy guard
  if (PREDEPLOY && DIST && pass1.missingDistFiles.length > 0) {
    console.error('\n❌ Pre-deploy check failed: Missing files in dist:');
    pass1.missingDistFiles.forEach(file => console.error('  ' + file));
    process.exit(2);
  }

  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
