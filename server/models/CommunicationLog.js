const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required']
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  type: {
    type: String,
    enum: ['phone', 'email', 'in-person', 'sms'],
    required: [true, 'Communication type is required']
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: [true, 'Direction is required']
  },
  subject: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  outcome: {
    type: String,
    enum: ['resolved', 'follow-up-needed', 'appointment-scheduled', 'no-answer', 'callback-requested'],
    required: [true, 'Outcome is required']
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee ID is required']
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: [true, 'Priority is required']
  },
  relatedService: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

// Index for better query performance
communicationLogSchema.index({ customerId: 1, date: -1 });
communicationLogSchema.index({ type: 1 });
communicationLogSchema.index({ employeeId: 1 });

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);
