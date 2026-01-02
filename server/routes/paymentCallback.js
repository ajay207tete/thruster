const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const amadeusService = require('../services/amadeusService');

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

      // Check if this is a hotel booking order
      if (order.items && order.items.length > 0 && order.items[0].product === 'hotel-booking') {
        try {
          // Find the booking details from the order
          const bookingData = {
            user: user._id,
            hotelId: order.hotelId,
            offerId: order.offerId,
            hotelName: order.hotelName,
            checkInDate: order.checkInDate,
            checkOutDate: order.checkOutDate,
            adults: order.adults,
            guests: [{
              name: order.shippingDetails.name,
              email: order.shippingDetails.email,
              phone: order.shippingDetails.phone
            }],
            totalPrice: order.totalAmount,
            paymentId: payment_id
          };

          // Book the hotel with Amadeus
          const amadeusBooking = await amadeusService.bookHotel(bookingData.offerId, bookingData.guests);

          // Create booking record
          const booking = new Booking({
            ...bookingData,
            bookingStatus: 'confirmed',
            amadeusBookingId: amadeusBooking.id || amadeusBooking.bookingId
          });

          await booking.save();

          // Add booking to user's bookings
          user.bookings.push(booking._id);

          console.log('Hotel booking confirmed:', booking._id);
        } catch (bookingError) {
          console.error('Error booking hotel:', bookingError);
          // Don't fail the payment callback, but log the error
          // Could implement retry logic or notification here
        }
      }
    } else if (payment_status === 'failed' || payment_status === 'expired') {
      order.paymentStatus = 'failed';
      order.status = 'cancelled';

      // Restore product stock
      const Product = require('../models/Product');
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
