import express from 'express';
import upload from '../../middleware/upload.js';
import File from '../../models/File.js';

const router = express.Router();

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { url, public_id, bytes: size, resource_type: type } = req.file;
    const userId = req.body.userId; // Assuming userId is sent in the request body

    const file = new File({
      url,
      public_id,
      type,
      size,
      userId,
    });

    await file.save();

    res.json({
      success: true,
      url,
      public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
