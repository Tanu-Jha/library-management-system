import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  serial_number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, enum: ['Science', 'Economics', 'Fiction', 'Children', 'Personal Development'], required: true },
  status: { type: String, enum: ['Available', 'Issued', 'Lost', 'Damaged'], default: 'Available' },
  cost: { type: Number, default: 0 },
  procurement_date: { type: Date },
  quantity: { type: Number, default: 1 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.Book || mongoose.model('Book', bookSchema);