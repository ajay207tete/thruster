const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberpunk-app',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `product_${Date.now()}_${file.originalname}`;
      const fileInfo = {
        filename: filename,
        bucketName: 'uploads'
      };
      resolve(fileInfo);
    });
  }
});

const upload = multer({ storage });

module.exports = upload;
