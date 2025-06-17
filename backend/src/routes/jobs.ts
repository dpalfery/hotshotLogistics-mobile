import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken, requireDriverOrAdmin } from '../middleware/auth';
import { ApiResponse, PaginatedResponse } from '../types';
import { Job, JobStatus, JobPriority, CargoType, CreateJobRequest, UpdateJobRequest, JobSearchFilters } from '../types/job';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

// Mock database - replace with actual database
const jobs: Job[] = [];

// Get all jobs with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['draft', 'available', 'assigned', 'accepted', 'en_route_pickup', 'arrived_pickup', 'pickup_complete', 'en_route_delivery', 'arrived_delivery', 'delivered', 'completed', 'cancelled', 'failed']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent', 'emergency']),
  query('cargoType').optional().isIn(['general', 'electronics', 'medical', 'automotive', 'construction', 'food', 'chemicals', 'machinery', 'documents', 'other']),
  query('city').optional().isString(),
  query('customerId').optional().isString(),
  query('driverId').optional().isString(),
  query('minRate').optional().isFloat({ min: 0 }),
  query('maxRate').optional().isFloat({ min: 0 }),
  query('maxDistance').optional().isFloat({ min: 0 })
], authenticateToken, (req: any, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const filters: JobSearchFilters = {
    status: req.query.status ? [req.query.status as JobStatus] : undefined,
    priority: req.query.priority ? [req.query.priority as JobPriority] : undefined,
    cargoType: req.query.cargoType ? [req.query.cargoType as CargoType] : undefined,
    customerId: req.query.customerId,
    driverId: req.query.driverId,
    pickupCity: req.query.city,
    deliveryCity: req.query.city,
    minRate: req.query.minRate ? parseFloat(req.query.minRate) : undefined,
    maxRate: req.query.maxRate ? parseFloat(req.query.maxRate) : undefined,
    maxDistance: req.query.maxDistance ? parseFloat(req.query.maxDistance) : undefined
  };

  let filteredJobs = [...jobs];

  // Apply filters
  if (filters.status) {
    filteredJobs = filteredJobs.filter(job => filters.status!.includes(job.tracking.currentStatus));
  }
  if (filters.priority) {
    filteredJobs = filteredJobs.filter(job => filters.priority!.includes(job.priority));
  }
  if (filters.cargoType) {
    filteredJobs = filteredJobs.filter(job => filters.cargoType!.includes(job.cargoType));
  }
  if (filters.customerId) {
    filteredJobs = filteredJobs.filter(job => job.customerId === filters.customerId);
  }
  if (filters.driverId) {
    filteredJobs = filteredJobs.filter(job => job.driverId === filters.driverId);
  }
  if (filters.pickupCity) {
    filteredJobs = filteredJobs.filter(job => 
      job.pickupLocation.city.toLowerCase().includes(filters.pickupCity!.toLowerCase()) ||
      job.deliveryLocation.city.toLowerCase().includes(filters.deliveryCity!.toLowerCase())
    );
  }
  if (filters.minRate) {
    filteredJobs = filteredJobs.filter(job => job.pricing.totalRate >= filters.minRate!);
  }
  if (filters.maxRate) {
    filteredJobs = filteredJobs.filter(job => job.pricing.totalRate <= filters.maxRate!);
  }
  if (filters.maxDistance) {
    filteredJobs = filteredJobs.filter(job => job.distance <= filters.maxDistance!);
  }

  // For drivers, only show available jobs or their assigned jobs
  if (req.user.role === 'driver') {
    filteredJobs = filteredJobs.filter(job => 
      job.tracking.currentStatus === 'available' || job.driverId === req.user.id
    );
  }

  // Sort by creation date (newest first)
  filteredJobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Pagination
  const total = filteredJobs.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedJobs,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  } as PaginatedResponse<Job>);
});

