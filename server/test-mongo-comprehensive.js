import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Reward from './models/Reward.js';
import PaymentLog from './models/PaymentLog.js';
import Cart from './models/Cart.js';

const MONGODB_URI = 'mongodb+srv://ajayte207_db_user:Ajayte207@cluster0.gohrt1h.mongodb.net/?appName=Cluster0';

async function testMongoDB() {
  console.log('🧪 Starting comprehensive MongoDB tests...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Successfully connected to MongoDB Atlas\n');

    // Test 2: Check all collections exist and have data
    console.log('2️⃣ Testing collection existence and data...');

    const users = await User.find({});
    const products = await Product.find({});
    const orders = await Order.find({});
    const rewards = await Reward.find({});
    const paymentLogs = await PaymentLog.find({});
    const carts = await Cart.find({});

    console.log(`✅ Users collection: ${users.length} documents`);
    console.log(`✅ Products collection: ${products.length} documents`);
    console.log(`✅ Orders collection: ${orders.length} documents`);
    console.log(`✅ Rewards collection: ${rewards.length} documents`);
    console.log(`✅ PaymentLogs collection: ${paymentLogs.length} documents`);
    console.log(`✅ Carts collection: ${carts.length} documents\n`);

    // Test 3: Validate User data
    console.log('3️⃣ Testing User data integrity...');
    for (const user of users) {
      if (!user.walletAddress || !user.walletAddress.startsWith('UQ') && !user.walletAddress.startsWith('EQ')) {
        throw new Error(`Invalid wallet address for user: ${user._id}`);
      }
      if (typeof user.totalPoints !== 'number' || user.totalPoints < 0) {
        throw new Error(`Invalid totalPoints for user: ${user._id}`);
      }
    }
    console.log('✅ All users have valid wallet addresses and points\n');

    // Test 4: Validate Product data
    console.log('4️⃣ Testing Product data integrity...');
    for (const product of products) {
      if (!product.name || !product.price || !product.imageUrl) {
        throw new Error(`Missing required fields for product: ${product._id}`);
      }
      if (product.price <= 0 || product.stock < 0) {
        throw new Error(`Invalid price/stock for product: ${product._id}`);
      }
      if (!['clothing', 'accessories', 'headwear', 'footwear', 'electronics'].includes(product.category)) {
        throw new Error(`Invalid category for product: ${product._id}`);
      }
    }
    console.log('✅ All products have valid data\n');

    // Test 5: Validate Order data and relationships
    console.log('5️⃣ Testing Order data and relationships...');
    for (const order of orders) {
      if (!order.userId || !order.items || order.items.length === 0) {
        throw new Error(`Invalid order structure: ${order._id}`);
      }

      // Check if user exists
      const userExists = await User.findById(order.userId);
      if (!userExists) {
        throw new Error(`Order ${order._id} references non-existent user ${order.userId}`);
      }

      // Check if products exist
      for (const item of order.items) {
        const productExists = await Product.findById(item.productId);
        if (!productExists) {
          throw new Error(`Order ${order._id} references non-existent product ${item.productId}`);
        }
        if (item.price !== productExists.price) {
          throw new Error(`Order ${order._id} has incorrect price for product ${item.productId}`);
        }
      }

      // Validate payment status
      if (!['PENDING', 'PAID', 'FAILED'].includes(order.paymentStatus)) {
        throw new Error(`Invalid payment status for order: ${order._id}`);
      }
    }
    console.log('✅ All orders have valid data and relationships\n');

    // Test 6: Validate Reward data and relationships
    console.log('6️⃣ Testing Reward data and relationships...');
    for (const reward of rewards) {
      if (!reward.userWallet || !reward.actionType || !reward.points) {
        throw new Error(`Missing required fields for reward: ${reward._id}`);
      }

      // Check if user exists
      const userExists = await User.findOne({ walletAddress: reward.userWallet });
      if (!userExists) {
        throw new Error(`Reward ${reward._id} references non-existent user wallet ${reward.userWallet}`);
      }

      // Validate action types
      if (!['PURCHASE', 'FOLLOW_X', 'FOLLOW_INSTAGRAM', 'SHARE_APP'].includes(reward.actionType)) {
        throw new Error(`Invalid action type for reward: ${reward._id}`);
      }

      // Validate platform
      if (!['STORE_PURCHASE', 'X', 'INSTAGRAM', 'APP_SHARE'].includes(reward.platform)) {
        throw new Error(`Invalid platform for reward: ${reward._id}`);
      }
    }
    console.log('✅ All rewards have valid data and relationships\n');

    // Test 7: Validate PaymentLog data and relationships
    console.log('7️⃣ Testing PaymentLog data and relationships...');
    for (const log of paymentLogs) {
      if (!log.orderId || !log.paymentMethod || !log.amount) {
        throw new Error(`Missing required fields for payment log: ${log._id}`);
      }

      // Check if order exists
      const orderExists = await Order.findById(log.orderId);
      if (!orderExists) {
        throw new Error(`Payment log ${log._id} references non-existent order ${log.orderId}`);
      }

      // Validate payment methods
      if (!['NOWPAYMENTS', 'TON_NATIVE'].includes(log.paymentMethod)) {
        throw new Error(`Invalid payment method for log: ${log._id}`);
      }

      // Validate currencies
      if (!['USD', 'TON'].includes(log.currency)) {
        throw new Error(`Invalid currency for log: ${log._id}`);
      }
    }
    console.log('✅ All payment logs have valid data and relationships\n');

    // Test 8: Validate Cart data and relationships
    console.log('8️⃣ Testing Cart data and relationships...');
    for (const cart of carts) {
      if (!cart.userId || !cart.items || cart.items.length === 0) {
        throw new Error(`Invalid cart structure: ${cart._id}`);
      }

      // Check if user exists
      const userExists = await User.findById(cart.userId);
      if (!userExists) {
        throw new Error(`Cart ${cart._id} references non-existent user ${cart.userId}`);
      }

      // Check if products exist
      for (const item of cart.items) {
        const productExists = await Product.findById(item.productId);
        if (!productExists) {
          throw new Error(`Cart ${cart._id} references non-existent product ${item.productId}`);
        }
      }
    }
    console.log('✅ All carts have valid data and relationships\n');

    // Test 9: Test sample queries
    console.log('9️⃣ Testing sample queries...');

    // Find products by category
    const clothingProducts = await Product.find({ category: 'clothing' });
    console.log(`✅ Found ${clothingProducts.length} clothing products`);

    // Find paid orders
    const paidOrders = await Order.find({ paymentStatus: 'PAID' });
    console.log(`✅ Found ${paidOrders.length} paid orders`);

    // Find user rewards
    if (users.length > 0) {
      const userRewards = await Reward.find({ userWallet: users[0].walletAddress });
      console.log(`✅ Found ${userRewards.length} rewards for first user`);
    } else {
      console.log(`✅ No users found, skipping user rewards test`);
    }

    // Find active carts
    const activeCarts = await Cart.find({});
    console.log(`✅ Found ${activeCarts.length} active carts`);

    // Test aggregation: Total revenue from paid orders
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    console.log(`✅ Total revenue from paid orders: $${totalRevenue}`);

    console.log('\n🎉 All MongoDB tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log(`• Database Connection: ✅`);
    console.log(`• Collections Created: ✅`);
    console.log(`• Data Integrity: ✅`);
    console.log(`• Relationships Valid: ✅`);
    console.log(`• Sample Queries: ✅`);
    console.log(`• Total Revenue: $${totalRevenue}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testMongoDB();
