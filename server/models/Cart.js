const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  size: String,
  color: String,
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  sessionId: {
    type: String,
    // For guest users, we'll use a session ID
    sparse: true
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
cartSchema.index({ userId: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ lastUpdated: 1 });

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total price
cartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity = 1, price, size, color) {
  const existingItem = this.items.find(item =>
    item.product.toString() === productId.toString() &&
    item.size === size &&
    item.color === color
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      price,
      size,
      color
    });
  }

  this.lastUpdated = new Date();
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    if (quantity <= 0) {
      this.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }
    this.lastUpdated = new Date();
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items.pull(itemId);
  this.lastUpdated = new Date();
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to find or create cart
cartSchema.statics.findOrCreateCart = async function(userId, sessionId = null, isGuest = false) {
  let cart;

  if (!isGuest && userId) {
    // For logged-in users
    cart = await this.findOne({ userId });
  } else if (isGuest && sessionId) {
    // For guest users
    cart = await this.findOne({ sessionId });
  }

  if (!cart) {
    cart = new this({
      userId: !isGuest ? userId : null,
      sessionId: isGuest ? sessionId : null,
      isGuest,
      items: []
    });
  }

  return cart;
};

export default mongoose.model('Cart', cartSchema);
