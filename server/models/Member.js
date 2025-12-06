import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  membership_number: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  contact_name: { type: String },
  contact_address: { type: String },
  aadhar_number: { type: String },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  membership_type: { type: String, enum: ['6_months', '1_year', '2_years'], default: '6_months' },
  is_active: { type: Number, default: 1 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.Member || mongoose.model('Member', memberSchema);