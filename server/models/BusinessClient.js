const mongoose = require('mongoose');

const businessClientSchema = new mongoose.Schema({
  // Basic Information
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  businessType: {
    type: String,
    enum: ['auto_repair', 'tire_shop', 'oil_change', 'brake_shop', 'general_repair', 'dealership', 'specialty_shop', 'other'],
    default: 'auto_repair'
  },
  
  // Contact Information
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
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    }
  },
  
  // Business Address
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
    },
    country: {
      type: String,
      default: 'USA',
      trim: true
    }
  },
  
  // Business Details
  businessInfo: {
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
    },
    services: [{
      type: String,
      trim: true
    }],
    specialties: [{
      type: String,
      trim: true
    }],
    certifications: [{
      type: String,
      trim: true
    }]
  },
  
  // Subscription & Billing
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'professional', 'enterprise', 'custom'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'suspended', 'cancelled', 'expired'],
      default: 'trial'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually'],
      default: 'monthly'
    },
    monthlyFee: {
      type: Number,
      default: 0
    },
    features: [{
      type: String,
      trim: true
    }]
  },
  
  // Customization & Branding
  branding: {
    logo: {
      type: String
    },
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#1F2937'
    },
    companyName: {
      type: String,
      trim: true
    },
    tagline: {
      type: String,
      trim: true
    },
    customDomain: {
      type: String,
      trim: true
    }
  },
  
  // Settings & Configuration
  settings: {
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
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
        default: true
      }
    },
    integrations: {
      quickbooks: {
        enabled: {
          type: Boolean,
          default: false
        },
        connected: {
          type: Boolean,
          default: false
        }
      },
      stripe: {
        enabled: {
          type: Boolean,
          default: false
        },
        connected: {
          type: Boolean,
          default: false
        }
      },
      mailchimp: {
        enabled: {
          type: Boolean,
          default: false
        },
        connected: {
          type: Boolean,
          default: false
        }
      }
    }
  },
  
  // Status & Metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  source: {
    type: String,
    enum: ['direct', 'referral', 'advertising', 'partnership', 'other'],
    default: 'direct'
  },
  notes: {
    type: String,
    trim: true
  },
  
  // Admin tracking
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

// Indexes for better query performance
businessClientSchema.index({ 'contactPerson.email': 1 });
businessClientSchema.index({ 'contactPerson.phone': 1 });
businessClientSchema.index({ businessName: 1 });
businessClientSchema.index({ 'subscription.status': 1 });
businessClientSchema.index({ status: 1 });
businessClientSchema.index({ 'address.city': 1, 'address.state': 1 });

// Virtual for full address
businessClientSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
});

// Virtual for subscription status
businessClientSchema.virtual('isSubscriptionActive').get(function() {
  return ['active', 'trial'].includes(this.subscription.status);
});

// Method to check if subscription is expired
businessClientSchema.methods.isSubscriptionExpired = function() {
  if (!this.subscription.endDate) return false;
  return new Date() > this.subscription.endDate;
};

// Method to get subscription days remaining
businessClientSchema.methods.getSubscriptionDaysRemaining = function() {
  if (!this.subscription.endDate) return null;
  const now = new Date();
  const endDate = new Date(this.subscription.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

module.exports = mongoose.model('BusinessClient', businessClientSchema);
