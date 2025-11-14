import { apiClient, ApiResponse } from './apiClient';
import {
  StartTrackingRequest,
  UpdateLocationRequest,
  LocationTracking,
  RouteDeviationRequest,
  RouteDeviationResult,
  PublicTrackingInfo,
  TrackingResult,
} from '../types/api';

/**
 * Tracking Service
 * Handles all tracking-related API calls
 */

export class TrackingService {
  /**
   * Start tracking for a job and driver
   */
  async startTracking(request: StartTrackingRequest): Promise<ApiResponse<TrackingResult>> {
    return apiClient.post<TrackingResult>('/api/Tracking/start', request);
  }

  /**
   * Stop tracking for a job
   */
  async stopTracking(jobId: string): Promise<ApiResponse<TrackingResult>> {
    return apiClient.post<TrackingResult>(`/api/Tracking/stop/${jobId}`);
  }

  /**
   * Update location for a job and driver
   */
  async updateLocation(request: UpdateLocationRequest): Promise<ApiResponse<LocationTracking>> {
    return apiClient.post<LocationTracking>('/api/Tracking/location', request);
  }

  /**
   * Get current location for a job
   */
  async getLocation(jobId: string): Promise<ApiResponse<LocationTracking>> {
    return apiClient.get<LocationTracking>(`/api/Tracking/location/${jobId}`);
  }

  /**
   * Get location history for a job
   */
  async getLocationHistory(
    jobId: string,
    startTime?: string,
    endTime?: string
  ): Promise<ApiResponse<LocationTracking[]>> {
    const params: Record<string, string> = {};
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    return apiClient.get<LocationTracking[]>(`/api/Tracking/history/${jobId}`, params);
  }

  /**
   * Check if driver has deviated from route
   */
  async checkDeviation(request: RouteDeviationRequest): Promise<ApiResponse<RouteDeviationResult>> {
    return apiClient.post<RouteDeviationResult>('/api/Tracking/check-deviation', request);
  }

  /**
   * Get public tracking info (for customer access)
   */
  async getPublicTracking(jobId: string): Promise<ApiResponse<PublicTrackingInfo>> {
    return apiClient.get<PublicTrackingInfo>(`/api/Tracking/public/${jobId}`);
  }
}

// Export singleton instance
export const trackingService = new TrackingService();
