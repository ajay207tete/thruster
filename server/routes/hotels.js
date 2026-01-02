const express = require('express');
const router = express.Router();
const amadeusService = require('../services/amadeusService');
const Hotel = require('../models/Hotel');
const upload = require('../upload');
const { gfs } = require('../server');

// Helper function to get filename from GridFS file ID
const getFilenameFromId = (fileId) => {
  return new Promise((resolve, reject) => {
    const gfsInstance = gfs();
    if (!gfsInstance) {
      return reject(new Error('GridFS not initialized'));
    }
    gfsInstance.files.findOne({ _id: fileId }, (err, file) => {
      if (err) return reject(err);
      if (!file) return resolve(null);
      resolve(file.filename);
    });
  });
};

// GET all hotels
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find();
    const hotelsWithImages = await Promise.all(hotels.map(async (hotel) => {
      const filename = await getFilenameFromId(hotel.image);
      return { ...hotel.toObject(), image: filename };
    }));
    res.json(hotelsWithImages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a specific hotel
router.get('/local/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    const filename = await getFilenameFromId(hotel.image);
    res.json({ ...hotel.toObject(), image: filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a new hotel
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  const hotel = new Hotel({
    name: req.body.name,
    description: req.body.description,
    location: req.body.location,
    price: req.body.price,
    image: req.file.id, // GridFS file ID
    amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
    rating: req.body.rating,
    category: req.body.category,
    available: req.body.available,
  });

  try {
    const newHotel = await hotel.save();
    res.status(201).json(newHotel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a hotel
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    if (req.body.name) hotel.name = req.body.name;
    if (req.body.description) hotel.description = req.body.description;
    if (req.body.location) hotel.location = req.body.location;
    if (req.body.price) hotel.price = req.body.price;
    if (req.file) hotel.image = req.file.id; // Update image if provided
    if (req.body.amenities) hotel.amenities = JSON.parse(req.body.amenities);
    if (req.body.rating) hotel.rating = req.body.rating;
    if (req.body.category) hotel.category = req.body.category;
    if (req.body.available !== undefined) hotel.available = req.body.available;

    const updatedHotel = await hotel.save();
    res.json(updatedHotel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a hotel
router.delete('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    await hotel.remove();
    res.json({ message: 'Hotel deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search hotels
router.get('/search', async (req, res) => {
  const { cityCode, checkInDate, checkOutDate, adults } = req.query;
  try {
    const hotels = await amadeusService.searchHotels(cityCode, checkInDate, checkOutDate, adults);
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: 'Error searching hotels', error: error.message });
  }
});

// Get hotel details
router.get('/:hotelId', async (req, res) => {
  const { hotelId } = req.params;
  const { checkInDate, checkOutDate, adults } = req.query;
  try {
    const hotelDetails = await amadeusService.getHotelDetails(hotelId, checkInDate, checkOutDate, adults);
    res.json(hotelDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error getting hotel details', error: error.message });
  }
});

// Book hotel
router.post('/book', async (req, res) => {
  const { offerId, guests } = req.body;
  try {
    const booking = await amadeusService.bookHotel(offerId, guests);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error booking hotel', error: error.message });
  }
});

export default router;
