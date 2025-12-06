import express from 'express';
import { IssueRequest, Member, Book, Movie } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to format request with details
async function formatRequest(r) {
  const member = await Member.findById(r.member_id);
  let item;
  if (r.item_type === 'book') {
    item = await Book.findById(r.item_id);
  } else {
    item = await Movie.findById(r.item_id);
  }
  
  return {
    ...r.toObject(),
    id: r._id,
    member_name: member ? `${member.first_name} ${member.last_name}` : 'Unknown',
    membership_number: member?.membership_number || 'Unknown',
    item_name: item?.name || 'Unknown',
    item_author: r.item_type === 'book' ? item?.author : item?.director,
    item_serial: item?.serial_number || 'Unknown'
  };
}

// Get all issue requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const requests = await IssueRequest.find(filter).sort({ created_at: -1 });
    const formatted = await Promise.all(requests.map(formatRequest));
    res.json(formatted);
  } catch (error) {
    console.error('Get issue requests error:', error);
    res.status(500).json({ error: 'Failed to fetch issue requests' });
  }
});

// Get pending requests
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const requests = await IssueRequest.find({ status: 'pending' }).sort({ created_at: 1 });
    const formatted = await Promise.all(requests.map(formatRequest));
    res.json(formatted);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// Create issue request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { memberId, itemType, itemId } = req.body;

    if (!memberId || !itemType || !itemId) {
      return res.status(400).json({ error: 'Member ID, item type, and item ID are required' });
    }

    const member = await Member.findOne({ _id: memberId, is_active: 1 });
    if (!member) {
      return res.status(400).json({ error: 'Invalid or inactive member' });
    }

    let item;
    if (itemType === 'book') {
      item = await Book.findById(itemId);
    } else if (itemType === 'movie') {
      item = await Movie.findById(itemId);
    }

    if (!item) {
      return res.status(400).json({ error: 'Item not found' });
    }

    const existingRequest = await IssueRequest.findOne({
      member_id: memberId,
      item_type: itemType,
      item_id: itemId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'A pending request already exists for this item' });
    }

    const request = await IssueRequest.create({
      member_id: memberId,
      item_type: itemType,
      item_id: itemId,
      status: 'pending'
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Create issue request error:', error);
    res.status(500).json({ error: 'Failed to create issue request' });
  }
});

// Approve/Reject issue request (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const request = await IssueRequest.findOne({ _id: id, status: 'pending' });
    if (!request) {
      return res.status(404).json({ error: 'Pending request not found' });
    }

    request.status = status;
    await request.save();

    res.json({ message: `Request ${status} successfully` });
  } catch (error) {
    console.error('Update issue request error:', error);
    res.status(500).json({ error: 'Failed to update issue request' });
  }
});

export default router;