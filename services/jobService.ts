import { apiClient, ApiResponse } from './apiClient';
import {
  Job,
  JobPagedResult,
  JobQueryParams,
  JobStatusSummaryDto,
  AssignDriverRequest,
  UpdateJobStatusRequest,
} from '../types/api';

/**
 * Job Service
 * Handles all job-related API calls
 */

export class JobService {
  /**
   * Get all jobs with optional filtering and pagination
   */
  async getJobs(params?: JobQueryParams): Promise<ApiResponse<JobPagedResult>> {
    return apiClient.get<JobPagedResult>('/api/Job', params as any);
  }

  /**
   * Get a job by ID
   */
  async getJobById(id: string): Promise<ApiResponse<Job>> {
    return apiClient.get<Job>(`/api/Job/${id}`);
  }

  /**
   * Create a new job
   */
  async createJob(job: Job): Promise<ApiResponse<Job>> {
    return apiClient.post<Job>('/api/Job', job);
  }

  /**
   * Update an existing job
   */
  async updateJob(id: string, job: Job): Promise<ApiResponse<Job>> {
    return apiClient.put<Job>(`/api/Job/${id}`, job);
  }

  /**
   * Delete a job
   */
  async deleteJob(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/Job/${id}`);
  }

  /**
   * Assign a driver to a job
   */
  async assignDriver(id: string, request: AssignDriverRequest): Promise<ApiResponse<Job>> {
    return apiClient.post<Job>(`/api/Job/${id}/assign-driver`, request);
  }

  /**
   * Update job status
   */
  async updateJobStatus(id: string, request: UpdateJobStatusRequest): Promise<ApiResponse<Job>> {
    return apiClient.put<Job>(`/api/Job/${id}/status`, request);
  }

  /**
   * Get jobs by status
   */
  async getJobsByStatus(status: number): Promise<ApiResponse<Job[]>> {
    return apiClient.get<Job[]>(`/api/Job/by-status/${status}`);
  }

  /**
   * Get jobs by driver ID
   */
  async getJobsByDriver(driverId: number): Promise<ApiResponse<Job[]>> {
    return apiClient.get<Job[]>(`/api/Job/by-driver/${driverId}`);
  }

  /**
   * Get jobs by customer ID
   */
  async getJobsByCustomer(customerId: string): Promise<ApiResponse<Job[]>> {
    return apiClient.get<Job[]>(`/api/Job/by-customer/${customerId}`);
  }

  /**
   * Get overdue jobs
   */
  async getOverdueJobs(): Promise<ApiResponse<Job[]>> {
    return apiClient.get<Job[]>('/api/Job/overdue');
  }

  /**
   * Get job status summary
   */
  async getJobStatusSummary(): Promise<ApiResponse<JobStatusSummaryDto>> {
    return apiClient.get<JobStatusSummaryDto>('/api/Job/status-summary');
  }
}

// Export singleton instance
export const jobService = new JobService();
