const admin = require('firebase-admin');
const serviceAccount = require('../private/service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migratePlants() {
  const snapshot = await db.collection('plants').get();

  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const currentDocID = doc.id;

    if (!data.plantID) {
      console.warn(`❌ Skipping ${currentDocID} — missing plantID`);
      continue;
    }

    const newDocID = data.plantID.toString();

    if (newDocID === currentDocID) {
      console.log(`✅ Skipping ${currentDocID} — already migrated`);
      continue;
    }

    const newDocRef = db.collection('plants').doc(newDocID);
    const newDocExists = await newDocRef.get();

    if (newDocExists.exists) {
      console.warn(`⚠️ Skipping ${currentDocID} — conflict on ${newDocID}`);
      continue;
    }

    console.log(`🔁 Copying ${currentDocID} → ${newDocID}`);

    await newDocRef.set(data);       // Copy data to new doc
    await doc.ref.delete();          // Delete old doc

    updated++;
  }

  console.log(`\n✅ Migrated ${updated} plant(s) to use plantID as document ID`);
}

migratePlants().catch(err => {
  console.error('❌ Migration failed:', err);
});
