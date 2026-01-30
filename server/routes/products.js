import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    console.log('Fetching products from MongoDB...');
    const products = await Product.find();
    console.log('Products from MongoDB:', products.length);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET a specific product
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching product by ID:', req.params.id);
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log('Product not found in MongoDB');
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: err.message });
  }
});

// CREATE a new product
router.post('/', async (req, res) => {
  try {
    console.log('Creating new product:', req.body);

    // Validate required fields
    const { name, description, price, imageUrl, sizes, colors, category, stock } = req.body;
    if (!name || !description || !price || !imageUrl) {
      return res.status(400).json({ message: 'Missing required fields: name, description, price, imageUrl' });
    }

    const product = new Product({
      name,
      description,
      price,
      imageUrl, // Sanity image URL
      sizes: sizes || [],
      colors: colors || [],
      category: category || 'clothing',
      stock: stock || 0,
    });

    const newProduct = await product.save();
    console.log('Product created:', newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a product
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating product:', req.params.id, req.body);
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, imageUrl, sizes, colors, category, stock } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (imageUrl) product.imageUrl = imageUrl; // Update image URL if provided
    if (sizes) product.sizes = sizes;
    if (colors) product.colors = colors;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;

    const updatedProduct = await product.save();
    console.log('Product updated:', updatedProduct);
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting product:', req.params.id);
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });
    console.log('Product deleted');
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
