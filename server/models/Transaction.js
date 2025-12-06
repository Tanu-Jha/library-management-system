import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  item_type: { type: String, enum: ['book', 'movie'], required: true },
  item_id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'item_type_ref' },
  item_type_ref: { type: String, enum: ['Book', 'Movie'] },
  issue_date: { type: Date, required: true },
  expected_return_date: { type: Date, required: true },
  actual_return_date: { type: Date },
  status: { type: String, enum: ['issued', 'returned', 'overdue', 'requested'], default: 'issued' },
  remarks: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Virtual to set item_type_ref based on item_type
transactionSchema.pre('save', function(next) {
  this.item_type_ref = this.item_type === 'book' ? 'Book' : 'Movie';
  next();
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);