import mongoose from "mongoose";

async function ensureTenantIndexes() {
  const db = mongoose.connection;
  const collections = [
    {
      name: "departments",
      oldIndexName: "name_1",
      newIndexes: [
        { spec: { tenant: 1, name: 1 }, options: { unique: true, background: true } }
      ]
    },
    {
      name: "batches",
      oldIndexName: "name_1",
      newIndexes: [
        { spec: { tenant: 1, department: 1, name: 1 }, options: { unique: true, background: true } }
      ]
    },
    {
      name: "sections",
      oldIndexName: "name_1",
      newIndexes: [
        { spec: { tenant: 1, department: 1, batch: 1, name: 1 }, options: { unique: true, background: true } }
      ]
    }
  ];

  for (const { name, oldIndexName, newIndexes } of collections) {
    try {
      const collection = db.collection(name);
      const indexes = await collection.indexes();

      if (indexes.some((index) => index.name === oldIndexName)) {
        await collection.dropIndex(oldIndexName);
        console.log(`Dropped stale index ${oldIndexName} on ${name}`);
      }

      for (const index of newIndexes) {
        await collection.createIndex(index.spec, index.options);
      }
    } catch (error) {
      if (error.codeName === "IndexNotFound") {
        continue;
      }
      console.warn(`Could not ensure indexes for ${name}:`, error.message || error);
    }
  }
}

async function connetToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true
    });
    console.log("Connected To Database");
    await ensureTenantIndexes();
  } catch (err) {
    console.log(err);
  }
}

export default connetToDB;