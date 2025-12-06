import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  serial_number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  director: { type: String, required: true },
  category: { type: String, enum: ['Science', 'Economics', 'Fiction', 'Children', 'Personal Development'], required: true },
  status: { type: String, enum: ['Available', 'Issued', 'Lost', 'Damaged'], default: 'Available' },
  cost: { type: Number, default: 0 },
  procurement_date: { type: Date },
  quantity: { type: Number, default: 1 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.Movie || mongoose.model('Movie', movieSchema);