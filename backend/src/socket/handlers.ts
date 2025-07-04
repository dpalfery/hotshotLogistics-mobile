import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import xss from 'xss';

interface AuthenticatedSocket {
  userId: string;
  role: string;
}

// Rate limiting map for socket events
const socketRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_EVENTS_PER_MINUTE = 30;

// Helper function to check rate limits
const checkRateLimit = (socketId: string): boolean => {
  const now = Date.now();
  const limit = socketRateLimit.get(socketId);
  
  if (!limit || now > limit.resetTime) {
    socketRateLimit.set(socketId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= MAX_EVENTS_PER_MINUTE) {
    return false;
  }
  
  limit.count++;
  return true;
};

// Input validation helpers
const validateLocationData = (data: any): boolean => {
  return data && 
         typeof data.latitude === 'number' && 
         typeof data.longitude === 'number' &&
         data.latitude >= -90 && data.latitude <= 90 &&
         data.longitude >= -180 && data.longitude <= 180;
};

const sanitizeMessage = (message: string): string => {
  if (typeof message !== 'string') return '';
  return xss(validator.escape(message.trim()));
};

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return next(new Error('Server configuration error'));
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      (socket as any).userId = decoded.id;
      (socket as any).role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const authenticatedSocket = socket as any;
    
    // Enhanced logging without exposing sensitive data
    console.log(`User connected - Role: ${authenticatedSocket.role}, SocketID: ${socket.id}`);

    // Join user-specific room
    socket.join(`user_${authenticatedSocket.userId}`);

    // Join role-specific rooms
    if (authenticatedSocket.role === 'driver') {
      socket.join('drivers');
    } else if (authenticatedSocket.role === 'admin') {
      socket.join('admins');
    }

    // Handle driver location updates
    socket.on('location_update', (data) => {
      // Rate limiting check
      if (!checkRateLimit(socket.id)) {
        socket.emit('error', { message: 'Rate limit exceeded' });
        return;
      }

      if (authenticatedSocket.role !== 'driver') {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Validate location data
      if (!validateLocationData(data?.location)) {
        socket.emit('error', { message: 'Invalid location data' });
        return;
      }

      // Broadcast location to admins with validated data
      socket.to('admins').emit('driver_location_update', {
        driverId: authenticatedSocket.userId,
        location: {
          latitude: data.location.latitude,
          longitude: data.location.longitude
        },
        timestamp: new Date()
      });
    });

    // Handle job status updates
    socket.on('job_status_update', (data) => {
      // Rate limiting check
      if (!checkRateLimit(socket.id)) {
        socket.emit('error', { message: 'Rate limit exceeded' });
        return;
      }

      // Validate input data
      if (!data?.jobId || typeof data.jobId !== 'string' || !validator.isAlphanumeric(data.jobId.replace(/_/g, ''))) {
        socket.emit('error', { message: 'Invalid job ID' });
        return;
      }

      const validStatuses = ['assigned', 'in_progress', 'completed', 'cancelled'];
      if (!data?.status || !validStatuses.includes(data.status)) {
        socket.emit('error', { message: 'Invalid status' });
        return;
      }

      // Broadcast to all admins and the specific driver
      io.to('admins').emit('job_status_changed', {
        jobId: data.jobId,
        status: data.status,
        driverId: authenticatedSocket.userId,
        timestamp: new Date()
      });
    });

    // Handle new job notifications
    socket.on('new_job_available', (data) => {
      // Rate limiting check
      if (!checkRateLimit(socket.id)) {
        socket.emit('error', { message: 'Rate limit exceeded' });
        return;
      }

      if (authenticatedSocket.role !== 'admin') {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Validate input data
      if (!data?.jobId || typeof data.jobId !== 'string' || !validator.isAlphanumeric(data.jobId.replace(/_/g, ''))) {
        socket.emit('error', { message: 'Invalid job ID' });
        return;
      }

      if (!data?.title || typeof data.title !== 'string') {
        socket.emit('error', { message: 'Invalid job title' });
        return;
      }

      // Notify all available drivers with sanitized data
      socket.to('drivers').emit('new_job_notification', {
        jobId: data.jobId,
        title: sanitizeMessage(data.title),
        location: data.location ? sanitizeMessage(data.location) : '',
        rate: typeof data.rate === 'number' && data.rate > 0 ? data.rate : 0,
        priority: ['low', 'medium', 'high', 'urgent', 'emergency'].includes(data.priority) ? data.priority : 'medium'
      });
    });

    // Handle emergency alerts
    socket.on('emergency_alert', (data) => {
      // Rate limiting check (more restrictive for emergency alerts)
      const emergencyLimit = socketRateLimit.get(`emergency_${socket.id}`);
      const now = Date.now();
      
      if (emergencyLimit && now < emergencyLimit.resetTime && emergencyLimit.count >= 5) {
        socket.emit('error', { message: 'Emergency alert rate limit exceeded' });
        return;
      }
      
      if (!emergencyLimit || now > emergencyLimit.resetTime) {
        socketRateLimit.set(`emergency_${socket.id}`, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      } else {
        emergencyLimit.count++;
      }

      if (authenticatedSocket.role !== 'driver') {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Validate emergency data
      if (!validateLocationData(data?.location)) {
        socket.emit('error', { message: 'Invalid location data for emergency alert' });
        return;
      }

      const message = data?.message ? sanitizeMessage(data.message) : 'Emergency alert';

      // Immediately notify all admins
      socket.to('admins').emit('driver_emergency', {
        driverId: authenticatedSocket.userId,
        location: {
          latitude: data.location.latitude,
          longitude: data.location.longitude
        },
        message: message,
        timestamp: new Date()
      });
    });

    // Handle chat messages (driver-admin communication)
    socket.on('send_message', (data) => {
      // Rate limiting check
      if (!checkRateLimit(socket.id)) {
        socket.emit('error', { message: 'Rate limit exceeded' });
        return;
      }

      // Validate message data
      if (!data?.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
        socket.emit('error', { message: 'Invalid message content' });
        return;
      }

      if (data.message.length > 1000) {
        socket.emit('error', { message: 'Message too long' });
        return;
      }

      // Validate target user ID if provided
      if (data.targetUserId && (!validator.isAlphanumeric(data.targetUserId.replace(/_/g, '')))) {
        socket.emit('error', { message: 'Invalid target user ID' });
        return;
      }

      // Validate job ID if provided
      if (data.jobId && (!validator.isAlphanumeric(data.jobId.replace(/_/g, '')))) {
        socket.emit('error', { message: 'Invalid job ID' });
        return;
      }

      const targetRoom = data.targetUserId ? `user_${data.targetUserId}` : 'admins';
      const sanitizedMessage = sanitizeMessage(data.message);

      socket.to(targetRoom).emit('new_message', {
        from: authenticatedSocket.userId,
        message: sanitizedMessage,
        timestamp: new Date(),
        jobId: data.jobId || null
      });
    });

    socket.on('disconnect', () => {
      // Clean up rate limiting data
      socketRateLimit.delete(socket.id);
      socketRateLimit.delete(`emergency_${socket.id}`);
      
      console.log(`User disconnected - Role: ${authenticatedSocket.role}, SocketID: ${socket.id}`);
    });
  });

  // Helper functions to emit events from API routes
  const emitToUser = (userId: string, event: string, data: any) => {
    io.to(`user_${userId}`).emit(event, data);
  };

  const emitToDrivers = (event: string, data: any) => {
    io.to('drivers').emit(event, data);
  };

  const emitToAdmins = (event: string, data: any) => {
    io.to('admins').emit(event, data);
  };

  // Export helper functions for use in routes
  return {
    emitToUser,
    emitToDrivers,
    emitToAdmins
  };
};