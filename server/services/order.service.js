const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');

class OrderService {
  /**
   * Create a new order from cart
   */
  async createOrderFromCart(walletAddress, paymentMethod) {
    try {
      // Get user's cart
      const cart = await Cart.findOne({ walletAddress: walletAddress.toLowerCase() })
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
        userWallet: walletAddress.toLowerCase(),
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
      const orders = await Order.find({
        userWallet: walletAddress.toLowerCase()
      })
      .populate('items.productId', 'name price image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

      const total = await Order.countDocuments({
        userWallet: walletAddress.toLowerCase()
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

      // If payment is successful, trigger NFT minting
      if (paymentStatus === 'PAID' && order.paymentMethod === 'TON_NATIVE') {
        const nftService = require('./nft.service');
        await nftService.mintNFT(order._id, order.userWallet);
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
      const order = await Order.findOne({
        _id: orderId,
        userWallet: walletAddress.toLowerCase(),
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

module.exports = new OrderService();
