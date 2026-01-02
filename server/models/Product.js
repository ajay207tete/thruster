import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true }, // Sanity image URL
  sizes: [{ type: String }], // Array of available sizes
  colors: [{ type: String }], // Array of available colors
  category: { type: String, default: 'clothing' },
  stock: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);
