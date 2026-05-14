import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import attendancePredictionService from '../services/attendancePrediction.js';

export const createEvent = async (req, res) => {
  try {
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    // Get organizer data for prediction
    const organizer = await User.findById(req.user.id).select('points name');
    
    // Predict attendance for the new event
    const prediction = await attendancePredictionService.predictAttendance(
      req.body,
      organizer
    );
    
    // Create event with prediction data
    const eventData = {
      ...req.body,
      organizer: req.user.id,
      posterUrl,
      predictedAttendance: prediction.predictedAttendance,
      predictionConfidence: prediction.confidence,
      predictionMethodology: prediction.methodology,
      lastPredictedAt: new Date()
    };
    
    const event = await Event.create(eventData);
    res.status(201).json({ event, prediction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const update = { ...req.body };
    if (posterUrl) update.posterUrl = posterUrl;
    const event = await Event.findOneAndUpdate({ _id: req.params.id, organizer: req.user.id }, update, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organizer: req.user.id });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listEvents = async (req, res) => {
  try {
    const { q, category, status, organizer } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (organizer) filter.organizer = organizer;
    const events = await Event.find(filter).populate('organizer', 'name').sort({ date: 1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name');
    if (!event) return res.status(404).json({ message: 'Not found' });
    const count = await Registration.countDocuments({ event: event._id, status: { $ne: 'cancelled' } });
    res.json({ event, registrations: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const predictAttendance = async (req, res) => {
  try {
    const { title, description, category, date, location, capacity } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !date) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, category, date' 
      });
    }

    // Get organizer data
    const organizer = await User.findById(req.user.id).select('points name');
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Predict attendance
    const prediction = await attendancePredictionService.predictAttendance(
      {
        title,
        description,
        category,
        date: new Date(date),
        location,
        capacity: capacity || 100
      },
      organizer
    );

    res.json({
      prediction,
      eventData: {
        title,
        category,
        date,
        capacity: capacity || 100,
        organizer: organizer.name
      }
    });

  } catch (err) {
    console.error('Attendance prediction error:', err);
    res.status(500).json({ message: 'Failed to predict attendance' });
  }
};

export const getModelStats = async (req, res) => {
  try {
    const stats = await attendancePredictionService.getModelStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


