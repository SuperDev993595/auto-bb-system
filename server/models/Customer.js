const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  vin: {
    type: String,
    trim: true,
    uppercase: true
  },
  licensePlate: {
    type: String,
    trim: true,
    uppercase: true
  },
  mileage: {
    type: Number,
    min: [0, 'Mileage cannot be negative']
  },
  color: {
    type: String,
    trim: true
  },
  engineType: {
    type: String,
    trim: true
  },
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual', 'CVT', 'Other'],
    default: 'Automatic'
  }
}, {
  timestamps: true
});

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

const communicationLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['phone', 'email', 'in_person', 'text', 'other'],
    required: [true, 'Communication type is required']
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: [true, 'Communication direction is required']
  },
  subject: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in minutes
    min: [0, 'Duration cannot be negative']
  },
  outcome: {
    type: String,
    enum: ['scheduled', 'completed', 'rescheduled', 'cancelled', 'no_answer', 'left_message', 'other'],
    default: 'other'
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const customerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  contactPerson: {
    name: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true
    }
  },
  businessInfo: {
    businessType: {
      type: String,
      enum: ['auto_repair', 'tire_shop', 'oil_change', 'brake_shop', 'general_repair', 'other'],
      default: 'auto_repair'
    },
    yearsInBusiness: {
      type: Number,
      min: [0, 'Years in business cannot be negative']
    },
    employeeCount: {
      type: Number,
      min: [1, 'Employee count must be at least 1']
    },
    website: {
      type: String,
      trim: true
    },
    hours: {
      type: String,
      trim: true
    }
  },
  vehicles: [vehicleSchema],
  serviceHistory: [serviceHistorySchema],
  communicationLogs: [communicationLogSchema],
  notes: {
    type: String,
    trim: true
  },
  preferences: {
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'text'],
      default: 'phone'
    },
    preferredContactTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime'],
      default: 'anytime'
    },
    specialInstructions: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'former'],
    default: 'prospect'
  },
  source: {
    type: String,
    enum: ['yellowpages', 'referral', 'website', 'cold_call', 'other'],
    default: 'other'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastContact: {
    type: Date
  },
  nextFollowUp: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
customerSchema.index({ 'contactPerson.email': 1 });
customerSchema.index({ 'contactPerson.phone': 1 });
customerSchema.index({ 'address.city': 1, 'address.state': 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ assignedTo: 1 });
customerSchema.index({ nextFollowUp: 1 });

module.exports = mongoose.model('Customer', customerSchema);
