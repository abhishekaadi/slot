import mongoose from 'mongoose';

const CategoryDataSchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  batches: [{ type: String }],
  channels: [{ type: String }],
  faculties: [{ 
    email: { type: String },
    name: { type: String }
  }]
}, { timestamps: true });

export const CategoryData = mongoose.models.CategoryData || mongoose.model('CategoryData', CategoryDataSchema);
