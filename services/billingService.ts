import { apiClient, ApiResponse } from './apiClient';
import {
  Invoice,
  ProcessPaymentRequest,
  PaymentResult,
  TaxCalculationRequest,
  TaxCalculationResult,
  AccountsReceivableReport,
} from '../types/api';

/**
 * Billing Service
 * Handles all billing-related API calls
 */

export class BillingService {
  /**
   * Generate an invoice for a completed job
   */
  async generateInvoice(jobId: string): Promise<ApiResponse<Invoice>> {
    return apiClient.post<Invoice>(`/api/Billing/invoices/generate/${jobId}`);
  }

  /**
   * Get an invoice by ID
   */
  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<Invoice>(`/api/Billing/invoices/${id}`);
  }

  /**
   * Get invoices for a customer
   */
  async getCustomerInvoices(customerId: string): Promise<ApiResponse<Invoice[]>> {
    return apiClient.get<Invoice[]>(`/api/Billing/invoices/customer/${customerId}`);
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(): Promise<ApiResponse<Invoice[]>> {
    return apiClient.get<Invoice[]>('/api/Billing/invoices/overdue');
  }

  /**
   * Process a payment for an invoice
   */
  async processPayment(invoiceId: string, request: ProcessPaymentRequest): Promise<ApiResponse<PaymentResult>> {
    return apiClient.post<PaymentResult>(`/api/Billing/invoices/${invoiceId}/payments`, request);
  }

  /**
   * Calculate tax for an amount and location
   */
  async calculateTax(request: TaxCalculationRequest): Promise<ApiResponse<TaxCalculationResult>> {
    return apiClient.post<TaxCalculationResult>('/api/Billing/tax/calculate', request);
  }

  /**
   * Get accounts receivable report
   */
  async getAccountsReceivableReport(): Promise<ApiResponse<AccountsReceivableReport>> {
    return apiClient.get<AccountsReceivableReport>('/api/Billing/reports/accounts-receivable');
  }
}

// Export singleton instance
export const billingService = new BillingService();
