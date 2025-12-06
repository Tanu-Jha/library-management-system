import express from 'express';
import { Member, Transaction } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all members
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { active } = req.query;
    
    const filter = {};
    if (active !== undefined) {
      filter.is_active = active === 'true' ? 1 : 0;
    }

    const members = await Member.find(filter).sort({ first_name: 1, last_name: 1 });
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get single member by ID or membership number
router.get('/:identifier', authenticateToken, async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let member;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      member = await Member.findById(identifier);
    } else {
      member = await Member.findOne({ membership_number: identifier });
    }

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Add new member (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { firstName, lastName, contactName, contactAddress, aadharNumber, startDate, membershipType } = req.body;

    if (!firstName || !lastName || !startDate || !membershipType) {
      return res.status(400).json({ error: 'First name, last name, start date, and membership type are required' });
    }

    const start = new Date(startDate);
    let end = new Date(start);
    
    switch (membershipType) {
      case '6_months':
        end.setMonth(end.getMonth() + 6);
        break;
      case '1_year':
        end.setFullYear(end.getFullYear() + 1);
        break;
      case '2_years':
        end.setFullYear(end.getFullYear() + 2);
        break;
      default:
        end.setMonth(end.getMonth() + 6);
    }

    const count = await Member.countDocuments();
    const membership_number = `MEM-${String(count + 1).padStart(3, '0')}`;

    const member = await Member.create({
      membership_number,
      first_name: firstName,
      last_name: lastName,
      contact_name: contactName || `${firstName} ${lastName}`,
      contact_address: contactAddress || '',
      aadhar_number: aadharNumber || '',
      start_date: start,
      end_date: end,
      membership_type: membershipType,
      is_active: 1
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Update member (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, contactName, contactAddress, aadharNumber, membershipType, extendMembership, cancelMembership } = req.body;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (firstName) member.first_name = firstName;
    if (lastName) member.last_name = lastName;
    if (contactName) member.contact_name = contactName;
    if (contactAddress) member.contact_address = contactAddress;
    if (aadharNumber) member.aadhar_number = aadharNumber;
    if (membershipType) member.membership_type = membershipType;

    if (cancelMembership) {
      member.is_active = 0;
    }

    if (extendMembership && membershipType) {
      const currentEnd = new Date(member.end_date);
      
      switch (membershipType) {
        case '6_months':
          currentEnd.setMonth(currentEnd.getMonth() + 6);
          break;
        case '1_year':
          currentEnd.setFullYear(currentEnd.getFullYear() + 1);
          break;
        case '2_years':
          currentEnd.setFullYear(currentEnd.getFullYear() + 2);
          break;
      }
      
      member.end_date = currentEnd;
    }

    await member.save();
    res.json(member);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member (admin only) - soft delete
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const activeTransaction = await Transaction.findOne({
      member_id: id,
      status: { $in: ['issued', 'overdue'] }
    });

    if (activeTransaction) {
      return res.status(400).json({ error: 'Cannot delete member with active transactions' });
    }

    member.is_active = 0;
    await member.save();
    res.json({ message: 'Member deactivated successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

export default router;