import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema({
  transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true, unique: true },
  fine_amount: { type: Number, default: 0 },
  is_paid: { type: Number, default: 0 },
  paid_date: { type: Date },
  remarks: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.Fine || mongoose.model('Fine', fineSchema);