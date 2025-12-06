import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Member, Transaction, User } from '../models/index.js'; 
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
    if (mongoose.Types.ObjectId.isValid(identifier)) {
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

// Add new member (admin only) - Creates User + Member
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      firstName, lastName, contactName, contactAddress, aadharNumber, 
      startDate, membershipType, username, password 
    } = req.body;

    if (!firstName || !lastName || !startDate || !membershipType || !username || !password) {
      return res.status(400).json({ error: 'All fields including username and password are required' });
    }

    // 1. Check if User exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // 2. Create User
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      is_admin: 0,
      is_active: 1,
      membership_status: 'approved'
    });

    // 3. Calculate Dates
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

    // 4. Create Member
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
      is_active: 1,
      user_id: newUser._id // Link to the new user
    });

    res.status(201).json({ member, user: { id: newUser._id, username } });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Approve User Membership (Admin Only)
router.post('/approve/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.membership_status === 'approved') return res.status(400).json({ error: 'User already approved' });

    const count = await Member.countDocuments();
    const membership_number = `MEM-${String(count + 1).padStart(3, '0')}`;

    const start_date = new Date();
    const end_date = new Date();
    end_date.setMonth(end_date.getMonth() + 6);

    const names = user.name.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'User';

    const member = await Member.create({
      membership_number,
      first_name: firstName,
      last_name: lastName,
      contact_name: user.name,
      contact_address: 'Pending Update',
      aadhar_number: 'Pending',
      start_date,
      end_date,
      membership_type: '6_months',
      is_active: 1,
      user_id: user._id
    });

    user.membership_status = 'approved';
    user.is_active = 1;
    await user.save();

    res.json({ message: 'Membership approved successfully', member });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Failed to approve membership' });
  }
});

// Update member (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid member ID provided' });
    }

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
      const activeTransaction = await Transaction.findOne({
        member_id: id,
        status: { $in: ['issued', 'overdue'] }
      });

      if (activeTransaction) {
        return res.status(400).json({ error: 'Cannot cancel membership: Member has unreturned items.' });
      }

      member.is_active = 0;

      if (member.user_id) {
        await User.findByIdAndUpdate(member.user_id, { is_active: 0 });
      }
    }

    if (extendMembership && membershipType) {
      const now = new Date();
      let currentEnd = new Date(member.end_date);
      
      if (currentEnd < now) {
        currentEnd = new Date(now);
      }
      
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
      member.is_active = 1;
      
      // SYNC: Reactivate linked User if extending
      if (member.user_id) {
        await User.findByIdAndUpdate(member.user_id, { is_active: 1 });
      }
    }

    await member.save();
    res.json(member);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid member ID' });
    }

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

    if (member.user_id) {
      await User.findByIdAndUpdate(member.user_id, { is_active: 0 });
    }

    res.json({ message: 'Member deactivated successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

export default router;