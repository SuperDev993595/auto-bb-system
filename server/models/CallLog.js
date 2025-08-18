const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  // Call information
  date: {
    type: Date,
    required: [true, 'Call date is required'],
    default: Date.now
  },
  type: {
    type: String,
    enum: ['inbound', 'outbound', 'missed', 'voicemail'],
    required: [true, 'Call type is required']
  },
  duration: {
    type: Number, // in seconds
    min: [0, 'Duration cannot be negative'],
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 200
  },
  followUpDate: {
    type: Date
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  phoneNumber: {
    type: String,
    trim: true,
    maxlength: 20
  },
  
  // Reference to customer
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Call log must belong to a customer']
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Call log must have a creator']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
callLogSchema.index({ customer: 1, date: -1 });
callLogSchema.index({ date: -1 });
callLogSchema.index({ type: 1 });
callLogSchema.index({ createdBy: 1 });
callLogSchema.index({ followUpDate: 1 });

// Virtual for formatted duration
callLogSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for formatted date
callLogSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Ensure virtual fields are serialized
callLogSchema.set('toJSON', { virtuals: true });
callLogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CallLog', callLogSchema);
