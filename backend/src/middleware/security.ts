import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Security utility functions for resource ownership validation
export const validateResourceOwnership = {
  
  // Check if user owns the resource or is admin
  checkJobAccess: (job: any, userId: string, userRole: string): boolean => {
    // Admins can access all jobs
    if (userRole === 'admin') {
      return true;
    }
    
    // Drivers can only access their assigned jobs or available jobs
    if (userRole === 'driver') {
      return job.driverId === userId || job.tracking.currentStatus === 'available';
    }
    
    return false;
  },

  // Check if user can modify job documents  
  checkJobDocumentAccess: (job: any, userId: string, userRole: string): boolean => {
    // Only assigned driver can upload documents
    if (userRole === 'driver') {
      return job.driverId === userId;
    }
    
    // Admins can view but not modify driver documents
    return userRole === 'admin';
  },

  // Check if user can update job status
  checkJobStatusAccess: (job: any, userId: string, userRole: string): boolean => {
    // Admins can update any job status
    if (userRole === 'admin') {
      return true;
    }
    
    // Drivers can only update status of their assigned jobs
    if (userRole === 'driver') {
      return job.driverId === userId;
    }
    
    return false;
  },

  // Check if user can access driver profile
  checkDriverProfileAccess: (driverId: string, userId: string, userRole: string): boolean => {
    // Users can access their own profile
    if (driverId === userId) {
      return true;
    }
    
    // Admins can access all driver profiles
    return userRole === 'admin';
  }
};

// Middleware for checking resource ownership
export const requireResourceOwnership = (
  resourceType: 'job' | 'driver',
  resourceParam: string = 'id'
) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const resourceId = req.params[resourceParam];
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      } as ApiResponse);
      return;
    }

    // Add resource ownership validation logic here
    // This would typically check against database
    // For now, we'll pass the validation to the route handlers
    
    next();
  };
};

// Input sanitization utilities
export const sanitizeInput = {
  // Sanitize job data input
  sanitizeJobData: (data: any): any => {
    const allowedFields = [
      'title', 'pickupAddress', 'deliveryAddress', 'pickupCity', 'deliveryCity',
      'distance', 'cargoType', 'cargoDescription', 'weight', 'quantity',
      'priority', 'baseRate', 'specialInstructions'
    ];

    const sanitized: any = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        if (typeof data[field] === 'string') {
          sanitized[field] = data[field].trim().substring(0, 1000); // Limit length
        } else {
          sanitized[field] = data[field];
        }
      }
    });

    return sanitized;
  },

  // Sanitize user profile data
  sanitizeUserData: (data: any): any => {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'licenseNumber', 'vehicleType'
    ];

    const sanitized: any = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined && typeof data[field] === 'string') {
        sanitized[field] = data[field].trim().substring(0, 255);
      }
    });

    return sanitized;
  }
};

// Rate limiting for specific operations
export const operationRateLimit = new Map<string, { count: number; resetTime: number }>();

export const checkOperationRateLimit = (
  operationKey: string,
  maxOperations: number = 10,
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const limit = operationRateLimit.get(operationKey);
  
  if (!limit || now > limit.resetTime) {
    operationRateLimit.set(operationKey, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (limit.count >= maxOperations) {
    return false;
  }
  
  limit.count++;
  return true;
};