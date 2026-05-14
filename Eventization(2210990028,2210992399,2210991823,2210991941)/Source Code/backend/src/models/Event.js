import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, default: 0 },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    posterUrl: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    tags: [{ type: String }],
    averageRating: { type: Number, default: 0 },
    // AI Prediction fields
    predictedAttendance: { type: Number, default: 0 },
    predictionConfidence: { type: Number, default: 0 },
    predictionMethodology: { type: String, enum: ['ml_regression', 'rule_based'], default: 'rule_based' },
    lastPredictedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for performance optimization
eventSchema.index({ date: 1 }); // For sorting by date
eventSchema.index({ category: 1 }); // For filtering by category
eventSchema.index({ location: 1 }); // For filtering by location
eventSchema.index({ status: 1 }); // For filtering by status
eventSchema.index({ organizer: 1 }); // For finding events by organizer
eventSchema.index({ title: 'text', description: 'text' }); // For text search
eventSchema.index({ tags: 1 }); // For filtering by tags
eventSchema.index({ averageRating: -1 }); // For sorting by rating
eventSchema.index({ createdAt: -1 }); // For sorting by creation date
eventSchema.index({ date: 1, status: 1 }); // Compound index for upcoming approved events
eventSchema.index({ category: 1, date: 1 }); // Compound index for category + date filtering

export const Event = mongoose.model('Event', eventSchema);
export default Event;


