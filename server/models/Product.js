const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files', required: true }, // GridFS file ID
  sizes: [{ type: String }], // Array of available sizes
  colors: [{ type: String }], // Array of available colors
  category: { type: String, default: 'clothing' },
  stock: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
