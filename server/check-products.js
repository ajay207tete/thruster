import mongoose from 'mongoose';
import Product from './models/Product.js';

const MONGODB_URI = 'mongodb+srv://ajayte207_db_user:Ajayte207@cluster0.gohrt1h.mongodb.net/thruster?appName=Cluster0';

async function checkProducts() {
  try {
    console.log('🔍 Checking products in MongoDB thruster database...\n');

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    const products = await Product.find({}).sort({ createdAt: -1 });
    console.log(`📊 Found ${products.length} products in database\n`);

    if (products.length === 0) {
      console.log('❌ No products found! Running seed script...\n');
      // Import and run seed
      const { default: seed } = await import('./seed.js');
      await seed();
      console.log('✅ Seeding completed');
    } else {
      console.log('📋 Product list:');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price} (${product.category})`);
        console.log(`   Stock: ${product.stock}, Image: ${product.imageUrl ? '✅' : '❌'}`);
      });
    }

    console.log('\n🎯 Database check completed successfully');

  } catch (error) {
    console.error('❌ Error checking products:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkProducts();
