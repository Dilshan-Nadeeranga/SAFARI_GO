//BACKEND/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'vehicle_owner', 'admin'],
    required: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumUntil: {
    type: Date,
    default: null,
  },
  premiumPlan: {
    type: String,
    enum: ['bronze', 'silver', 'gold', null],
    default: null
  },
  discountRate: {
    type: Number,
    default: 0
  },
  subscriptionHistory: [{
    plan: String,
    purchasedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date,
    amount: Number
  }]
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;