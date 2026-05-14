import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['customer', 'organizer', 'admin'], default: 'customer' },
    isBlocked: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    interests: [{ type: String }],
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

// Indexes for performance optimization
userSchema.index({ email: 1 }); // For login and user lookup
userSchema.index({ role: 1 }); // For filtering by role
userSchema.index({ isBlocked: 1 }); // For filtering active users
userSchema.index({ createdAt: -1 }); // For sorting by registration date
userSchema.index({ points: -1 }); // For leaderboards
userSchema.index({ interests: 1 }); // For user recommendations
userSchema.index({ role: 1, isBlocked: 1 }); // Compound index for active users by role

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;


