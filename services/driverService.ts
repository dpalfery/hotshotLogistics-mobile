import { apiClient, ApiResponse } from './apiClient';
import { DriverDto } from '../types/api';

/**
 * Driver Service
 * Handles all driver-related API calls
 */

export class DriverService {
  /**
   * Get all drivers
   */
  async getDrivers(): Promise<ApiResponse<DriverDto[]>> {
    return apiClient.get<DriverDto[]>('/api/Drivers');
  }

  /**
   * Get a driver by ID
   */
  async getDriverById(id: number): Promise<ApiResponse<DriverDto>> {
    return apiClient.get<DriverDto>(`/api/Drivers/${id}`);
  }

  /**
   * Create a new driver
   */
  async createDriver(driver: DriverDto): Promise<ApiResponse<DriverDto>> {
    return apiClient.post<DriverDto>('/api/Drivers', driver);
  }

  /**
   * Update an existing driver
   */
  async updateDriver(id: number, driver: DriverDto): Promise<ApiResponse<DriverDto>> {
    return apiClient.put<DriverDto>(`/api/Drivers/${id}`, driver);
  }

  /**
   * Delete a driver
   */
  async deleteDriver(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/Drivers/${id}`);
  }
}

// Export singleton instance
export const driverService = new DriverService();
