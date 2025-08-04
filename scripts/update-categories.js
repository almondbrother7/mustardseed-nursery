// scripts/update-categories.js
const admin = require("firebase-admin");
const serviceAccount = require("../private/service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const taglines = {
  "Butterfly Garden": {
    tagline: "Bring the pollinators!",
    description:
      "These vibrant flowers attract butterflies and hummingbirds while beautifying your space.",
  },
  "Survival Garden": {
    tagline: "Grow to thrive.",
    description:
      "Nutritious and resilient plants perfect for self-sufficiency and sustainability.",
  },
  "Native Plants": {
    tagline: "Florida tough, pollinator friendly.",
    description:
      "Low-maintenance natives that thrive in your region and support local ecosystems.",
  },
  Vegetables: {
    tagline: "Fresh from the garden.",
    description:
      "Grow your own delicious veggies and herbs for a healthy harvest.",
  },
  "Flowering Plants": {
    tagline: "Blooms that wow.",
    description:
      "Gorgeous blooms for color, fragrance, and visual impact.",
  },
  Miscellaneous: {
    tagline: "Unique & interesting.",
    description:
      "A mix of plants that do not fit elsewhere but deserve a place in your garden.",
  },
};

async function updateCategories() {
  const snapshot = await db.collection("categories").get();
  const batch = db.batch();

  snapshot.forEach((doc) => {
    const data = doc.data();
    const update = taglines[data.label];
    if (update) {
      batch.update(doc.ref, update);
      console.log(`✅ Updating ${data.label}`);
    } else {
      console.log(`⚠️  No tagline for ${data.label}`);
    }
  });

  await batch.commit();
  console.log("✅ Taglines/descriptions updated!");
}

updateCategories().catch(console.error);
