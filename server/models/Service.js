const mongoose = require('mongoose');

const servicePartSchema = new mongoose.Schema({
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
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const serviceCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'maintenance',
      'repair',
      'diagnostic',
      'inspection',
      'emergency',
      'preventive',
      'other'
    ]
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: [15, 'Minimum duration is 15 minutes']
  },
  laborRate: {
    type: Number,
    required: [true, 'Labor rate is required'],
    min: [0, 'Labor rate cannot be negative']
  },
  parts: [servicePartSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const workOrderSchema = new mongoose.Schema({
  workOrderNumber: {
    type: String,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  vehicle: {
    make: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true
    },
    vin: {
      type: String,
      trim: true
    },
    licensePlate: {
      type: String,
      trim: true
    },
    mileage: {
      type: Number,
      min: [0, 'Mileage cannot be negative']
    }
  },
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCatalog',
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    laborHours: {
      type: Number,
      required: true,
      min: [0, 'Labor hours cannot be negative']
    },
    laborRate: {
      type: Number,
      required: true,
      min: [0, 'Labor rate cannot be negative']
    },
    parts: [servicePartSchema],
    totalCost: {
      type: Number,
      required: true,
      min: [0, 'Total cost cannot be negative']
    }
  }],
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0
  },
  estimatedStartDate: {
    type: Date
  },
  estimatedCompletionDate: {
    type: Date
  },
  actualStartDate: {
    type: Date
  },
  actualCompletionDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  customerNotes: {
    type: String,
    trim: true
  },
  totalLaborHours: {
    type: Number,
    default: 0,
    min: [0, 'Total labor hours cannot be negative']
  },
  totalLaborCost: {
    type: Number,
    default: 0,
    min: [0, 'Total labor cost cannot be negative']
  },
  totalPartsCost: {
    type: Number,
    default: 0,
    min: [0, 'Total parts cost cannot be negative']
  },
  totalCost: {
    type: Number,
    default: 0,
    min: [0, 'Total cost cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const technicianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Technician name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [0, 'Hourly rate cannot be negative']
  },
  specializations: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: {
      type: String,
      trim: true
    },
    issuingAuthority: {
      type: String,
      trim: true
    },
    issueDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
serviceCatalogSchema.index({ name: 1 });
serviceCatalogSchema.index({ category: 1 });
serviceCatalogSchema.index({ isActive: 1 });

workOrderSchema.index({ workOrderNumber: 1 });
workOrderSchema.index({ customer: 1 });
workOrderSchema.index({ technician: 1 });
workOrderSchema.index({ status: 1 });
workOrderSchema.index({ createdAt: -1 });

technicianSchema.index({ name: 1 });
technicianSchema.index({ email: 1 });
technicianSchema.index({ isActive: 1 });

// Text indexes for search functionality
serviceCatalogSchema.index({
  name: 'text',
  description: 'text',
  category: 'text'
});

workOrderSchema.index({
  workOrderNumber: 'text',
  'vehicle.make': 'text',
  'vehicle.model': 'text',
  notes: 'text'
});

technicianSchema.index({
  name: 'text',
  email: 'text',
  specializations: 'text'
});

// Virtual for service catalog total price
serviceCatalogSchema.virtual('totalPrice').get(function() {
  const laborCost = (this.estimatedDuration / 60) * this.laborRate;
  const partsCost = this.parts.reduce((sum, part) => sum + part.totalPrice, 0);
  return laborCost + partsCost;
});

// Methods for work orders
workOrderSchema.methods.calculateTotals = function() {
  this.totalLaborHours = this.services.reduce((sum, service) => sum + service.laborHours, 0);
  this.totalLaborCost = this.services.reduce((sum, service) => sum + (service.laborHours * service.laborRate), 0);
  this.totalPartsCost = this.services.reduce((sum, service) => 
    sum + service.parts.reduce((partSum, part) => partSum + part.totalPrice, 0), 0
  );
  this.totalCost = this.totalLaborCost + this.totalPartsCost;
  return this;
};

workOrderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  
  if (newStatus === 'in_progress' && !this.actualStartDate) {
    this.actualStartDate = new Date();
  }
  
  if (newStatus === 'completed' && !this.actualCompletionDate) {
    this.actualCompletionDate = new Date();
  }
  
  if (notes) {
    this.notes = this.notes ? `${this.notes}\n${notes}` : notes;
  }
  
  return this.save();
};

// Pre-save middleware
workOrderSchema.pre('save', function(next) {
  if (this.isModified('services')) {
    this.calculateTotals();
  }
  next();
});

// Generate work order number
workOrderSchema.pre('save', function(next) {
  if (this.isNew && !this.workOrderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.workOrderNumber = `WO-${year}${month}${day}-${random}`;
  }
  next();
});

const serviceSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  date: {
    type: Date,
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  technician: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  parts: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    partNumber: {
      type: String,
      trim: true,
      maxlength: 50
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  laborHours: {
    type: Number,
    min: 0
  },
  laborRate: {
    type: Number,
    min: 0
  },
  laborCost: {
    type: Number,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'scheduled', 'cancelled'],
    default: 'completed'
  },
  nextServiceDate: {
    type: Date
  },
  nextServiceMileage: {
    type: Number,
    min: 0
  },
  warranty: {
    type: String,
    trim: true,
    maxlength: 100
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  customerNotes: {
    type: String,
    maxlength: 1000
  },
  recommendations: [{
    service: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    estimatedCost: {
      type: Number,
      min: 0
    },
    description: {
      type: String,
      maxlength: 500
    }
  }],
  photos: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: 200
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
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

// Index for efficient queries
serviceSchema.index({ customerId: 1, date: -1 });
serviceSchema.index({ vehicleId: 1, date: -1 });
serviceSchema.index({ appointmentId: 1 });
serviceSchema.index({ status: 1 });

// Virtual for service summary
serviceSchema.virtual('summary').get(function() {
  return `${this.serviceType} - ${this.date.toLocaleDateString()} - $${this.total.toFixed(2)}`;
});

// Ensure virtual fields are serialized
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

// Pre-save middleware to calculate totals
serviceSchema.pre('save', function(next) {
  // Calculate parts total
  const partsTotal = this.parts.reduce((sum, part) => sum + part.totalPrice, 0);
  
  // Calculate labor cost
  this.laborCost = (this.laborHours || 0) * (this.laborRate || 0);
  
  // Calculate subtotal
  this.subtotal = partsTotal + this.laborCost;
  
  // Calculate total with tax and discount
  this.total = this.subtotal + this.tax - (this.discount || 0);
  
  this.updatedAt = new Date();
  next();
});

module.exports = {
  ServiceCatalog: mongoose.model('ServiceCatalog', serviceCatalogSchema),
  WorkOrder: mongoose.model('WorkOrder', workOrderSchema),
  Technician: mongoose.model('Technician', technicianSchema),
  Service: mongoose.model('Service', serviceSchema)
};
