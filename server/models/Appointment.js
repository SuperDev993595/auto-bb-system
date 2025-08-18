const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'oil_change',
      'tire_rotation',
      'brake_service',
      'engine_repair',
      'transmission_service',
      'electrical_repair',
      'diagnostic',
      'inspection',
      'maintenance',
      'emergency_repair',
      'other'
    ]
  },
  serviceDescription: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: [15, 'Minimum duration is 15 minutes']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Appointment must be assigned to a user']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Appointment must have a creator']
  },
  notes: {
    type: String,
    trim: true
  },
  customerNotes: {
    type: String,
    trim: true
  },
  partsRequired: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    partNumber: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },
    inStock: {
      type: Boolean,
      default: false
    }
  }],
  estimatedCost: {
    parts: {
      type: Number,
      min: [0, 'Parts cost cannot be negative'],
      default: 0
    },
    labor: {
      type: Number,
      min: [0, 'Labor cost cannot be negative'],
      default: 0
    },
    total: {
      type: Number,
      min: [0, 'Total cost cannot be negative'],
      default: 0
    }
  },
  actualCost: {
    parts: {
      type: Number,
      min: [0, 'Parts cost cannot be negative'],
      default: 0
    },
    labor: {
      type: Number,
      min: [0, 'Labor cost cannot be negative'],
      default: 0
    },
    total: {
      type: Number,
      min: [0, 'Total cost cannot be negative'],
      default: 0
    }
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  actualDuration: {
    type: Number, // in minutes
    min: [0, 'Duration cannot be negative']
  },
  completionNotes: {
    type: String,
    trim: true
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  confirmationSent: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ customer: 1, scheduledDate: 1 });
appointmentSchema.index({ assignedTo: 1, status: 1 });
appointmentSchema.index({ scheduledDate: 1, scheduledTime: 1 });
appointmentSchema.index({ status: 1, scheduledDate: 1 });

// Virtual for full scheduled datetime
appointmentSchema.virtual('scheduledDateTime').get(function() {
  if (this.scheduledDate && this.scheduledTime) {
    const [hours, minutes] = this.scheduledTime.split(':');
    const dateTime = new Date(this.scheduledDate);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return dateTime;
  }
  return null;
});

// Method to check if appointment conflicts with existing ones
appointmentSchema.methods.checkConflicts = async function() {
  // Get all appointments for the same date and assigned user
  const existingAppointments = await this.constructor.find({
    _id: { $ne: this._id },
    assignedTo: this.assignedTo,
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    scheduledDate: this.scheduledDate
  });

  const conflicts = [];
  
  // Convert current appointment time to minutes
  const [currentHours, currentMinutes] = this.scheduledTime.split(':').map(Number);
  const currentStartMinutes = currentHours * 60 + currentMinutes;
  const currentEndMinutes = currentStartMinutes + this.estimatedDuration;

  for (const appointment of existingAppointments) {
    // Convert existing appointment time to minutes
    const [existingHours, existingMinutes] = appointment.scheduledTime.split(':').map(Number);
    const existingStartMinutes = existingHours * 60 + existingMinutes;
    const existingEndMinutes = existingStartMinutes + appointment.estimatedDuration;

    // Check for overlap
    if (
      (currentStartMinutes < existingEndMinutes && currentEndMinutes > existingStartMinutes) ||
      (existingStartMinutes < currentEndMinutes && existingEndMinutes > currentStartMinutes)
    ) {
      conflicts.push(appointment);
    }
  }
  
  return conflicts;
};

// Method to calculate actual cost
appointmentSchema.methods.calculateActualCost = function() {
  const partsCost = this.partsRequired.reduce((total, part) => {
    return total + (part.cost * part.quantity);
  }, 0);
  
  const laborCost = this.actualDuration ? (this.actualDuration / 60) * 100 : 0; // Assuming $100/hour labor rate
  
  this.actualCost = {
    parts: partsCost,
    labor: laborCost,
    total: partsCost + laborCost
  };
  
  return this.actualCost;
};

// Pre-save middleware to update estimated cost
appointmentSchema.pre('save', function(next) {
  if (this.partsRequired && this.partsRequired.length > 0) {
    const partsCost = this.partsRequired.reduce((total, part) => {
      return total + (part.cost * part.quantity);
    }, 0);
    
    const laborCost = (this.estimatedDuration / 60) * 100; // Assuming $100/hour labor rate
    
    this.estimatedCost = {
      parts: partsCost,
      labor: laborCost,
      total: partsCost + laborCost
    };
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
