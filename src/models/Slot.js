import mongoose from 'mongoose';

const SlotSchema = new mongoose.Schema({
  location: { type: String, required: true },
  category: { type: String, required: true },
  batchName: { type: String },
  channelName: { type: String },
  lectureType: { type: String, required: true },
  rec: { type: Boolean, default: false },
  studioCode: { type: String, required: true },
  facultyEmail: { type: String, required: true },
  facultyName: { type: String, required: true },
  date: { type: Date, required: true },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  plannerFileUrl: { type: String },
  status: { type: String, enum: ['BOOKED', 'CANCELED', 'RESCHEDULED', 'SHUFFLED'], default: 'BOOKED' },
  
  // Audit fields
  bookedBy: { type: String, required: true }, // Email of user
  updatedBy: { type: String },
  canceledBy: { type: String },
  rescheduledBy: { type: String },
  shuffledBy: { type: String },
  history: [{
      action: { type: String },
      user: { type: String },
      timestamp: { type: Date, default: Date.now },
      details: { type: mongoose.Schema.Types.Mixed }
  }]
}, { timestamps: true });

export const Slot = mongoose.models.Slot || mongoose.model('Slot', SlotSchema);
