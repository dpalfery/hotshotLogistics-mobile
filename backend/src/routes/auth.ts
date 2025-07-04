import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../types';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Mock database - replace with actual database
const users: any[] = [];
const drivers: any[] = [];

// Register endpoint
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  body('role').isIn(['driver', 'admin', 'dispatcher']),
  body('firstName').notEmpty().trim().escape(),
  body('lastName').notEmpty().trim().escape()
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const { email, password, role, firstName, lastName, phone, licenseNumber, vehicleType } = req.body;

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User already exists'
    } as ApiResponse);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = {
    id: `user_${Date.now()}`,
    email,
    password: hashedPassword,
    role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  users.push(user);

  // Create driver profile if role is driver
  if (role === 'driver') {
    const driver = {
      id: `driver_${Date.now()}`,
      userId: user.id,
      firstName,
      lastName,
      phone: phone || '',
      licenseNumber: licenseNumber || '',
      licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      vehicleType: vehicleType || 'Van',
      vehicleCapacity: 1000,
      rating: 5.0,
      totalJobs: 0,
      totalEarnings: 0,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    drivers.push(driver);
  }

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error'
    } as ApiResponse);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    },
    message: 'User registered successfully'
  } as ApiResponse);
});

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const { email, password } = req.body;

  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    } as ApiResponse);
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    } as ApiResponse);
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      error: 'Account is deactivated'
    } as ApiResponse);
  }

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error'
    } as ApiResponse);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    },
    message: 'Login successful'
  } as ApiResponse);
});

// Get current user profile
router.get('/me', authenticateToken, (req: any, res: any) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
  }

  let profile = {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  };

  // Add driver details if user is a driver
  if (user.role === 'driver') {
    const driver = drivers.find(d => d.userId === user.id);
    if (driver) {
      profile = { ...profile, ...driver };
    }
  }

  res.json({
    success: true,
    data: profile
  } as ApiResponse);
});

// Refresh token endpoint
router.post('/refresh', authenticateToken, (req: any, res: any) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error'
    } as ApiResponse);
  }

  const token = jwt.sign(
    { id: req.user.id, email: req.user.email, role: req.user.role },
    jwtSecret,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    data: { token },
    message: 'Token refreshed successfully'
  } as ApiResponse);
});

export { router as authRoutes };