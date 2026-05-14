import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' },
    qrCodeDataUrl: { type: String },
    checkedInAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for performance optimization
registrationSchema.index({ user: 1, event: 1 }, { unique: true }); // Prevent duplicate registrations
registrationSchema.index({ user: 1 }); // For finding user's registrations
registrationSchema.index({ event: 1 }); // For finding event participants
registrationSchema.index({ status: 1 }); // For filtering by status
registrationSchema.index({ event: 1, status: 1 }); // Compound index for event participants by status
registrationSchema.index({ createdAt: -1 }); // For sorting by registration date
registrationSchema.index({ checkedInAt: 1 }); // For check-in analytics

export const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;