// Get job by ID
router.get('/:id', authenticateToken, (req: any, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  
  if (!job) {
    throw new NotFoundError('Job not found');
  }

  // Drivers can only see available jobs or their assigned jobs
  if (req.user.role === 'driver' && job.tracking.currentStatus !== 'available' && job.driverId !== req.user.id) {
    throw new NotFoundError('Job not found');
  }

  res.json({
    success: true,
    data: job
  } as ApiResponse<Job>);
});

// Create new job (admin only)
router.post('/', [
  body('title').notEmpty().trim(),
  body('customerId').notEmpty().trim(),
  body('pickupLocation.address').notEmpty().trim(),
  body('pickupLocation.city').notEmpty().trim(),
  body('pickupLocation.state').notEmpty().trim(),
  body('pickupLocation.zipCode').notEmpty().trim(),
  body('deliveryLocation.address').notEmpty().trim(),
  body('deliveryLocation.city').notEmpty().trim(),
  body('deliveryLocation.state').notEmpty().trim(),
  body('deliveryLocation.zipCode').notEmpty().trim(),
  body('pickupTimeWindow.earliest').isISO8601(),
  body('pickupTimeWindow.latest').isISO8601(),
  body('deliveryTimeWindow.earliest').isISO8601(),
  body('deliveryTimeWindow.latest').isISO8601(),
  body('cargoType').isIn(['general', 'electronics', 'medical', 'automotive', 'construction', 'food', 'chemicals', 'machinery', 'documents', 'other']),
  body('cargoDescription').notEmpty().trim(),
  body('weight').isFloat({ min: 0 }),
  body('quantity').isInt({ min: 1 }),
  body('priority').isIn(['low', 'medium', 'high', 'urgent', 'emergency']),
  body('baseRate').isFloat({ min: 0 })
], authenticateToken, requireDriverOrAdmin, (req: any, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const jobData: CreateJobRequest = req.body;
  
  // Generate job number
  const jobNumber = `HS${Date.now().toString().slice(-6)}`;
  
  // Calculate distance (mock calculation - would use real geocoding service)
  const distance = Math.floor(Math.random() * 500) + 50; // 50-550 miles
  const estimatedDuration = Math.round(distance * 2.5); // Rough estimate: 2.5 minutes per mile
  
  // Calculate pricing
  const fuelSurcharge = jobData.baseRate * 0.1; // 10% fuel surcharge
  const urgencyMultiplier = jobData.priority === 'urgent' ? 1.5 : jobData.priority === 'emergency' ? 2.0 : 1.0;
  const totalRate = (jobData.baseRate + fuelSurcharge) * urgencyMultiplier;

  const newJob: Job = {
    id: `job_${Date.now()}`,
    jobNumber,
    title: jobData.title,
    description: jobData.description,
    customerId: jobData.customerId,
    customerName: '', // Would be fetched from customer service
    customerPhone: '', // Would be fetched from customer service
    customerEmail: '', // Would be fetched from customer service
    customerCompany: '',
    pickupLocation: {
      ...jobData.pickupLocation,
      latitude: 0, // Would be geocoded
      longitude: 0
    },
    pickupContactName: jobData.pickupContactName,
    pickupContactPhone: jobData.pickupContactPhone,
    pickupInstructions: jobData.pickupInstructions,
    pickupTimeWindow: {
      earliest: new Date(jobData.pickupTimeWindow.earliest),
      latest: new Date(jobData.pickupTimeWindow.latest)
    },
    deliveryLocation: {
      ...jobData.deliveryLocation,
      latitude: 0, // Would be geocoded
      longitude: 0
    },
    deliveryContactName: jobData.deliveryContactName,
    deliveryContactPhone: jobData.deliveryContactPhone,
    deliveryInstructions: jobData.deliveryInstructions,
    deliveryTimeWindow: {
      earliest: new Date(jobData.deliveryTimeWindow.earliest),
      latest: new Date(jobData.deliveryTimeWindow.latest)
    },
    cargoType: jobData.cargoType,
    cargoDescription: jobData.cargoDescription,
    weight: jobData.weight,
    dimensions: jobData.dimensions,
    quantity: jobData.quantity,
    value: jobData.value,
    requirements: jobData.requirements,
    priority: jobData.priority,
    distance,
    estimatedDuration,
    pricing: {
      baseRate: jobData.baseRate,
      fuelSurcharge,
      urgencyMultiplier,
      distanceRate: jobData.baseRate / distance,
      totalRate
    },
    tracking: {
      currentStatus: 'draft',
      statusHistory: [{
        status: 'draft',
        timestamp: new Date(),
        updatedBy: req.user.id
      }]
    },
    documents: {},
    specialInstructions: jobData.specialInstructions,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: req.user.id,
    lastUpdatedBy: req.user.id
  };

  jobs.push(newJob);

  res.status(201).json({
    success: true,
    data: newJob,
    message: 'Job created successfully'
  } as ApiResponse<Job>);
});

