import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket {
  userId: string;
  role: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      (socket as any).userId = decoded.id;
      (socket as any).role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const authenticatedSocket = socket as any;
    console.log(`User ${authenticatedSocket.userId} connected`);

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
      if (authenticatedSocket.role === 'driver') {
        // Broadcast location to admins
        socket.to('admins').emit('driver_location_update', {
          driverId: authenticatedSocket.userId,
          location: data.location,
          timestamp: new Date()
        });
      }
    });

    // Handle job status updates
    socket.on('job_status_update', (data) => {
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
      if (authenticatedSocket.role === 'admin') {
        // Notify all available drivers
        socket.to('drivers').emit('new_job_notification', {
          jobId: data.jobId,
          title: data.title,
          location: data.location,
          rate: data.rate,
          priority: data.priority
        });
      }
    });

    // Handle emergency alerts
    socket.on('emergency_alert', (data) => {
      if (authenticatedSocket.role === 'driver') {
        // Immediately notify all admins
        socket.to('admins').emit('driver_emergency', {
          driverId: authenticatedSocket.userId,
          location: data.location,
          message: data.message,
          timestamp: new Date()
        });
      }
    });

    // Handle chat messages (driver-admin communication)
    socket.on('send_message', (data) => {
      const targetRoom = data.targetUserId ? `user_${data.targetUserId}` : 'admins';
      socket.to(targetRoom).emit('new_message', {
        from: authenticatedSocket.userId,
        message: data.message,
        timestamp: new Date(),
        jobId: data.jobId
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${authenticatedSocket.userId} disconnected`);
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