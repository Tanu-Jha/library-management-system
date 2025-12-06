import express from 'express';
import { Transaction, Fine, Member, Book, Movie } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const FINE_PER_DAY = 1.00;

// Helper to get item details
async function getItemDetails(itemType, itemId) {
  if (itemType === 'book') {
    return await Book.findById(itemId);
  } else {
    return await Movie.findById(itemId);
  }
}

// Helper to format transaction with details
async function formatTransaction(t) {
  const member = await Member.findById(t.member_id);
  const item = await getItemDetails(t.item_type, t.item_id);
  
  return {
    ...t.toObject(),
    id: t._id,
    member_name: member ? `${member.first_name} ${member.last_name}` : 'Unknown',
    membership_number: member?.membership_number || 'Unknown',
    item_name: item?.name || 'Unknown',
    item_author: t.item_type === 'book' ? item?.author : item?.director,
    item_serial: item?.serial_number || 'Unknown'
  };
}

// Get all transactions with optional filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, memberId, itemType } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (memberId) filter.member_id = memberId;
    if (itemType) filter.item_type = itemType;

    const transactions = await Transaction.find(filter).sort({ created_at: -1 });
    const formatted = await Promise.all(transactions.map(formatTransaction));
    res.json(formatted);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get active issues
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      status: { $in: ['issued', 'overdue'] }
    }).sort({ issue_date: -1 });

    const formatted = await Promise.all(transactions.map(formatTransaction));
    res.json(formatted);
  } catch (error) {
    console.error('Get active issues error:', error);
    res.status(500).json({ error: 'Failed to fetch active issues' });
  }
});

// Get overdue returns
router.get('/overdue', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Update status to overdue
    await Transaction.updateMany(
      { status: 'issued', expected_return_date: { $lt: today } },
      { status: 'overdue' }
    );

    const transactions = await Transaction.find({
      status: 'overdue'
    }).sort({ expected_return_date: 1 });

    const formatted = await Promise.all(transactions.map(async (t) => {
      const base = await formatTransaction(t);
      const daysOverdue = Math.ceil((today - new Date(t.expected_return_date)) / (1000 * 60 * 60 * 24));
      return { ...base, days_overdue: daysOverdue };
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get overdue returns error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue returns' });
  }
});

// Get single transaction
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const formatted = await formatTransaction(transaction);
    res.json(formatted);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Issue book/movie
router.post('/issue', authenticateToken, async (req, res) => {
  try {
    const { memberId, itemType, itemId, issueDate, returnDate, remarks } = req.body;

    if (!memberId || !itemType || !itemId || !issueDate || !returnDate) {
      return res.status(400).json({ error: 'Member ID, item type, item ID, issue date, and return date are required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const issueDateObj = new Date(issueDate);
    
    if (issueDateObj < today) {
      return res.status(400).json({ error: 'Issue date cannot be in the past' });
    }

    const maxReturnDate = new Date(issueDateObj);
    maxReturnDate.setDate(maxReturnDate.getDate() + 15);
    if (new Date(returnDate) > maxReturnDate) {
      return res.status(400).json({ error: 'Return date cannot be more than 15 days from issue date' });
    }

    const member = await Member.findOne({ _id: memberId, is_active: 1 });
    if (!member) {
      return res.status(400).json({ error: 'Invalid or inactive member' });
    }

    let item;
    if (itemType === 'book') {
      item = await Book.findOne({ _id: itemId, status: 'Available' });
    } else if (itemType === 'movie') {
      item = await Movie.findOne({ _id: itemId, status: 'Available' });
    }

    if (!item) {
      return res.status(400).json({ error: 'Item not found or not available' });
    }

    const transaction = await Transaction.create({
      member_id: memberId,
      item_type: itemType,
      item_id: itemId,
      issue_date: issueDate,
      expected_return_date: returnDate,
      status: 'issued',
      remarks: remarks || ''
    });

    item.status = 'Issued';
    await item.save();

    res.status(201).json({ message: 'Item issued successfully', transaction });
  } catch (error) {
    console.error('Issue item error:', error);
    res.status(500).json({ error: 'Failed to issue item' });
  }
});

// Return book/movie
router.post('/return', authenticateToken, async (req, res) => {
  try {
    const { transactionId, actualReturnDate, remarks } = req.body;

    if (!transactionId || !actualReturnDate) {
      return res.status(400).json({ error: 'Transaction ID and actual return date are required' });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      status: { $in: ['issued', 'overdue'] }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or already returned' });
    }

    let fineAmount = 0;
    const expectedReturn = new Date(transaction.expected_return_date);
    const actualReturn = new Date(actualReturnDate);
    
    if (actualReturn > expectedReturn) {
      const daysOverdue = Math.ceil((actualReturn - expectedReturn) / (1000 * 60 * 60 * 24));
      fineAmount = daysOverdue * FINE_PER_DAY;
    }

    let fine = await Fine.findOne({ transaction_id: transactionId });
    if (fine) {
      fine.fine_amount = fineAmount;
      fine.remarks = remarks || '';
      await fine.save();
    } else {
      fine = await Fine.create({
        transaction_id: transactionId,
        fine_amount: fineAmount,
        is_paid: 0,
        remarks: remarks || ''
      });
    }

    res.json({
      message: 'Book return initiated',
      transaction: { ...transaction.toObject(), actual_return_date: actualReturnDate },
      fine
    });
  } catch (error) {
    console.error('Return item error:', error);
    res.status(500).json({ error: 'Failed to return item' });
  }
});

// Pay fine and complete return
router.post('/pay-fine', authenticateToken, async (req, res) => {
  try {
    const { transactionId, finePaid, remarks } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      status: { $in: ['issued', 'overdue'] }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or already returned' });
    }

    const fine = await Fine.findOne({ transaction_id: transactionId });

    if (fine && fine.fine_amount > 0 && !finePaid) {
      return res.status(400).json({ error: 'Fine must be paid before completing the return' });
    }

    if (fine) {
      fine.is_paid = 1;
      fine.paid_date = new Date();
      if (remarks) fine.remarks = remarks;
      await fine.save();
    }

    transaction.status = 'returned';
    transaction.actual_return_date = new Date();
    if (remarks) transaction.remarks = remarks;
    await transaction.save();

    if (transaction.item_type === 'book') {
      await Book.findByIdAndUpdate(transaction.item_id, { status: 'Available' });
    } else {
      await Movie.findByIdAndUpdate(transaction.item_id, { status: 'Available' });
    }

    res.json({ message: 'Return completed successfully' });
  } catch (error) {
    console.error('Pay fine error:', error);
    res.status(500).json({ error: 'Failed to complete return' });
  }
});

// Calculate fine for a transaction
router.get('/fine/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { returnDate } = req.query;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    let fineAmount = 0;
    const expectedReturn = new Date(transaction.expected_return_date);
    const actualReturn = returnDate ? new Date(returnDate) : new Date();

    if (actualReturn > expectedReturn) {
      const daysOverdue = Math.ceil((actualReturn - expectedReturn) / (1000 * 60 * 60 * 24));
      fineAmount = daysOverdue * FINE_PER_DAY;
    }

    res.json({ fineAmount, daysOverdue: fineAmount / FINE_PER_DAY });
  } catch (error) {
    console.error('Calculate fine error:', error);
    res.status(500).json({ error: 'Failed to calculate fine' });
  }
});

export default router;