const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: { type: String }, // Add notification type
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  details: { type: mongoose.Schema.Types.Mixed }, // Add details field for additional data
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Add recipient ID
  recipientRole: { type: String } // Add recipient role
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;