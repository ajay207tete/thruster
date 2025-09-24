const express = require('express');
const Product = require('../models/Product');
const upload = require('../upload');
const { gfs } = require('../server');
const { validateProduct } = require('../middleware/validation');

const router = express.Router();

// Helper function to get filename from GridFS file ID
const getFilenameFromId = (fileId) => {
  return new Promise((resolve, reject) => {
    if (!gfs) {
      return reject(new Error('GridFS not initialized'));
    }
    gfs.files.findOne({ _id: fileId }, (err, file) => {
      if (err) return reject(err);
      if (!file) return resolve(null);
      resolve(file.filename);
    });
  });
};

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    const productsWithImages = await Promise.all(products.map(async (product) => {
      const filename = await getFilenameFromId(product.image);
      return { ...product.toObject(), image: filename };
    }));
    res.json(productsWithImages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a specific product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const filename = await getFilenameFromId(product.image);
    res.json({ ...product.toObject(), image: filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a new product
router.post('/', upload.single('image'), validateProduct, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    image: req.file.id, // GridFS file ID
    sizes: req.body.sizes,
    colors: req.body.colors,
    category: req.body.category,
    stock: req.body.stock,
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a product
router.put('/:id', upload.single('image'), validateProduct, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.body.name) product.name = req.body.name;
    if (req.body.description) product.description = req.body.description;
    if (req.body.price) product.price = req.body.price;
    if (req.file) product.image = req.file.id; // Update image if provided
    if (req.body.sizes) product.sizes = req.body.sizes;
    if (req.body.colors) product.colors = req.body.colors;
    if (req.body.category) product.category = req.body.category;
    if (req.body.stock) product.stock = req.body.stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
