import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProblemDetails } from '../types/api';

/**
 * API Client for Hotshot Logistics API
 * Handles authentication, token management, and HTTP requests
 */

const TOKEN_KEY = '@hotshot_auth_token';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.hotshotlogistics.com';

export interface ApiResponse<T = any> {
  data?: T;
  error?: ProblemDetails | string;
  status: number;
  ok: boolean;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private tokenPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.initializeToken();
  }

  /**
   * Initialize token from AsyncStorage
   */
  private async initializeToken(): Promise<void> {
    try {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  /**
   * Get the current auth token
   */
  private async getToken(): Promise<string | null> {
    if (this.token) {
      return this.token;
    }

    // If token is being loaded, wait for it
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    // Load token from storage
    this.tokenPromise = AsyncStorage.getItem(TOKEN_KEY);
    this.token = await this.tokenPromise;
    this.tokenPromise = null;

    return this.token;
  }

  /**
   * Set the authentication token
   */
  async setToken(token: string | null): Promise<void> {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }

  /**
   * Clear the authentication token
   */
  async clearToken(): Promise<void> {
    await this.setToken(null);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  /**
   * Build headers for API requests
   */
  private async buildHeaders(customHeaders?: Record<string, string>): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };

    const token = await this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Parse response body
   */
  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: any;
    let error: ProblemDetails | string | undefined;

    try {
      if (contentType?.includes('application/json')) {
        const json = await response.json();

        if (response.ok) {
          data = json;
        } else {
          // API returned an error with JSON body (likely ProblemDetails)
          error = json;
        }
      } else {
        const text = await response.text();

        if (response.ok && text) {
          // Try to parse as JSON even if content-type is wrong
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        } else {
          error = text || response.statusText;
        }
      }
    } catch (parseError) {
      error = 'Failed to parse response';
      console.error('Response parse error:', parseError);
    }

    return {
      data,
      error,
      status: response.status,
      ok: response.ok,
    };
  }

  /**
   * Make an HTTP request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 2
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = await this.buildHeaders(options.headers as Record<string, string>);

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - clear token
      if (response.status === 401) {
        await this.clearToken();
      }

      return await this.parseResponse<T>(response);
    } catch (error: any) {
      // Network error - retry if retries available
      if (retries > 0 && this.isNetworkError(error)) {
        console.log(`Network error, retrying... (${retries} retries left)`);
        await this.delay(1000); // Wait 1 second before retry
        return this.request<T>(endpoint, options, retries - 1);
      }

      // Return error response
      return {
        error: error.message || 'Network request failed',
        status: 0,
        ok: false,
      };
    }
  }

  /**
   * Check if error is a network error (vs HTTP error)
   */
  private isNetworkError(error: any): boolean {
    return (
      error.name === 'TypeError' ||
      error.message?.includes('Network request failed') ||
      error.message?.includes('Failed to fetch')
    );
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;

    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, String(value)])
      ).toString();

      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }

    return this.request<T>(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T>(
    endpoint: string,
    file: { uri: string; name: string; type: string },
    additionalData?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();

    // Add file
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    // Add additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const token = await this.getToken();
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'POST',
        headers,
        body: formData,
      });

      return await this.parseResponse<T>(response);
    } catch (error: any) {
      return {
        error: error.message || 'Upload failed',
        status: 0,
        ok: false,
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or multiple instances
export default ApiClient;
