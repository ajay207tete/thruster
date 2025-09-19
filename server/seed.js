const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberpunk-app';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create sample products
    const products = [
      {
        name: 'Neon Jacket',
        description: 'A stylish neon jacket for the cyberpunk enthusiast.',
        image: 'https://example.com/images/neon-jacket.jpg',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['neon green', 'neon pink'],
        price: 120,
        stock: 10,
      },
      {
        name: 'Smart Gloves',
        description: 'Gloves with smart tech integration.',
        image: 'https://example.com/images/smart-gloves.jpg',
        sizes: ['M', 'L'],
        colors: ['black', 'grey'],
        price: 80,
        stock: 15,
      },
      {
        name: 'LED Cap',
        description: 'Cap with LED lights for night visibility.',
        image: 'https://example.com/images/led-cap.jpg',
        sizes: ['One Size'],
        colors: ['red', 'blue'],
        price: 60,
        stock: 20,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('Sample products created');

    // Create sample user with booking and shipping details
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      shippingDetails: {
        address: '123 Cyberpunk St',
        city: 'Neon City',
        postalCode: '12345',
        country: 'Futuristan',
        phone: '123-456-7890',
      },
      bookings: [
        {
        productId: createdProducts[0]._id,
        quantity: 1,
        bookingDate: new Date(),
        status: 'pending',
        },
      ],
    });

    await user.save();
    console.log('Sample user created');

    mongoose.connection.close();
    console.log('Seeding complete and connection closed');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

seed();
