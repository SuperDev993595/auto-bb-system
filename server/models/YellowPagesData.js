const mongoose = require('mongoose');

const yellowPagesDataSchema = new mongoose.Schema({
  // Basic business information
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },

  // Contact information
  contact: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      trim: true
    }
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

  // Business details
  businessInfo: {
    yearsInBusiness: {
      type: Number,
      min: 0
    },
    employeeCount: {
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
    }]
  },

  // Reviews and ratings
  reviews: {
    averageRating: {
      type: Number,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      min: 0
    }
  },

  // Social media presence
  socialMedia: {
    facebook: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    }
  },

  // Lead management information
  leadInfo: {
    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'not_interested', 'converted', 'lost'],
      default: 'new'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    notes: {
      type: String,
      trim: true
    },
    contactAttempts: [{
      date: {
        type: Date,
        default: Date.now
      },
      method: {
        type: String,
        enum: ['phone', 'email', 'in_person', 'social_media', 'other']
      },
      outcome: {
        type: String,
        enum: ['no_answer', 'left_message', 'spoke_to_decision_maker', 'not_interested', 'interested', 'follow_up_needed', 'converted']
      },
      notes: {
        type: String,
        trim: true
      },
      nextFollowUp: {
        type: Date
      }
    }],
    tags: [{
      type: String,
      trim: true
    }],
    convertedToCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    }
  },

  // Metadata
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
yellowPagesDataSchema.index({ businessName: 1 });
yellowPagesDataSchema.index({ category: 1 });
yellowPagesDataSchema.index({ 'address.city': 1, 'address.state': 1 });
yellowPagesDataSchema.index({ 'leadInfo.status': 1 });
yellowPagesDataSchema.index({ 'leadInfo.assignedTo': 1 });
yellowPagesDataSchema.index({ 'leadInfo.priority': 1 });
yellowPagesDataSchema.index({ scrapedAt: -1 });

// Text index for search functionality
yellowPagesDataSchema.index({
  businessName: 'text',
  category: 'text',
  'contact.phone': 'text',
  'contact.email': 'text',
  'address.city': 'text',
  'address.state': 'text'
});

// Virtual for full address
yellowPagesDataSchema.virtual('fullAddress').get(function() {
  const parts = [];
  if (this.address.street) parts.push(this.address.street);
  if (this.address.city) parts.push(this.address.city);
  if (this.address.state) parts.push(this.address.state);
  if (this.address.zipCode) parts.push(this.address.zipCode);
  return parts.join(', ');
});

// Virtual for contact score (based on available contact methods)
yellowPagesDataSchema.virtual('contactScore').get(function() {
  let score = 0;
  if (this.contact.phone) score += 1;
  if (this.contact.email) score += 1;
  if (this.contact.website) score += 1;
  return score;
});

// Virtual for lead quality score
yellowPagesDataSchema.virtual('leadQualityScore').get(function() {
  let score = 0;
  
  // Contact information (max 3 points)
  if (this.contact.phone) score += 1;
  if (this.contact.email) score += 1;
  if (this.contact.website) score += 1;
  
  // Business information (max 3 points)
  if (this.businessInfo.yearsInBusiness && this.businessInfo.yearsInBusiness > 5) score += 1;
  if (this.businessInfo.services && this.businessInfo.services.length > 0) score += 1;
  if (this.businessInfo.employeeCount) score += 1;
  
  // Reviews (max 2 points)
  if (this.reviews.averageRating && this.reviews.averageRating >= 4) score += 1;
  if (this.reviews.totalReviews && this.reviews.totalReviews >= 10) score += 1;
  
  // Social media presence (max 2 points)
  const socialCount = Object.values(this.socialMedia || {}).filter(Boolean).length;
  if (socialCount >= 2) score += 2;
  else if (socialCount === 1) score += 1;
  
  return Math.min(score, 10); // Cap at 10
});

// Methods
yellowPagesDataSchema.methods.addContactAttempt = function(attempt) {
  this.leadInfo.contactAttempts.push(attempt);
  this.lastUpdated = new Date();
  return this.save();
};

yellowPagesDataSchema.methods.assignLead = function(userId, reason) {
  this.leadInfo.assignedTo = userId;
  this.leadInfo.status = 'contacted';
  this.lastUpdated = new Date();
  
  // Add assignment note
  this.leadInfo.contactAttempts.push({
    date: new Date(),
    method: 'system',
    outcome: 'assigned',
    notes: `Assigned to user. ${reason || ''}`.trim()
  });
  
  return this.save();
};

yellowPagesDataSchema.methods.convertToCustomer = function(customerData) {
  this.leadInfo.status = 'converted';
  this.leadInfo.convertedToCustomer = customerData._id;
  this.lastUpdated = new Date();
  
  // Add conversion note
  this.leadInfo.contactAttempts.push({
    date: new Date(),
    method: 'system',
    outcome: 'converted',
    notes: 'Converted to customer'
  });
  
  return this.save();
};

// Pre-save middleware to update lastUpdated
yellowPagesDataSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('YellowPagesData', yellowPagesDataSchema);
