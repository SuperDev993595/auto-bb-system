const mongoose = require('mongoose');

// Service history schema
const serviceHistorySchema = new mongoose.Schema({
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Service date is required'],
    default: Date.now
  },
  mileage: {
    type: Number
  },
  parts: [{
    name: String,
    partNumber: String,
    quantity: Number,
    cost: Number
  }],
  laborHours: {
    type: Number,
    min: [0, 'Labor hours cannot be negative']
  },
  laborRate: {
    type: Number,
    min: [0, 'Labor rate cannot be negative']
  },
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required'],
    min: [0, 'Total cost cannot be negative']
  },
  technician: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  nextServiceDue: {
    type: Date
  },
  nextServiceMileage: {
    type: Number
  }
}, {
  timestamps: true
});

// Main customer schema for individual customers
const customerSchema = new mongoose.Schema({
  // Basic information
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  businessName: {
    type: String,
    trim: true
  },
  
  // Address information
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    }
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    },
    reminders: {
      appointments: {
        type: Boolean,
        default: true
      },
      maintenance: {
        type: Boolean,
        default: true
      },
      payments: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      shareData: {
        type: Boolean,
        default: false
      },
      marketing: {
        type: Boolean,
        default: false
      }
    }
  },
  

  
  // Service history
  serviceHistory: [serviceHistorySchema],
  
  // Status and metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect'],
    default: 'active'
  },
  
  // Reference to user account (if exists)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Assigned to admin/sales rep
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  lastContact: {
    type: Date
  },
  nextFollowUp: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ 'address.city': 1, 'address.state': 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ assignedTo: 1 });
customerSchema.index({ nextFollowUp: 1 });


// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  if (!this.address.street) return '';
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// Virtual for vehicles (populated when needed)
customerSchema.virtual('vehicles', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'customer'
});

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);
