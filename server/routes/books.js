import express from 'express';
import { Book, Transaction } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all books with optional filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { name, author, category, status } = req.query;
    
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (category) filter.category = category;
    if (status) filter.status = status;

    const books = await Book.find(filter).sort({ name: 1 });
    res.json(books);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get single book by ID or serial number
router.get('/:identifier', authenticateToken, async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let book;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      book = await Book.findById(identifier);
    } else {
      book = await Book.findOne({ serial_number: identifier });
    }

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Get available books
router.get('/status/available', authenticateToken, async (req, res) => {
  try {
    const books = await Book.find({ status: 'Available' }).sort({ name: 1 });
    res.json(books);
  } catch (error) {
    console.error('Get available books error:', error);
    res.status(500).json({ error: 'Failed to fetch available books' });
  }
});

// Search books by name or author (for dropdowns)
router.get('/search/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { q } = req.query;

    if (type === 'names') {
      const books = await Book.distinct('name', { name: { $regex: q || '', $options: 'i' } });
      res.json(books.sort());
    } else if (type === 'authors') {
      const books = await Book.distinct('author', { author: { $regex: q || '', $options: 'i' } });
      res.json(books.sort());
    } else {
      res.status(400).json({ error: 'Invalid search type' });
    }
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({ error: 'Failed to search books' });
  }
});

// Add new book (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, author, category, cost, procurementDate, quantity } = req.body;

    if (!name || !author || !category) {
      return res.status(400).json({ error: 'Name, author, and category are required' });
    }

    const categoryPrefix = {
      'Science': 'SC',
      'Economics': 'EC',
      'Fiction': 'FC',
      'Children': 'CH',
      'Personal Development': 'PD'
    };

    const prefix = categoryPrefix[category] || 'OT';
    const count = await Book.countDocuments({ category });
    const serial_number = `${prefix}-B-${String(count + 1).padStart(3, '0')}`;

    const book = await Book.create({
      serial_number,
      name,
      author,
      category,
      status: 'Available',
      cost: cost || 0,
      procurement_date: procurementDate || new Date(),
      quantity: quantity || 1
    });

    res.status(201).json(book);
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Update book (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, author, category, status, cost, procurementDate } = req.body;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (name) book.name = name;
    if (author) book.author = author;
    if (category) book.category = category;
    if (status) book.status = status;
    if (cost !== undefined) book.cost = cost;
    if (procurementDate) book.procurement_date = procurementDate;

    await book.save();
    res.json(book);
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Delete book (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const activeTransaction = await Transaction.findOne({
      item_type: 'book',
      item_id: id,
      status: { $in: ['issued', 'overdue'] }
    });

    if (activeTransaction) {
      return res.status(400).json({ error: 'Cannot delete book with active transactions' });
    }

    await Book.findByIdAndDelete(id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

export default router;