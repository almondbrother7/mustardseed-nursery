// to avoid DRY RUN:
//   node scripts/import-plants.js --commit


const admin = require("firebase-admin");
const serviceAccount = require("../private/service-account.json");
const plants = require("../private/load-plants.json");

// const categoryLabelToSlug = {
//   "Butterfly Garden": "butterfly-garden",
//   "Native Plants": "native-plants",
//   "Flowering Plants": "flowering-plants",
//   "Survival Garden": "survival-garden",
//   "Miscellaneous": "miscellaneous",
// };


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const slugify = (str) =>
  str.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')      // remove special chars
    .replace(/[\s_-]+/g, '-')      // collapse whitespace
    .replace(/^-+|-+$/g, '');      // trim dashes

const REQUIRED_FIELDS = [
  "plantID", "name", "price", "categories", "inventory", "infoUrl", "thumbnail"
];

function isValidPlant(plant) {
  for (const field of REQUIRED_FIELDS) {
    if (!plant[field] && plant[field] !== 0) {
      console.warn(`❌ Missing required field "${field}" in:`, plant.name || plant);
      return false;
    }
  }
  return true;
}

async function importPlants(dryRun = true) {
  const BATCH_LIMIT = 500;
  const slugSet = new Set();

  let batch = db.batch();
  let total = 0;
  let opCount = 0;

  for (const plant of plants) {
    if (!isValidPlant(plant)) continue;

    const slug = slugify(plant.name);
    // plant.categories = (plant.categories || [])
    //   .map(label => categoryLabelToSlug[label])
    //   .filter(Boolean);

    if (slugSet.has(slug)) {
      console.warn(`⚠️ Skipping duplicate slug: ${slug}`);
      continue;
    }
    slugSet.add(slug);

    // Ensure slug + infoUrl
    plant.slug = slug;
    if (!plant.infoUrl || plant.infoUrl === "https://example.com") {
      plant.infoUrl = `https://davesgarden.com/guides/pf/search/results.php?gralcom=${slug}&zip=false&s=R&list=list`;
    }

    const docRef = db.collection("plants").doc(slug);
    const existingDoc = await docRef.get();
    const exists = existingDoc.exists;

    const action = exists ? "🔁 Updating" : "➕ Creating";
    console.log(`🌱 ${action} "${plant.name}" → ${slug}`);

    if (!dryRun) {
      batch.set(docRef, plant);
      opCount++;
    }

    total++;

    if (opCount === BATCH_LIMIT) {
      if (!dryRun) await batch.commit();
      console.log(`🚚 Committed batch of ${opCount}`);
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0 && !dryRun) {
    await batch.commit();
    console.log(`🚚 Final batch of ${opCount} committed`);
  }

  console.log(`\n✅ ${dryRun ? "Previewed" : "Imported"} ${total} plant(s)`);
}

// CLI arg: --commit
const args = process.argv.slice(2);
const dryRun = !args.includes("--commit");

importPlants(dryRun).catch(err => {
  console.error("❌ Import failed:", err);
});
