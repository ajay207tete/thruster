import express from 'express';
import Activity from '../models/Activity.js';

const router = express.Router();

// GET /api/activities - Get all activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/activities - Create activity
router.post('/', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    const savedActivity = await activity.save();
    res.status(201).json(savedActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
