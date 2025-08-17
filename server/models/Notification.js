const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'service_reminder',
      'appointment_reminder',
      'appointment_confirmation',
      'payment_reminder',
      'maintenance_alert',
      'warranty_expiry',
      'follow_up',
      'marketing',
      'general'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channel: {
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
    default: 'pending'
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  sentAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  relatedData: {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
    }
  },
  metadata: {
    mileage: Number,
    serviceType: String,
    dueDate: Date,
    amount: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ customer: 1, status: 1 });
notificationSchema.index({ scheduledFor: 1, status: 'pending' });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for notification summary
notificationSchema.virtual('summary').get(function() {
  return `${this.type} - ${this.title}`;
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
