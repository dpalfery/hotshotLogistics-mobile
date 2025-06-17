import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse, PaginatedResponse, Notification } from '../types';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

// Mock database
const notifications: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_1',
    type: 'job_assigned',
    title: 'New Job Assigned',
    message: 'You have been assigned a new delivery job: Electronics Delivery - Austin to Dallas',
    isRead: false,
    data: { jobId: 'job_1' },
    createdAt: new Date('2024-01-15T10:30:00Z')
  }
];

// Get user notifications
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('isRead').optional().isBoolean(),
  query('type').optional().isIn(['job_assigned', 'job_completed', 'payment_received', 'system_alert'])
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
  const limit = parseInt(req.query.limit) || 20;
  const isRead = req.query.isRead;
  const type = req.query.type;

  let userNotifications = notifications.filter(notif => notif.userId === req.user.id);

  // Apply filters
  if (isRead !== undefined) {
    userNotifications = userNotifications.filter(notif => 
      notif.isRead === (isRead === 'true')
    );
  }
  if (type) {
    userNotifications = userNotifications.filter(notif => notif.type === type);
  }

  // Sort by creation date (newest first)
  userNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Pagination
  const total = userNotifications.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedNotifications = userNotifications.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedNotifications,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  } as PaginatedResponse<Notification>);
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, (req: any, res) => {
  const notification = notifications.find(notif => 
    notif.id === req.params.id && notif.userId === req.user.id
  );
  
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  notification.isRead = true;

  res.json({
    success: true,
    data: notification,
    message: 'Notification marked as read'
  } as ApiResponse<Notification>);
});

// Mark all notifications as read
router.patch('/read-all', authenticateToken, (req: any, res) => {
  const userNotifications = notifications.filter(notif => 
    notif.userId === req.user.id && !notif.isRead
  );

  userNotifications.forEach(notif => {
    notif.isRead = true;
  });

  res.json({
    success: true,
    data: { updatedCount: userNotifications.length },
    message: 'All notifications marked as read'
  } as ApiResponse);
});

// Create notification (internal use)
router.post('/', [
  body('userId').notEmpty().trim(),
  body('type').isIn(['job_assigned', 'job_completed', 'payment_received', 'system_alert']),
  body('title').notEmpty().trim(),
  body('message').notEmpty().trim(),
  body('data').optional().isObject()
], authenticateToken, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const { userId, type, title, message, data } = req.body;

  const newNotification: Notification = {
    id: `notif_${Date.now()}`,
    userId,
    type,
    title,
    message,
    isRead: false,
    data,
    createdAt: new Date()
  };

  notifications.push(newNotification);

  // In real implementation, you would also send push notification here
  // using services like Firebase Cloud Messaging or Apple Push Notification Service

  res.status(201).json({
    success: true,
    data: newNotification,
    message: 'Notification created successfully'
  } as ApiResponse<Notification>);
});

// Get notification count
router.get('/count', authenticateToken, (req: any, res) => {
  const userNotifications = notifications.filter(notif => notif.userId === req.user.id);
  const unreadCount = userNotifications.filter(notif => !notif.isRead).length;

  res.json({
    success: true,
    data: {
      total: userNotifications.length,
      unread: unreadCount,
      read: userNotifications.length - unreadCount
    }
  } as ApiResponse);
});

export { router as notificationRoutes };