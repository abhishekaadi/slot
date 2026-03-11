import mongoose from 'mongoose';
export const BatchSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
export const ChannelSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
export const Batch = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
export const Channel = mongoose.models.Channel || mongoose.model('Channel', ChannelSchema);
