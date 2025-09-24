
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Grid = require('gridfs-stream');
const upload = require('./upload');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please set these environment variables in your .env file or system environment.');
  console.error('Copy .env.example to .env and fill in the required values.');
  process.exit(1);
}

console.log('Environment variables validated successfully.');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
const { sanitizeInput } = require('./middleware/validation');
app.use(sanitizeInput);

// MongoDB connection
const conn = mongoose.createConnection(process.env.MONGODB_URI, {
  // Removed deprecated options - they are now default in Mongoose 6+
});

let gfs;
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log('GridFS initialized');
});

// Connect mongoose main connection once
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));



// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/payment-callback', require('./routes/paymentCallback'));

// Route to get image by filename
app.get('/api/images/:filename', (req, res) => {
  if (!gfs) {
    return res.status(500).json({ err: 'GridFS not initialized' });
  }
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Cyberpunk App Backend API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export gfs and upload for use in routes
const getGfs = () => gfs;
module.exports = { gfs: getGfs, upload };
