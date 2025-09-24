const validator = require('validator');

/**
 * Validation middleware for API endpoints
 */

// Validate product data
const validateProduct = (req, res, next) => {
  const { name, price, description, category, stock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!price || isNaN(price) || price <= 0) {
    errors.push('Price is required and must be a positive number');
  }

  if (description && typeof description !== 'string') {
    errors.push('Description must be a string');
  }

  if (category && typeof category !== 'string') {
    errors.push('Category must be a string');
  }

  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    errors.push('Stock must be a non-negative number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

// Validate user data
const validateUser = (req, res, next) => {
  const { name, email, phone, address } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  if (phone && !validator.isMobilePhone(phone, 'any')) {
    errors.push('Valid phone number is required');
  }

  if (address && typeof address !== 'object') {
    errors.push('Address must be an object');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

// Validate order data
const validateOrder = (req, res, next) => {
  const { userId, products, totalAmount, shippingAddress } = req.body;
  const errors = [];

  if (!userId || typeof userId !== 'string') {
    errors.push('User ID is required');
  }

  if (!products || !Array.isArray(products) || products.length === 0) {
    errors.push('Products array is required and must not be empty');
  }

  if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
    errors.push('Total amount is required and must be positive');
  }

  if (!shippingAddress || typeof shippingAddress !== 'object') {
    errors.push('Shipping address is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

// Validate hotel search
const validateHotelSearch = (req, res, next) => {
  const { cityCode, checkInDate, checkOutDate, adults } = req.query;
  const errors = [];

  if (!cityCode || typeof cityCode !== 'string') {
    errors.push('City code is required');
  }

  if (!checkInDate || !validator.isISO8601(checkInDate)) {
    errors.push('Valid check-in date is required (ISO 8601 format)');
  }

  if (!checkOutDate || !validator.isISO8601(checkOutDate)) {
    errors.push('Valid check-out date is required (ISO 8601 format)');
  }

  if (checkInDate && checkOutDate && new Date(checkInDate) >= new Date(checkOutDate)) {
    errors.push('Check-out date must be after check-in date');
  }

  if (adults && (isNaN(adults) || adults < 1)) {
    errors.push('Adults must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        req.body[key] = validator.escape(value.trim());
      }
    }
  }

  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        req.query[key] = validator.escape(value.trim());
      }
    }
  }

  next();
};

module.exports = {
  validateProduct,
  validateUser,
  validateOrder,
  validateHotelSearch,
  sanitizeInput
};
