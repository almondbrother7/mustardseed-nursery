const admin = require("firebase-admin");
const serviceAccount = require("../private/service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function deleteAllPlants() {
  const snapshot = await db.collection("plants").get();

  if (snapshot.empty) {
    console.log("✅ No documents found in 'plants' collection.");
    return;
  }

  const batch = db.batch();
  let count = 0;

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });

  await batch.commit();
  console.log(`🔥 Deleted ${count} plant(s) from the 'plants' collection.`);
}

deleteAllPlants().catch((err) => {
  console.error("❌ Failed to delete plants:", err);
});
