import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  is_admin: { type: Number, default: 0 },
  is_active: { type: Number, default: 1 },
  google_id: { type: String, unique: true, sparse: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.User || mongoose.model('User', userSchema);