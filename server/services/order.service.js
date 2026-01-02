const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Reward = require('../models/Reward');

class OrderService {
  /**
   * Create a new order from cart
   */
  async createOrderFromCart(walletAddress, paymentMethod) {
    try {
      // Find user by wallet address
      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's cart
      const cart = await Cart.findOne({ userId: user._id })
        .populate('items.productId');

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Calculate total amount
      const totalAmount = cart.items.reduce((total, item) => {
        return total + (item.productId.price * item.quantity);
      }, 0);

      // Create order items
      const orderItems = cart.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity
      }));

      // Create order
      const order = new Order({
        userId: user._id,
        items: orderItems,
        totalAmount,
        paymentMethod,
        paymentStatus: 'PENDING'
      });

      await order.save();

      // Clear cart after order creation
      await Cart.findByIdAndUpdate(cart._id, { items: [] });

      return {
        success: true,
        order: {
          _id: order._id,
          orderId: order._id.toString(),
          items: orderItems,
          totalAmount,
          paymentMethod,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate('items.productId', 'name price image')
        .lean();

      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      return { success: true, order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get orders by wallet address
   */
  async getOrdersByWallet(walletAddress, page = 1, limit = 10) {
    try {
      // Find user by wallet address
      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!user) {
        return {
          success: true,
          orders: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        };
      }

      const orders = await Order.find({
        userId: user._id
      })
      .populate('items.productId', 'name price image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

      const total = await Order.countDocuments({
        userId: user._id
      });

      return {
        success: true,
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId, paymentStatus, paymentData = {}) {
    try {
      const updateData = {
        paymentStatus,
        updatedAt: new Date()
      };

      if (paymentStatus === 'PAID') {
        updateData.paidAt = new Date();
      }

      if (paymentData.paymentId) {
        updateData.paymentId = paymentData.paymentId;
      }

      if (paymentData.invoiceUrl) {
        updateData.invoiceUrl = paymentData.invoiceUrl;
      }

      if (paymentData.txHash) {
        updateData.txHash = paymentData.txHash;
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true, runValidators: true }
      ).populate('items.productId', 'name price image');

      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      // If payment is successful, trigger NFT minting and award purchase points
      if (paymentStatus === 'PAID') {
        const user = await User.findById(order.userId);
        if (user) {
          // Award purchase points (1 TON = 10 points)
          const purchasePoints = Math.floor(order.totalAmount * 10);

          // Create reward record
          const reward = new Reward({
            userWallet: user.walletAddress,
            actionType: 'PURCHASE',
            platform: 'STORE_PURCHASE',
            points: purchasePoints,
            status: 'COMPLETED',
            orderId: order._id
          });

          await reward.save();

          // Update user's total points
          user.totalPoints += purchasePoints;
          await user.save();

          // Trigger NFT minting for TON payments
          if (order.paymentMethod === 'TON_NATIVE') {
            const nftService = require('./nft.service');
            await nftService.mintNFT(order._id, user.walletAddress);
          }
        }
      }

      return { success: true, order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all orders (admin function)
   */
  async getAllOrders(filters = {}, page = 1, limit = 20) {
    try {
      const query = {};

      if (filters.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
      }

      if (filters.paymentMethod) {
        query.paymentMethod = filters.paymentMethod;
      }

      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.createdAt.$lte = new Date(filters.dateTo);
        }
      }

      const orders = await Order.find(query)
        .populate('items.productId', 'name price image')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await Order.countDocuments(query);

      return {
        success: true,
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, walletAddress) {
    try {
      // Find user by wallet address
      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const order = await Order.findOne({
        _id: orderId,
        userId: user._id,
        paymentStatus: 'PENDING'
      });

      if (!order) {
        return { success: false, error: 'Order not found or cannot be cancelled' };
      }

      order.paymentStatus = 'CANCELLED';
      order.cancelledAt = new Date();
      await order.save();

      return { success: true, message: 'Order cancelled successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats() {
    try {
      const stats = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            paidOrders: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, 1, 0] }
            },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'PENDING'] }, 1, 0] }
            },
            failedOrders: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'FAILED'] }, 1, 0] }
            }
          }
        }
      ]);

      const paymentMethodStats = await Order.aggregate([
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]);

      const result = stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        paidOrders: 0,
        pendingOrders: 0,
        failedOrders: 0
      };

      return {
        success: true,
        stats: {
          ...result,
          paymentMethodBreakdown: paymentMethodStats
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Process refund
   */
  async processRefund(orderId, reason) {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      if (order.paymentStatus !== 'PAID') {
        return { success: false, error: 'Only paid orders can be refunded' };
      }

      order.paymentStatus = 'REFUNDED';
      order.refundReason = reason;
      order.refundedAt = new Date();

      await order.save();

      return { success: true, message: 'Refund processed successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new OrderService();
