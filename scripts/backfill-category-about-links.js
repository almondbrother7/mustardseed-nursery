/* eslint-disable no-console */
const admin = require("firebase-admin");
const path = require("path");

// Adjust path to your service account JSON
const serviceAccount = require(path.join(__dirname, "../private/service-account.json"));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const CATEGORIES_COLLECTION = "categories";

// Defaults you want to seed when fields are missing:
const DEFAULT_ABOUT = "";
const DEFAULT_LINKS = []; // or provide one or two starter links

(async () => {
  try {
    const snap = await db.collection(CATEGORIES_COLLECTION).get();
    if (snap.empty) {
      console.log("No category docs found.");
      process.exit(0);
    }

    let batch = db.batch();
    let writes = 0;

    snap.forEach((doc) => {
      const data = doc.data() || {};
      const needsAbout = typeof data.about !== "string";
      const needsLinks = !Array.isArray(data.links);

      if (needsAbout || needsLinks) {
        const update = {};
        if (needsAbout) update.about = DEFAULT_ABOUT;
        if (needsLinks) update.links = DEFAULT_LINKS;

        batch.update(doc.ref, update);
        writes++;
      }
    });

    if (writes === 0) {
      console.log("All documents already have about/links. Nothing to do.");
      process.exit(0);
    }

    await batch.commit();
    console.log(`Backfill complete. Updated ${writes} document(s).`);
    process.exit(0);
  } catch (err) {
    console.error("Backfill failed:", err);
    process.exit(1);
  }
})();
