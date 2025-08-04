const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("../private/service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportPlants() {
  const snapshot = await db.collection("plants").get();
  const plants = snapshot.docs.map(doc => doc.data());

  const outputPath = path.resolve(__dirname, "../private/load-plants.json");
  fs.writeFileSync(outputPath, JSON.stringify(plants, null, 2));
  console.log(`✅ Exported ${plants.length} plants to ${outputPath}`);
}

exportPlants().catch((err) => {
  console.error("❌ Failed to export plants:", err);
});
