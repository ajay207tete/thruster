import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkCollections() {
  try {
    console.log('🔍 Checking MongoDB collections...');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    console.log('\n📋 Found collections:');
    collectionNames.forEach(name => console.log(`  - ${name}`));

    // Check document counts for our expected collections
    const expectedCollections = ['users', 'products', 'orders', 'rewards', 'carts', 'paymentlogs'];

    console.log('\n📊 Document counts:');
    for (const collectionName of expectedCollections) {
      if (collectionNames.includes(collectionName)) {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        console.log(`  - ${collectionName}: ${count} documents`);
      } else {
        console.log(`  - ${collectionName}: Collection not found`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Check completed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCollections();
