const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hotelId: { type: String, required: true },
  offerId: { type: String, required: true },
  hotelName: { type: String, required: true },
  checkInDate: { type: String, required: true },
  checkOutDate: { type: String, required: true },
  adults: { type: Number, required: true },
  guests: [{
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }
  }],
  totalPrice: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentId: { type: String, required: true },
  bookingStatus: { type: String, default: 'pending' }, // pending, confirmed, cancelled
  amadeusBookingId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
