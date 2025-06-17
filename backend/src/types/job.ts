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

export interface CreateJobRequest {
  title: string;
  description?: string;
  customerId: string;
  pickupLocation: Omit<Location, 'latitude' | 'longitude'>;
  deliveryLocation: Omit<Location, 'latitude' | 'longitude'>;
  pickupContactName?: string;
  pickupContactPhone?: string;
  pickupInstructions?: string;
  pickupTimeWindow: {
    earliest: string; // ISO date string
    latest: string;
  };
  deliveryContactName?: string;
  deliveryContactPhone?: string;
  deliveryInstructions?: string;
  deliveryTimeWindow: {
    earliest: string;
    latest: string;
  };
  cargoType: CargoType;
  cargoDescription: string;
  weight: number;
  dimensions?: JobDimensions;
  quantity: number;
  value?: number;
  requirements: JobRequirements;
  priority: JobPriority;
  baseRate: number;
  specialInstructions?: string;
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  pickupInstructions?: string;
  deliveryInstructions?: string;
  cargoDescription?: string;
  weight?: number;
  dimensions?: JobDimensions;
  quantity?: number;
  value?: number;
  requirements?: JobRequirements;
  priority?: JobPriority;
  baseRate?: number;
  specialInstructions?: string;
  internalNotes?: string;
}

export interface JobSearchFilters {
  status?: JobStatus[];
  priority?: JobPriority[];
  cargoType?: CargoType[];
  customerId?: string;
  driverId?: string;
  pickupCity?: string;
  deliveryCity?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minRate?: number;
  maxRate?: number;
  maxDistance?: number;
  requiresSpecialEquipment?: boolean;
}

export interface JobAssignment {
  jobId: string;
  driverId: string;
  vehicleId?: string;
  assignedAt: Date;
  assignedBy: string;
  estimatedPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  notes?: string;
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

export interface JobRoute {
  jobId: string;
  waypoints: Location[];
  totalDistance: number; // miles
  estimatedDuration: number; // minutes
  optimized: boolean;
  createdAt: Date;
}