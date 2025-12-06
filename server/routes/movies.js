import express from 'express';
import { Movie, Transaction } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all movies with optional filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { name, director, category, status } = req.query;
    
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (director) filter.director = { $regex: director, $options: 'i' };
    if (category) filter.category = category;
    if (status) filter.status = status;

    const movies = await Movie.find(filter).sort({ name: 1 });
    res.json(movies);
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Get single movie by ID or serial number
router.get('/:identifier', authenticateToken, async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let movie;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(identifier);
    } else {
      movie = await Movie.findOne({ serial_number: identifier });
    }

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// Get available movies
router.get('/status/available', authenticateToken, async (req, res) => {
  try {
    const movies = await Movie.find({ status: 'Available' }).sort({ name: 1 });
    res.json(movies);
  } catch (error) {
    console.error('Get available movies error:', error);
    res.status(500).json({ error: 'Failed to fetch available movies' });
  }
});

// Add new movie (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, director, category, cost, procurementDate, quantity } = req.body;

    if (!name || !director || !category) {
      return res.status(400).json({ error: 'Name, director, and category are required' });
    }

    const categoryPrefix = {
      'Science': 'SC',
      'Economics': 'EC',
      'Fiction': 'FC',
      'Children': 'CH',
      'Personal Development': 'PD'
    };

    const prefix = categoryPrefix[category] || 'OT';
    const count = await Movie.countDocuments({ category });
    const serial_number = `${prefix}-M-${String(count + 1).padStart(3, '0')}`;

    const movie = await Movie.create({
      serial_number,
      name,
      director,
      category,
      status: 'Available',
      cost: cost || 0,
      procurement_date: procurementDate || new Date(),
      quantity: quantity || 1
    });

    res.status(201).json(movie);
  } catch (error) {
    console.error('Add movie error:', error);
    res.status(500).json({ error: 'Failed to add movie' });
  }
});

// Update movie (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, director, category, status, cost, procurementDate } = req.body;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    if (name) movie.name = name;
    if (director) movie.director = director;
    if (category) movie.category = category;
    if (status) movie.status = status;
    if (cost !== undefined) movie.cost = cost;
    if (procurementDate) movie.procurement_date = procurementDate;

    await movie.save();
    res.json(movie);
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// Delete movie (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const activeTransaction = await Transaction.findOne({
      item_type: 'movie',
      item_id: id,
      status: { $in: ['issued', 'overdue'] }
    });

    if (activeTransaction) {
      return res.status(400).json({ error: 'Cannot delete movie with active transactions' });
    }

    await Movie.findByIdAndDelete(id);
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

export default router;