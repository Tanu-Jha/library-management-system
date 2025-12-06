import mongoose from 'mongoose';

const issueRequestSchema = new mongoose.Schema({
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  item_type: { type: String, enum: ['book', 'movie'], required: true },
  item_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  request_date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.IssueRequest || mongoose.model('IssueRequest', issueRequestSchema);