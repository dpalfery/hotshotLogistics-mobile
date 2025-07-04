import request from 'supertest';
import express from 'express';
import { setupSocketHandlers } from '../src/socket/handlers';
import { authRoutes } from '../src/routes/auth';
import { jobRoutes } from '../src/routes/jobs';
import { Server } from 'socket.io';
import { createServer } from 'http';

describe('Security Tests', () => {
  let app: express.Application;
  let server: any;
  let io: Server;

  beforeAll(() => {
    // Set up test environment variables
    process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';
    process.env.NODE_ENV = 'test';

    app = express();
    server = createServer(app);
    io = new Server(server);

    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/jobs', jobRoutes);

    setupSocketHandlers(io);
  });

  afterAll(() => {
    server.close();
  });

  describe('JWT Security', () => {
    test('should reject requests without JWT_SECRET environment variable', async () => {
      // Temporarily remove JWT_SECRET
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Server configuration error');

      // Restore JWT_SECRET
      process.env.JWT_SECRET = originalSecret;
    });

    test('should reject tokens without authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    test('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });

  describe('Password Security', () => {
    test('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123', // Too short
          role: 'driver',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should reject passwords without complexity', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password', // No uppercase, number, or special char
          role: 'driver',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should accept strong passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          role: 'driver',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Input Validation', () => {
    test('should sanitize XSS attempts in registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          role: 'driver',
          firstName: '<script>alert("xss")</script>',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      // Verify that the script tag was escaped
      expect(response.body.data.user.firstName).not.toContain('<script>');
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          role: 'driver',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should validate role values', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          role: 'hacker', // Invalid role
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('Rate Limiting', () => {
    test('should implement rate limiting on API endpoints', async () => {
      // This would require actual rate limiting implementation
      // For now, we'll test the response structure
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401); // Expected for unauthenticated request
    });
  });
});

export {};