// Update job
router.patch('/:id', [
  body('title').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('pickupInstructions').optional().trim(),
  body('deliveryInstructions').optional().trim(),
  body('cargoDescription').optional().notEmpty().trim(),
  body('weight').optional().isFloat({ min: 0 }),
  body('quantity').optional().isInt({ min: 1 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent', 'emergency']),
  body('baseRate').optional().isFloat({ min: 0 }),
  body('specialInstructions').optional().trim(),
  body('internalNotes').optional().trim()
], authenticateToken, requireDriverOrAdmin, (req: any, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const job = jobs.find(j => j.id === req.params.id);
  
  if (!job) {
    throw new NotFoundError('Job not found');
  }

  // Only allow updates if job is in draft or available status
  if (!['draft', 'available'].includes(job.tracking.currentStatus)) {
    return res.status(400).json({
      success: false,
      error: 'Job cannot be updated in current status'
    } as ApiResponse);
  }

  const updateData: UpdateJobRequest = req.body;

  // Update allowed fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof UpdateJobRequest] !== undefined) {
      (job as any)[key] = updateData[key as keyof UpdateJobRequest];
    }
  });

  job.updatedAt = new Date();
  job.lastUpdatedBy = req.user.id;

  res.json({
    success: true,
    data: job,
    message: 'Job updated successfully'
  } as ApiResponse<Job>);
});

// Accept job (driver only)
router.post('/:id/accept', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({
      success: false,
      error: 'Only drivers can accept jobs'
    } as ApiResponse);
  }

  const job = jobs.find(j => j.id === req.params.id);
  
  if (!job) {
    throw new NotFoundError('Job not found');
  }

  if (job.tracking.currentStatus !== 'available') {
    return res.status(400).json({
      success: false,
      error: 'Job is not available for acceptance'
    } as ApiResponse);
  }

  // Update job status
  job.tracking.currentStatus = 'assigned';
  job.driverId = req.user.id;
  job.tracking.statusHistory.push({
    status: 'assigned',
    timestamp: new Date(),
    updatedBy: req.user.id
  });
  job.updatedAt = new Date();
  job.lastUpdatedBy = req.user.id;

  res.json({
    success: true,
    data: job,
    message: 'Job accepted successfully'
  } as ApiResponse<Job>);
});

// Update job status
router.patch('/:id/status', [
  body('status').isIn(['assigned', 'accepted', 'en_route_pickup', 'arrived_pickup', 'pickup_complete', 'en_route_delivery', 'arrived_delivery', 'delivered', 'completed', 'cancelled', 'failed']),
  body('notes').optional().trim(),
  body('location').optional().isObject()
], authenticateToken, (req: any, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const job = jobs.find(j => j.id === req.params.id);
  
  if (!job) {
    throw new NotFoundError('Job not found');
  }

  // Drivers can only update their own jobs
  if (req.user.role === 'driver' && job.driverId !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'You can only update your own jobs'
    } as ApiResponse);
  }

  const { status, notes, location } = req.body;
  
  // Update job status
  job.tracking.currentStatus = status;
  job.tracking.statusHistory.push({
    status,
    timestamp: new Date(),
    location,
    notes,
    updatedBy: req.user.id
  });

  // Update specific timestamps based on status
  switch (status) {
    case 'pickup_complete':
      job.tracking.actualPickupTime = new Date();
      break;
    case 'delivered':
      job.tracking.actualDeliveryTime = new Date();
      break;
    case 'completed':
      if (!job.tracking.actualDeliveryTime) {
        job.tracking.actualDeliveryTime = new Date();
      }
      break;
  }

  job.updatedAt = new Date();
  job.lastUpdatedBy = req.user.id;

  res.json({
    success: true,
    data: job,
    message: 'Job status updated successfully'
  } as ApiResponse<Job>);
});

