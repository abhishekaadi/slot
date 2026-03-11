import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  role: { type: String, enum: ['ADMIN', 'SI'], default: 'ADMIN' },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
