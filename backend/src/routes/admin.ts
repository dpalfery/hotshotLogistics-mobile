import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, (req, res) => {
  // Mock dashboard data - would be calculated from actual database
  const dashboardData = {
    overview: {
      totalJobs: 1247,
      activeJobs: 89,
      totalDrivers: 156,
      activeDrivers: 134,
      totalRevenue: 487650,
      monthlyRevenue: 45230
    },
    recentJobs: [
      {
        id: 'job_1',
        title: 'Electronics Delivery',
        status: 'in_progress',
        driver: 'John Martinez',
        route: 'Austin → Dallas',
        value: 450
      },
      {
        id: 'job_2',
        title: 'Medical Supplies',
        status: 'completed',
        driver: 'Sarah Johnson',
        route: 'Houston → San Antonio',
        value: 520
      }
    ],
    topDrivers: [
      {
        id: 'driver_1',
        name: 'John Martinez',
        rating: 4.9,
        totalJobs: 247,
        totalEarnings: 87450
      },
      {
        id: 'driver_2',
        name: 'Sarah Johnson',
        rating: 4.8,
        totalJobs: 198,
        totalEarnings: 72340
      }
    ],
    jobsByStatus: {
      available: 23,
      assigned: 45,
      in_progress: 21,
      completed: 1158
    },
    jobsByPriority: {
      urgent: 12,
      high: 34,
      medium: 67,
      low: 45
    },
    revenueChart: [
      { month: 'Jan', revenue: 42000 },
      { month: 'Feb', revenue: 38500 },
      { month: 'Mar', revenue: 45200 },
      { month: 'Apr', revenue: 41800 },
      { month: 'May', revenue: 47300 },
      { month: 'Jun', revenue: 45230 }
    ]
  };

  res.json({
    success: true,
    data: dashboardData
  } as ApiResponse);
});

// Get system analytics
router.get('/analytics', [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year'])
], authenticateToken, requireAdmin, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const period = req.query.period || 'month';

  // Mock analytics data
  const analyticsData = {
    period,
    metrics: {
      totalJobs: 1247,
      completedJobs: 1158,
      cancelledJobs: 34,
      averageJobValue: 387,
      totalRevenue: 487650,
      driverUtilization: 85.6,
      customerSatisfaction: 4.7,
      onTimeDeliveryRate: 94.2
    },
    trends: {
      jobsGrowth: 12.5,
      revenueGrowth: 8.3,
      driverGrowth: 15.2,
      customerGrowth: 22.1
    },
    topRoutes: [
      { route: 'Austin → Dallas', count: 89, revenue: 38450 },
      { route: 'Houston → San Antonio', count: 76, revenue: 32100 },
      { route: 'Dallas → Fort Worth', count: 65, revenue: 18200 }
    ],
    performanceByCity: [
      { city: 'Austin', jobs: 234, revenue: 89450, avgRating: 4.8 },
      { city: 'Dallas', jobs: 198, revenue: 76230, avgRating: 4.7 },
      { city: 'Houston', jobs: 187, revenue: 71890, avgRating: 4.6 }
    ]
  };

  res.json({
    success: true,
    data: analyticsData
  } as ApiResponse);
});

// Get system health status
router.get('/health', authenticateToken, requireAdmin, (req, res) => {
  const healthData = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'healthy', responseTime: 45 },
      redis: { status: 'healthy', responseTime: 12 },
      storage: { status: 'healthy', responseTime: 23 },
      notifications: { status: 'healthy', responseTime: 67 }
    },
    metrics: {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeConnections: 156,
      requestsPerMinute: 234
    }
  };

  res.json({
    success: true,
    data: healthData
  } as ApiResponse);
});

// Get audit logs
router.get('/audit-logs', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('action').optional().isString(),
  query('userId').optional().isString()
], authenticateToken, requireAdmin, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  // Mock audit logs
  const auditLogs = [
    {
      id: 'log_1',
      action: 'job_created',
      userId: 'admin_1',
      userName: 'Admin User',
      details: 'Created job: Electronics Delivery - Austin to Dallas',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      ipAddress: '192.168.1.100'
    },
    {
      id: 'log_2',
      action: 'driver_registered',
      userId: 'system',
      userName: 'System',
      details: 'New driver registered: John Martinez',
      timestamp: new Date('2024-01-15T09:15:00Z'),
      ipAddress: '192.168.1.101'
    }
  ];

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const total = auditLogs.length;
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: auditLogs,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  } as ApiResponse);
});

export { router as adminRoutes };