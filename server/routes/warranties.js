const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Warranty = require('../models/Warranty');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');

// Get all warranties
router.get('/', auth, async (req, res) => {
  try {
    const { customer, vehicle, status, warrantyType } = req.query;
    const filter = {};

    if (customer) filter.customer = customer;
    if (vehicle) filter.vehicle = vehicle;
    if (status) filter.status = status;
    if (warrantyType) filter.warrantyType = warrantyType;

    const warranties = await Warranty.find(filter)
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model year vin')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(warranties);
  } catch (error) {
    console.error('Error fetching warranties:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single warranty
router.get('/:id', auth, async (req, res) => {
  try {
    const warranty = await Warranty.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model year vin mileage')
      .populate('createdBy', 'name email');

    if (!warranty) {
      return res.status(404).json({ message: 'Warranty not found' });
    }

    res.json(warranty);
  } catch (error) {
    console.error('Error fetching warranty:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new warranty
router.post('/', auth, async (req, res) => {
  try {
    const {
      customer,
      vehicle,
      warrantyType,
      name,
      description,
      startDate,
      endDate,
      mileageLimit,
      currentMileage,
      coverage,
      deductible,
      maxClaimAmount,
      provider,
      terms,
      exclusions,
      notes
    } = req.body;

    const warranty = new Warranty({
      customer,
      vehicle,
      warrantyType,
      name,
      description,
      startDate,
      endDate,
      mileageLimit,
      currentMileage,
      coverage,
      deductible,
      maxClaimAmount,
      provider,
      terms,
      exclusions,
      notes,
      createdBy: req.user.id
    });

    await warranty.save();

    const populatedWarranty = await warranty
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model year vin')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedWarranty);
  } catch (error) {
    console.error('Error creating warranty:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a warranty
router.put('/:id', auth, async (req, res) => {
  try {
    const warranty = await Warranty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('customer', 'name email phone')
    .populate('vehicle', 'make model year vin')
    .populate('createdBy', 'name email');

    if (!warranty) {
      return res.status(404).json({ message: 'Warranty not found' });
    }

    res.json(warranty);
  } catch (error) {
    console.error('Error updating warranty:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a warranty
router.delete('/:id', auth, async (req, res) => {
  try {
    const warranty = await Warranty.findById(req.params.id);

    if (!warranty) {
      return res.status(404).json({ message: 'Warranty not found' });
    }

    // Check if warranty has any claims
    if (warranty.totalClaims > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete warranty with existing claims' 
      });
    }

    await warranty.remove();
    res.json({ message: 'Warranty deleted successfully' });
  } catch (error) {
    console.error('Error deleting warranty:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer warranties
router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const warranties = await Warranty.find({
      customer: req.params.customerId
    })
    .populate('vehicle', 'make model year vin mileage')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    res.json(warranties);
  } catch (error) {
    console.error('Error fetching customer warranties:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vehicle warranties
router.get('/vehicle/:vehicleId', auth, async (req, res) => {
  try {
    const warranties = await Warranty.find({
      vehicle: req.params.vehicleId
    })
    .populate('customer', 'name email phone')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    res.json(warranties);
  } catch (error) {
    console.error('Error fetching vehicle warranties:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update warranty mileage
router.patch('/:id/mileage', auth, async (req, res) => {
  try {
    const { currentMileage } = req.body;

    const warranty = await Warranty.findById(req.params.id);
    
    if (!warranty) {
      return res.status(404).json({ message: 'Warranty not found' });
    }

    warranty.currentMileage = currentMileage;
    
    // Check if warranty is expired by mileage
    if (warranty.mileageLimit && currentMileage > warranty.mileageLimit) {
      warranty.status = 'expired';
    }

    await warranty.save();

    const populatedWarranty = await warranty
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model year vin')
      .populate('createdBy', 'name email');

    res.json(populatedWarranty);
  } catch (error) {
    console.error('Error updating warranty mileage:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add warranty claim
router.patch('/:id/claim', auth, async (req, res) => {
  try {
    const { claimAmount, claimDescription } = req.body;

    const warranty = await Warranty.findById(req.params.id);
    
    if (!warranty) {
      return res.status(404).json({ message: 'Warranty not found' });
    }

    if (warranty.status !== 'active') {
      return res.status(400).json({ message: 'Warranty is not active' });
    }

    // Check if claim amount exceeds max claim amount
    if (warranty.maxClaimAmount && claimAmount > warranty.maxClaimAmount) {
      return res.status(400).json({ 
        message: 'Claim amount exceeds maximum claim amount' 
      });
    }

    warranty.totalClaims += 1;
    warranty.totalClaimAmount += claimAmount;

    await warranty.save();

    const populatedWarranty = await warranty
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model year vin')
      .populate('createdBy', 'name email');

    res.json(populatedWarranty);
  } catch (error) {
    console.error('Error adding warranty claim:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get warranty statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Warranty.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalClaims: { $sum: '$totalClaims' },
          totalClaimAmount: { $sum: '$totalClaimAmount' }
        }
      }
    ]);

    const totalWarranties = await Warranty.countDocuments();
    const activeWarranties = await Warranty.countDocuments({ status: 'active' });
    const expiringSoon = await Warranty.countDocuments({
      status: 'active',
      endDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      }
    });

    const mileageExpiring = await Warranty.countDocuments({
      status: 'active',
      $expr: {
        $and: [
          { $ne: ['$mileageLimit', null] },
          { $gte: ['$currentMileage', { $multiply: ['$mileageLimit', 0.9] }] } // Within 10% of limit
        ]
      }
    });

    res.json({
      totalWarranties,
      activeWarranties,
      expiringSoon,
      mileageExpiring,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Error fetching warranty stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get warranties by type
router.get('/stats/by-type', auth, async (req, res) => {
  try {
    const typeStats = await Warranty.aggregate([
      {
        $group: {
          _id: '$warrantyType',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalClaims: { $sum: '$totalClaims' },
          totalClaimAmount: { $sum: '$totalClaimAmount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json(typeStats);
  } catch (error) {
    console.error('Error fetching warranty type stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
