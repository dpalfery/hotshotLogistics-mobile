export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface JobDimensions {
  length: number; // inches
  width: number;  // inches
  height: number; // inches
}

export interface JobRequirements {
  temperatureControlled?: boolean;
  hazardousMaterials?: boolean;
  fragile?: boolean;
  requiresSignature?: boolean;
  requiresId?: boolean;
  specialEquipment?: string[];
}

export interface JobPricing {
  baseRate: number;
  fuelSurcharge?: number;
  urgencyMultiplier?: number;
  distanceRate?: number; // per mile
  totalRate: number;
}

export interface JobTracking {
  currentStatus: JobStatus;
  statusHistory: JobStatusUpdate[];
  estimatedPickupTime?: Date;
  actualPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  currentLocation?: Location;
}

export interface JobStatusUpdate {
  status: JobStatus;
  timestamp: Date;
  location?: Location;
  notes?: string;
  updatedBy: string;
}

export interface JobDocuments {
  photos?: string[]; // URLs to uploaded photos
  signature?: string; // Base64 encoded signature
  billOfLading?: string; // URL to BOL document
  proofOfDelivery?: string; // URL to POD document
  damageReport?: string; // URL to damage report if any
}

export type JobStatus = 
  | 'draft'
  | 'available'
  | 'assigned'
  | 'accepted'
  | 'en_route_pickup'
  | 'arrived_pickup'
  | 'pickup_complete'
  | 'en_route_delivery'
  | 'arrived_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type JobPriority = 'low' | 'medium' | 'high' | 'urgent' | 'emergency';

export type CargoType = 
  | 'general'
  | 'electronics'
  | 'medical'
  | 'automotive'
  | 'construction'
  | 'food'
  | 'chemicals'
  | 'machinery'
  | 'documents'
  | 'other';

export interface Job {
  // Basic Information
  id: string;
  jobNumber: string; // Human-readable job number
  title: string;
  description?: string;
  
  // Customer Information
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCompany?: string;
  
  // Pickup Information
  pickupLocation: Location;
  pickupContactName?: string;
  pickupContactPhone?: string;
  pickupInstructions?: string;
  pickupTimeWindow: {
    earliest: Date;
    latest: Date;
  };
  
  // Delivery Information
  deliveryLocation: Location;
  deliveryContactName?: string;
  deliveryContactPhone?: string;
  deliveryInstructions?: string;
  deliveryTimeWindow: {
    earliest: Date;
    latest: Date;
  };
  
  // Cargo Information
  cargoType: CargoType;
  cargoDescription: string;
  weight: number; // pounds
  dimensions?: JobDimensions;
  quantity: number;
  value?: number; // declared value
  requirements: JobRequirements;
  
  // Job Details
  priority: JobPriority;
  distance: number; // miles
  estimatedDuration: number; // minutes
  pricing: JobPricing;
  
  // Assignment & Tracking
  driverId?: string;
  vehicleId?: string;
  tracking: JobTracking;
  documents: JobDocuments;
  
  // Special Instructions
  specialInstructions?: string;
  internalNotes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
}

// Legacy interface for backward compatibility with existing mobile app
export interface LegacyJob {
  id: string;
  title: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupCity: string;
  deliveryCity: string;
  distance: number; // in miles
  rate: number; // payment amount
  priority: 'low' | 'medium' | 'high' | 'urgent';
  cargoType: string;
  weight: number; // in lbs
  pickupTime: string;
  deliveryTime: string;
  status: 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  customerName: string;
  customerPhone: string;
  specialInstructions?: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalJobs: number;
  totalEarnings: number;
  vehicleType: string;
  licenseNumber: string;
  profileImage?: string;
}

export interface JobSearchFilters {
  status?: JobStatus[];
  priority?: JobPriority[];
  cargoType?: CargoType[];
  maxDistance?: number;
  minRate?: number;
  maxRate?: number;
  requiresSpecialEquipment?: boolean;
}

export interface JobMetrics {
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  averageCompletionTime: number; // minutes
  onTimeDeliveryRate: number; // percentage
  averageRating: number;
  totalRevenue: number;
  averageJobValue: number;
}

// Helper functions to convert between legacy and new job formats
export function convertToLegacyJob(job: Job): LegacyJob {
  return {
    id: job.id,
    title: job.title,
    pickupAddress: job.pickupLocation.address,
    deliveryAddress: job.deliveryLocation.address,
    pickupCity: job.pickupLocation.city,
    deliveryCity: job.deliveryLocation.city,
    distance: job.distance,
    rate: job.pricing.totalRate,
    priority: job.priority === 'emergency' ? 'urgent' : job.priority,
    cargoType: job.cargoType,
    weight: job.weight,
    pickupTime: job.pickupTimeWindow.earliest.toISOString(),
    deliveryTime: job.deliveryTimeWindow.latest.toISOString(),
    status: convertJobStatus(job.tracking.currentStatus),
    customerName: job.customerName,
    customerPhone: job.customerPhone,
    specialInstructions: job.specialInstructions,
    createdAt: job.createdAt.toISOString()
  };
}

function convertJobStatus(status: JobStatus): LegacyJob['status'] {
  switch (status) {
    case 'available':
    case 'draft':
      return 'available';
    case 'assigned':
    case 'accepted':
      return 'assigned';
    case 'en_route_pickup':
    case 'arrived_pickup':
    case 'pickup_complete':
    case 'en_route_delivery':
    case 'arrived_delivery':
      return 'in_progress';
    case 'delivered':
    case 'completed':
      return 'completed';
    case 'cancelled':
    case 'failed':
      return 'cancelled';
    default:
      return 'available';
  }
}