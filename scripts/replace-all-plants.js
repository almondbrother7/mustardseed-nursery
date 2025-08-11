/* scripts/replace-all-plants.js */
/* eslint-disable no-console */

const args = process.argv.slice(2);
const commit = args.includes("--commit");

const admin = require("firebase-admin");
const serviceAccount = require("../private/service-account.json");
const sourcePlants = require("../private/load-plants.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// --- utils ---
const slugify = (str) =>
  (str || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^\x00-\x7F]+/g, "")   // strip non-ASCII safely
    .replace(/[^\w\s-]/g, "")        // keep word chars, space, dash
    .replace(/[\s_-]+/g, "-")        // collapse whitespace/underscores/dashes
    .replace(/^-+|-+$/g, "");        // trim leading/trailing -

const REQUIRED = [
  "name",
  "price",
  "categories",
  "inventory",
  "thumbnail",
  "fullImage",
  "infoUrl",
];

// Validate minimal shape (allow 0 for numeric fields)
function validate(p) {
  const missing = REQUIRED.filter((k) => {
    if (!Object.prototype.hasOwnProperty.call(p, k)) return true;
    const v = p[k];
    if (k === "price" || k === "inventory") return v === null || v === undefined;
    return v === null || v === undefined || v === "";
  });
  return { ok: missing.length === 0, missing };
}

async function getNextPlantID() {
  const ref = db.collection("counters").doc("plantID");
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = (snap.data()?.current ?? 0) | 0;
    const next = current + 1;
    tx.set(ref, { current: next }, { merge: true });
    return next;
  });
}

async function wipeAndImport({ commit = false } = {}) {
  const BATCH_LIMIT = 500;

  // 1) DELETE all existing plants
  console.log("Fetching existing plants for deletion...");
  const snap = await db.collection("plants").get();
  let batch = db.batch();
  let ops = 0;
  let deleteCount = 0;

  for (const doc of snap.docs) {
    console.log(`DELETE: ${doc.id} (${doc.data().name || "no name"})`);
    if (commit) {
      batch.delete(doc.ref);
      ops++;
      if (ops === BATCH_LIMIT) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
    deleteCount++;
  }

  if (commit && ops > 0) await batch.commit();
  console.log(`Deleted ${deleteCount} plants${commit ? "" : " (dry run)"}`);

  // 2) IMPORT from source file
  console.log("\nImporting plants from source file...");
  batch = db.batch();
  ops = 0;
  let importCount = 0;

  for (const raw of sourcePlants) {
    const slug = (raw.slug?.trim() || slugify(raw.name)).toLowerCase();
    const plant = {
      ...raw,
      slug,
      categories: Array.isArray(raw.categories) ? raw.categories : [],
      description: raw.description ?? "",
    };

    const { ok, missing } = validate(plant);
    if (!ok) {
      console.warn(`SKIP: "${raw.name}" missing: ${missing.join(", ")}`);
      continue;
    }

    const plantID = commit ? await getNextPlantID() : importCount + 1;
    plant.plantID = plantID;

    console.log(`ADD: #${plantID} "${plant.name}" (${slug})`);
    if (commit) {
      batch.set(db.collection("plants").doc(String(plantID)), plant);
      ops++;
      if (ops === BATCH_LIMIT) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
    importCount++;
  }

  if (commit && ops > 0) await batch.commit();
  console.log(`Imported ${importCount} plants${commit ? "" : " (dry run)"}`);

  if (!commit) console.log("\nUse --commit to apply changes.");
}

wipeAndImport({ commit }).catch((err) => {
  console.error("WIPE+IMPORT FAILED:", err);
  process.exit(1);
});
