import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ApiResponse, PaginatedResponse, Invoice } from '../types';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

// Mock database
const invoices: Invoice[] = [
  {
    id: 'inv_1',
    jobId: 'job_1',
    customerId: 'customer_1',
    amount: 450,
    tax: 36,
    total: 486,
    status: 'paid',
    dueDate: new Date('2024-01-20'),
    paidAt: new Date('2024-01-18'),
    stripeInvoiceId: 'in_1234567890',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18')
  }
];

// Get all invoices
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'paid', 'overdue', 'cancelled']),
  query('customerId').optional().isString()
], authenticateToken, requireAdmin, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status;
  const customerId = req.query.customerId;

  let filteredInvoices = [...invoices];

  // Apply filters
  if (status) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status);
  }
  if (customerId) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.customerId === customerId);
  }

  // Pagination
  const total = filteredInvoices.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedInvoices,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  } as PaginatedResponse<Invoice>);
});

// Get invoice by ID
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
  const invoice = invoices.find(inv => inv.id === req.params.id);
  
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  res.json({
    success: true,
    data: invoice
  } as ApiResponse<Invoice>);
});

// Create invoice for job
router.post('/', [
  body('jobId').notEmpty().trim(),
  body('customerId').notEmpty().trim(),
  body('amount').isFloat({ min: 0 }),
  body('tax').optional().isFloat({ min: 0 }),
  body('dueDate').isISO8601()
], authenticateToken, requireAdmin, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const { jobId, customerId, amount, tax = 0, dueDate } = req.body;
  const total = amount + tax;

  const newInvoice: Invoice = {
    id: `inv_${Date.now()}`,
    jobId,
    customerId,
    amount,
    tax,
    total,
    status: 'pending',
    dueDate: new Date(dueDate),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  invoices.push(newInvoice);

  res.status(201).json({
    success: true,
    data: newInvoice,
    message: 'Invoice created successfully'
  } as ApiResponse<Invoice>);
});

// Update invoice status
router.patch('/:id/status', [
  body('status').isIn(['pending', 'paid', 'overdue', 'cancelled'])
], authenticateToken, requireAdmin, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const invoice = invoices.find(inv => inv.id === req.params.id);
  
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  const { status } = req.body;
  invoice.status = status;
  invoice.updatedAt = new Date();

  if (status === 'paid') {
    invoice.paidAt = new Date();
  }

  res.json({
    success: true,
    data: invoice,
    message: 'Invoice status updated successfully'
  } as ApiResponse<Invoice>);
});

// Process payment (Stripe integration)
router.post('/:id/pay', [
  body('paymentMethodId').notEmpty().trim()
], authenticateToken, requireAdmin, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
  }

  const invoice = invoices.find(inv => inv.id === req.params.id);
  
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  if (invoice.status === 'paid') {
    return res.status(400).json({
      success: false,
      error: 'Invoice is already paid'
    } as ApiResponse);
  }

  // Mock Stripe payment processing
  // In real implementation, you would use Stripe API here
  const { paymentMethodId } = req.body;

  // Simulate payment processing
  invoice.status = 'paid';
  invoice.paidAt = new Date();
  invoice.stripeInvoiceId = `in_${Date.now()}`;
  invoice.updatedAt = new Date();

  res.json({
    success: true,
    data: {
      invoice,
      paymentIntent: {
        id: `pi_${Date.now()}`,
        status: 'succeeded',
        amount: invoice.total * 100, // Stripe uses cents
        currency: 'usd'
      }
    },
    message: 'Payment processed successfully'
  } as ApiResponse);
});

// Get billing statistics
router.get('/stats/overview', authenticateToken, requireAdmin, (req, res) => {
  // Mock billing statistics
  const stats = {
    totalRevenue: 487650,
    pendingAmount: 12450,
    overdueAmount: 3200,
    thisMonthRevenue: 45230,
    invoiceCount: {
      total: invoices.length,
      pending: invoices.filter(inv => inv.status === 'pending').length,
      paid: invoices.filter(inv => inv.status === 'paid').length,
      overdue: invoices.filter(inv => inv.status === 'overdue').length
    },
    averageInvoiceValue: 387,
    paymentMethods: {
      credit_card: 85,
      bank_account: 15
    }
  };

  res.json({
    success: true,
    data: stats
  } as ApiResponse);
});

export { router as billingRoutes };