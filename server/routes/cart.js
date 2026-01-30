import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware to get cart (either user cart or guest cart)
const getCart = async (req, res, next) => {
  try {
    const walletAddress = req.headers['x-wallet-address'];

    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address required' });
    }

    // Find user by wallet address
    const User = (await import('../models/User.js')).default;
    const user = await User.findOne({ walletAddress });

    let cart;
    if (user) {
      // Logged-in user
      cart = await Cart.findOrCreateCart(user._id, null, false);
    } else {
      // Guest user - create a temporary user for cart association
      const tempUser = new User({
        walletAddress,
        totalPoints: 0
      });
      await tempUser.save();
      cart = await Cart.findOrCreateCart(tempUser._id, null, true);
    }

    req.cart = cart;
    req.user = user;
    next();
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get cart items
router.get('/', getCart, async (req, res) => {
  try {
    const cart = req.cart;
    await cart.populate('items.product');

    res.json({
      cart: {
        _id: cart._id,
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        lastUpdated: cart.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add item to cart
router.post('/add', getCart, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stock}`
      });
    }

    // Add item to cart
    await req.cart.addItem(productId, quantity, product.price, size, color);
    await req.cart.populate('items.product');

    res.json({
      message: 'Item added to cart successfully',
      cart: {
        _id: req.cart._id,
        items: req.cart.items,
        totalItems: req.cart.totalItems,
        totalPrice: req.cart.totalPrice,
        lastUpdated: req.cart.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item quantity
router.put('/update/:itemId', getCart, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }

    await req.cart.updateItemQuantity(itemId, quantity);
    await req.cart.populate('items.product');

    res.json({
      message: 'Cart item updated successfully',
      cart: {
        _id: req.cart._id,
        items: req.cart.items,
        totalItems: req.cart.totalItems,
        totalPrice: req.cart.totalPrice,
        lastUpdated: req.cart.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', getCart, async (req, res) => {
  try {
    const { itemId } = req.params;

    await req.cart.removeItem(itemId);
    await req.cart.populate('items.product');

    res.json({
      message: 'Item removed from cart successfully',
      cart: {
        _id: req.cart._id,
        items: req.cart.items,
        totalItems: req.cart.totalItems,
        totalPrice: req.cart.totalPrice,
        lastUpdated: req.cart.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear cart
router.delete('/clear', getCart, async (req, res) => {
  try {
    await req.cart.clearCart();

    res.json({
      message: 'Cart cleared successfully',
      cart: {
        _id: req.cart._id,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: req.cart.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Merge guest cart with user cart (when user logs in)
router.post('/merge', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID required for cart merge' });
    }

    // Find guest cart
    const guestCart = await Cart.findOne({ sessionId, isGuest: true });
    if (!guestCart || guestCart.items.length === 0) {
      return res.status(404).json({ message: 'No guest cart found to merge' });
    }

    // Find or create user cart
    let userCart = await Cart.findOne({ userId, isGuest: false });
    if (!userCart) {
      userCart = new Cart({ userId, isGuest: false, items: [] });
    }

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(item =>
        item.product.toString() === guestItem.product.toString() &&
        item.size === guestItem.size &&
        item.color === guestItem.color
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        userCart.items.push(guestItem);
      }
    }

    await userCart.save();
    await guestCart.remove(); // Remove guest cart after merge

    await userCart.populate('items.product');

    res.json({
      message: 'Carts merged successfully',
      cart: {
        _id: userCart._id,
        items: userCart.items,
        totalItems: userCart.totalItems,
        totalPrice: userCart.totalPrice,
        lastUpdated: userCart.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error merging carts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
