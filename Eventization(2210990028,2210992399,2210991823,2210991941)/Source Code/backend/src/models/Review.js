import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes for performance optimization
reviewSchema.index({ user: 1, event: 1 }, { unique: true }); // Prevent duplicate reviews
reviewSchema.index({ event: 1 }); // For finding event reviews
reviewSchema.index({ rating: 1 }); // For filtering by rating
reviewSchema.index({ event: 1, rating: -1 }); // Compound index for event reviews sorted by rating
reviewSchema.index({ createdAt: -1 }); // For sorting by review date
reviewSchema.index({ event: 1, createdAt: -1 }); // Compound index for recent event reviews

export const Review = mongoose.model('Review', reviewSchema);
export default Review;


