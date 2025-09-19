const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files', required: true }, // GridFS file ID
  amenities: [{ type: String }], // Array of amenities
  rating: { type: Number, min: 0, max: 5 },
  category: { type: String, default: 'hotel' },
  available: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Hotel', HotelSchema);
