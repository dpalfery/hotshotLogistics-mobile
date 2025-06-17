import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ApiResponse, PaginatedResponse, Driver } from '../types';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

// Mock database - replace with actual database
const drivers: Driver[] = [
  {
    id: 'driver_1',
    userId: 'user_1',
    firstName: 'John',
    lastName: 'Martinez',
    phone: '(555) 123-4567',
    licenseNumber: 'CDL-TX-123456789',
    licenseExpiry: new Date('2025-12-31'),
    vehicleType: 'Sprinter Van',
    vehicleCapacity: 2000,
    rating: 4.8,
    totalJobs: 247,
    totalEarnings: 87450,
    isAvailable: true,
    currentLocation: {
      latitude: 30.2672,
      longitude: -97.7431
    },
    profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date()
  }
];

// Get all drivers (admin only)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('isAvailable').optional().isBoolean(),
  query('vehicleType').optional().isString()
], authenticateToken, requireAdmin, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const isAvailable = req.query.isAvailable;
  const vehicleType = req.query.vehicleType;

  let filteredDrivers = [...drivers];

  // Apply filters
  if (isAvailable !== undefined) {
    filteredDrivers = filteredDrivers.filter(driver => 
      driver.isAvailable === (isAvailable === 'true')
    );
  }
  if (vehicleType) {
    filteredDrivers = filteredDrivers.filter(driver => 
      driver.vehicleType.toLowerCase().includes((vehicleType as string).toLowerCase())
    );
  }

  // Pagination
  const total = filteredDrivers.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedDrivers,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  } as PaginatedResponse<Driver>);
});

// Get driver by ID
router.get('/:id', authenticateToken, (req: any, res) => {
  const driver = drivers.find(d => d.id === req.params.id);
  
  if (!driver) {
    throw new NotFoundError('Driver not found');
  }

  // Drivers can only see their own profile unless admin
  if (req.user.role === 'driver' && driver.userId !== req.user.id) {
    throw new NotFoundError('Driver not found');
  }

  res.json({
    success: true,
    data: driver
  } as ApiResponse<Driver>);
});

// Update driver profile
router.patch('/:id', [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('phone').optional().notEmpty().trim(),
  body('vehicleType').optional().notEmpty().trim(),
  body('vehicleCapacity').optional().isFloat({ min: 0 }),
  body('isAvailable').optional().isBoolean()
], authenticateToken, (req: any, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const driver = drivers.find(d => d.id === req.params.id);
  
  if (!driver) {
    throw new NotFoundError('Driver not found');
  }

  // Drivers can only update their own profile unless admin
  if (req.user.role === 'driver' && driver.userId !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'You can only update your own profile'
    } as ApiResponse);
  }

  // Update allowed fields
  const allowedUpdates = ['firstName', 'lastName', 'phone', 'vehicleType', 'vehicleCapacity', 'isAvailable'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      (driver as any)[field] = req.body[field];
    }
  });

  driver.updatedAt = new Date();

  res.json({
    success: true,
    data: driver,
    message: 'Driver profile updated successfully'
  } as ApiResponse<Driver>);
});

// Update driver location
router.post('/:id/location', [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 })
], authenticateToken, (req: any, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const driver = drivers.find(d => d.id === req.params.id);
  
  if (!driver) {
    throw new NotFoundError('Driver not found');
  }

  // Drivers can only update their own location
  if (driver.userId !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'You can only update your own location'
    } as ApiResponse);
  }

  const { latitude, longitude } = req.body;
  driver.currentLocation = { latitude, longitude };
  driver.updatedAt = new Date();

  res.json({
    success: true,
    data: { location: driver.currentLocation },
    message: 'Location updated successfully'
  } as ApiResponse);
});

// Get driver statistics
router.get('/:id/stats', authenticateToken, (req: any, res) => {
  const driver = drivers.find(d => d.id === req.params.id);
  
  if (!driver) {
    throw new NotFoundError('Driver not found');
  }

  // Drivers can only see their own stats unless admin
  if (req.user.role === 'driver' && driver.userId !== req.user.id) {
    throw new NotFoundError('Driver not found');
  }

  // Mock statistics - would be calculated from actual job data
  const stats = {
    totalJobs: driver.totalJobs,
    totalEarnings: driver.totalEarnings,
    averageRating: driver.rating,
    completionRate: 96.5,
    onTimeDeliveryRate: 94.2,
    thisWeekJobs: 12,
    thisWeekEarnings: 3250,
    thisMonthJobs: 48,
    thisMonthEarnings: 12800
  };

  res.json({
    success: true,
    data: stats
  } as ApiResponse);
});

// Get nearby drivers (admin only)
router.get('/nearby/:latitude/:longitude', [
  query('radius').optional().isFloat({ min: 1, max: 100 })
], authenticateToken, requireAdmin, (req, res) => {
  const latitude = parseFloat(req.params.latitude);
  const longitude = parseFloat(req.params.longitude);
  const radius = parseFloat(req.query.radius as string) || 50; // Default 50 miles

  // Simple distance calculation (would use proper geospatial queries in production)
  const nearbyDrivers = drivers.filter(driver => {
    if (!driver.currentLocation || !driver.isAvailable) return false;
    
    const distance = calculateDistance(
      latitude, longitude,
      driver.currentLocation.latitude, driver.currentLocation.longitude
    );
    
    return distance <= radius;
  });

  res.json({
    success: true,
    data: nearbyDrivers
  } as ApiResponse<Driver[]>);
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export { router as driverRoutes };