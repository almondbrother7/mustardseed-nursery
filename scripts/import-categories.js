const admin = require("firebase-admin");
const serviceAccount = require("../private/service-account.json");
const categories = require("../private/load-categories.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importCategories() {
  const batch = db.batch();
  const categoriesRef = db.collection("categories");

  categories.forEach((category) => {
    const docRef = categoriesRef.doc(category.slug);
    if (!snapshot.exists) {
      batch.set(docRef, category);
    }
  });

  await batch.commit();
  console.log("✅ Categories imported successfully!");
}

importCategories().catch(console.error);
