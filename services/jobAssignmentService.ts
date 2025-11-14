import { apiClient, ApiResponse } from './apiClient';
import {
  JobAssignmentDto,
  AssignJobRequest,
  JobAssignmentStatus,
} from '../types/api';

/**
 * Job Assignment Service
 * Handles all job assignment-related API calls
 */

export class JobAssignmentService {
  /**
   * Get all job assignments
   */
  async getAssignments(): Promise<ApiResponse<JobAssignmentDto[]>> {
    return apiClient.get<JobAssignmentDto[]>('/api/JobAssignments');
  }

  /**
   * Get a job assignment by ID
   */
  async getAssignmentById(id: string): Promise<ApiResponse<JobAssignmentDto>> {
    return apiClient.get<JobAssignmentDto>(`/api/JobAssignments/${id}`);
  }

  /**
   * Assign a job to a driver
   */
  async assignJob(request: AssignJobRequest): Promise<ApiResponse<JobAssignmentDto>> {
    return apiClient.post<JobAssignmentDto>('/api/JobAssignments', request);
  }

  /**
   * Unassign a job from a driver
   */
  async unassignJob(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/JobAssignments/${id}`);
  }

  /**
   * Get job assignments by driver ID
   */
  async getAssignmentsByDriver(driverId: number): Promise<ApiResponse<JobAssignmentDto[]>> {
    return apiClient.get<JobAssignmentDto[]>(`/api/JobAssignments/driver/${driverId}`);
  }

  /**
   * Get job assignments by job ID
   */
  async getAssignmentsByJob(jobId: string): Promise<ApiResponse<JobAssignmentDto[]>> {
    return apiClient.get<JobAssignmentDto[]>(`/api/JobAssignments/job/${jobId}`);
  }

  /**
   * Get active job assignments
   */
  async getActiveAssignments(): Promise<ApiResponse<JobAssignmentDto[]>> {
    return apiClient.get<JobAssignmentDto[]>('/api/JobAssignments/active');
  }

  /**
   * Update job assignment status
   */
  async updateAssignmentStatus(id: string, status: JobAssignmentStatus): Promise<ApiResponse<JobAssignmentDto>> {
    return apiClient.put<JobAssignmentDto>(`/api/JobAssignments/${id}/status`, status);
  }
}

// Export singleton instance
export const jobAssignmentService = new JobAssignmentService();
