import { apiClient, ApiResponse } from './apiClient';
import {
  Customer,
  Job,
  Invoice,
  UpdateCreditLimitRequest,
  CreditTerms,
} from '../types/api';

/**
 * Customer Service
 * Handles all customer-related API calls
 */

export class CustomerService {
  /**
   * Get all customers
   */
  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    return apiClient.get<Customer[]>('/api/Customer');
  }

  /**
   * Get a customer by ID
   */
  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    return apiClient.get<Customer>(`/api/Customer/${id}`);
  }

  /**
   * Create a new customer
   */
  async createCustomer(customer: Customer): Promise<ApiResponse<Customer>> {
    return apiClient.post<Customer>('/api/Customer', customer);
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, customer: Customer): Promise<ApiResponse<Customer>> {
    return apiClient.put<Customer>(`/api/Customer/${id}`, customer);
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/Customer/${id}`);
  }

  /**
   * Get active customers
   */
  async getActiveCustomers(): Promise<ApiResponse<Customer[]>> {
    return apiClient.get<Customer[]>('/api/Customer/active');
  }

  /**
   * Get customers with overdue invoices
   */
  async getOverdueCustomers(): Promise<ApiResponse<Customer[]>> {
    return apiClient.get<Customer[]>('/api/Customer/overdue');
  }

  /**
   * Get jobs for a customer
   */
  async getCustomerJobs(id: string): Promise<ApiResponse<Job[]>> {
    return apiClient.get<Job[]>(`/api/Customer/${id}/jobs`);
  }

  /**
   * Get invoices for a customer
   */
  async getCustomerInvoices(id: string): Promise<ApiResponse<Invoice[]>> {
    return apiClient.get<Invoice[]>(`/api/Customer/${id}/invoices`);
  }

  /**
   * Update customer credit limit
   */
  async updateCreditLimit(id: string, request: UpdateCreditLimitRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/api/Customer/${id}/credit-limit`, request);
  }

  /**
   * Update customer credit terms
   */
  async updateCreditTerms(id: string, terms: CreditTerms): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/api/Customer/${id}/credit-terms`, terms);
  }
}

// Export singleton instance
export const customerService = new CustomerService();