// Upload job documents
router.post('/:id/documents', [
  body('photos').optional().isArray(),
  body('signature').optional().isString(),
  body('billOfLading').optional().isString(),
  body('proofOfDelivery').optional().isString(),
  body('damageReport').optional().isString()
], authenticateToken, (req: any, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const job = jobs.find(j => j.id === req.params.id);
  
  if (!job) {
    throw new NotFoundError('Job not found');
  }

  // Only assigned driver can upload documents
  if (job.driverId !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'You can only upload documents for your assigned jobs'
    } as ApiResponse);
  }

  const { photos, signature, billOfLading, proofOfDelivery, damageReport } = req.body;

  // Update documents
  if (photos) {
    job.documents.photos = [...(job.documents.photos || []), ...photos];
  }
  if (signature) {
    job.documents.signature = signature;
  }
  if (billOfLading) {
    job.documents.billOfLading = billOfLading;
  }
  if (proofOfDelivery) {
    job.documents.proofOfDelivery = proofOfDelivery;
  }
  if (damageReport) {
    job.documents.damageReport = damageReport;
  }

  job.updatedAt = new Date();
  job.lastUpdatedBy = req.user.id;

  res.json({
    success: true,
    data: job,
    message: 'Documents uploaded successfully'
  } as ApiResponse<Job>);
});

// Get job metrics
router.get('/metrics/overview', authenticateToken, (req: any, res) => {
  // Calculate metrics from jobs array
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(job => job.tracking.currentStatus === 'completed').length;
  const cancelledJobs = jobs.filter(job => ['cancelled', 'failed'].includes(job.tracking.currentStatus)).length;
  
  const completedJobsWithTimes = jobs.filter(job => 
    job.tracking.currentStatus === 'completed' && 
    job.tracking.actualPickupTime && 
    job.tracking.actualDeliveryTime
  );
  
  const averageCompletionTime = completedJobsWithTimes.length > 0 
    ? completedJobsWithTimes.reduce((sum, job) => {
        const duration = job.tracking.actualDeliveryTime!.getTime() - job.tracking.actualPickupTime!.getTime();
        return sum + (duration / (1000 * 60)); // Convert to minutes
      }, 0) / completedJobsWithTimes.length
    : 0;

  const onTimeJobs = completedJobsWithTimes.filter(job => 
    job.tracking.actualDeliveryTime! <= job.deliveryTimeWindow.latest
  ).length;
  
  const onTimeDeliveryRate = completedJobsWithTimes.length > 0 
    ? (onTimeJobs / completedJobsWithTimes.length) * 100 
    : 0;

  const totalRevenue = jobs
    .filter(job => job.tracking.currentStatus === 'completed')
    .reduce((sum, job) => sum + job.pricing.totalRate, 0);

  const averageJobValue = completedJobs > 0 ? totalRevenue / completedJobs : 0;

  const metrics = {
    totalJobs,
    completedJobs,
    cancelledJobs,
    averageCompletionTime: Math.round(averageCompletionTime),
    onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 100) / 100,
    averageRating: 4.7, // Mock rating
    totalRevenue,
    averageJobValue: Math.round(averageJobValue * 100) / 100
  };

  res.json({
    success: true,
    data: metrics
  } as ApiResponse);
});

export { router as jobRoutes };