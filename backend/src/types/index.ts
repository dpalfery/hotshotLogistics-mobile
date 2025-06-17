export interface User {
  id: string;
  email: string;
  password: string;
  role: 'driver' | 'admin' | 'dispatcher';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: Date;
  vehicleType: string;
  vehicleCapacity: number;
  rating: number;
  totalJobs: number;
  totalEarnings: number;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupCity: string;
  deliveryCity: string;
  pickupCoordinates: {
    latitude: number;
    longitude: number;
  };
  deliveryCoordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  estimatedDuration: number;
  rate: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  cargoType: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  pickupTime: Date;
  deliveryTime: Date;
  status: 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  driverId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  specialInstructions?: string;
  photos?: string[];
  signature?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  billingAddress?: string;
  paymentMethods: PaymentMethod[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  customerId: string;
  type: 'credit_card' | 'bank_account';
  last4: string;
  brand?: string;
  isDefault: boolean;
  stripePaymentMethodId: string;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  jobId: string;
  customerId: string;
  amount: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  stripeInvoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'job_assigned' | 'job_completed' | 'payment_received' | 'system_alert';
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}