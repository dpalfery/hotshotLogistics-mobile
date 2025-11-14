import { apiClient, ApiResponse } from './apiClient';
import { UserProfile } from '../types/api';

/**
 * User Profile Service
 * Handles all user profile-related API calls
 */

export class UserProfileService {
  /**
   * Get current user's profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/api/UserProfile/me');
  }

  /**
   * Update current user's profile
   */
  async updateProfile(profile: UserProfile): Promise<ApiResponse<void>> {
    return apiClient.put<void>('/api/UserProfile/me', profile);
  }

  /**
   * Sync current user's profile with local database
   */
  async syncProfile(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/UserProfile/sync');
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService();
