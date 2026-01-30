import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// IPN callback for NowPayments
router.post('/', async (req, res) => {
  try {
    const {
      payment_id,
      payment_status,
      pay_address,
      payin_extra_id,
      price_amount,
      price_currency,
      pay_amount,
      actually_paid,
      pay_currency,
      order_id,
      order_description,
      purchase_id,
      created_at,
      updated_at,
      outcome_amount,
      outcome_currency
    } = req.body;

    console.log('Payment callback received:', req.body);

    // Find the user with the order
    const user = await User.findOne({ 'orders.paymentId': payment_id });

    if (!user) {
      console.error('User not found for payment_id:', payment_id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the order
    const order = user.orders.find(o => o.paymentId === payment_id);

    if (!order) {
      console.error('Order not found for payment_id:', payment_id);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status based on payment status
    if (payment_status === 'finished') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';

      // Hotel booking functionality removed - amadeusService not available
    } else if (payment_status === 'failed' || payment_status === 'expired') {
      order.paymentStatus = 'failed';
      order.status = 'cancelled';

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    } else if (payment_status === 'partially_paid') {
      order.paymentStatus = 'partially_paid';
    } else {
      order.paymentStatus = payment_status;
    }

    await user.save();

    console.log('Order updated:', order._id, order.status, order.paymentStatus);

    res.status(200).json({ message: 'Payment status updated' });
  } catch (error) {
    console.error('Error processing payment callback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
