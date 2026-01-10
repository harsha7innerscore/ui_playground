import { APIRequestContext, Page, expect } from '@playwright/test';

/**
 * API Helper utilities for interacting with backend services
 * Provides methods for common API operations used in tests
 */

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers: Record<string, string>;
  success: boolean;
}

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export class ApiHelper {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(
    private request: APIRequestContext,
    baseUrl?: string
  ) {
    this.baseUrl = baseUrl || process.env.API_BASE_URL || 'http://localhost:3000/api';
    this.defaultTimeout = 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Set authentication token for subsequent requests
   * @param token Bearer token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authentication token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Set default headers for all requests
   * @param headers Headers to set
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Perform GET request
   * @param endpoint API endpoint
   * @param options Request options
   * @returns API response
   */
  async get<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...options.headers };

    const response = await this.request.get(url, {
      headers,
      timeout: options.timeout || this.defaultTimeout
    });

    return this.processResponse<T>(response);
  }

  /**
   * Perform POST request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Request options
   * @returns API response
   */
  async post<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...options.headers };

    const response = await this.request.post(url, {
      headers,
      data,
      timeout: options.timeout || this.defaultTimeout
    });

    return this.processResponse<T>(response);
  }

  /**
   * Perform PUT request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Request options
   * @returns API response
   */
  async put<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...options.headers };

    const response = await this.request.put(url, {
      headers,
      data,
      timeout: options.timeout || this.defaultTimeout
    });

    return this.processResponse<T>(response);
  }

  /**
   * Perform PATCH request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Request options
   * @returns API response
   */
  async patch<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...options.headers };

    const response = await this.request.patch(url, {
      headers,
      data,
      timeout: options.timeout || this.defaultTimeout
    });

    return this.processResponse<T>(response);
  }

  /**
   * Perform DELETE request
   * @param endpoint API endpoint
   * @param options Request options
   * @returns API response
   */
  async delete<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...options.headers };

    const response = await this.request.delete(url, {
      headers,
      timeout: options.timeout || this.defaultTimeout
    });

    return this.processResponse<T>(response);
  }

  /**
   * Upload file via POST request
   * @param endpoint API endpoint
   * @param filePath Path to file
   * @param fieldName Form field name for file
   * @param additionalData Additional form data
   * @param options Request options
   * @returns API response
   */
  async uploadFile<T = any>(
    endpoint: string,
    filePath: string,
    fieldName = 'file',
    additionalData: Record<string, string> = {},
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...options.headers };

    // Remove Content-Type header to let Playwright set it for multipart/form-data
    delete headers['Content-Type'];

    const formData = { ...additionalData };
    formData[fieldName] = filePath;

    const response = await this.request.post(url, {
      headers,
      multipart: formData,
      timeout: options.timeout || this.defaultTimeout
    });

    return this.processResponse<T>(response);
  }

  /**
   * Check API health/status
   * @returns True if API is healthy
   */
  async isApiHealthy(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success && response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Wait for API to be available
   * @param maxAttempts Maximum number of attempts
   * @param delayMs Delay between attempts
   * @returns True if API becomes available
   */
  async waitForApi(maxAttempts = 10, delayMs = 2000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const isHealthy = await this.isApiHealthy();

      if (isHealthy) {
        return true;
      }

      if (attempt < maxAttempts) {
        await this.delay(delayMs);
      }
    }

    return false;
  }

  /**
   * Build full URL from endpoint
   * @param endpoint API endpoint
   * @returns Full URL
   */
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  /**
   * Process API response and extract data
   * @param response Playwright API response
   * @returns Processed API response
   */
  private async processResponse<T>(response: any): Promise<ApiResponse<T>> {
    const status = response.status();
    let data: T;

    try {
      data = await response.json();
    } catch {
      // If response is not JSON, get as text
      data = await response.text() as T;
    }

    const headers: Record<string, string> = {};
    const responseHeaders = response.headers();
    Object.keys(responseHeaders).forEach(key => {
      headers[key] = responseHeaders[key];
    });

    return {
      status,
      data,
      headers,
      success: status >= 200 && status < 300
    };
  }

  /**
   * Delay execution
   * @param ms Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * User management API utilities
 */
export class UserApiHelper extends ApiHelper {
  /**
   * Create a new user
   * @param userData User data
   * @returns Created user data
   */
  async createUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<ApiResponse> {
    return await this.post('/users', userData);
  }

  /**
   * Get user by ID
   * @param userId User ID
   * @returns User data
   */
  async getUserById(userId: string): Promise<ApiResponse> {
    return await this.get(`/users/${userId}`);
  }

  /**
   * Update user
   * @param userId User ID
   * @param userData Updated user data
   * @returns Updated user data
   */
  async updateUser(userId: string, userData: any): Promise<ApiResponse> {
    return await this.put(`/users/${userId}`, userData);
  }

  /**
   * Delete user
   * @param userId User ID
   * @returns Deletion confirmation
   */
  async deleteUser(userId: string): Promise<ApiResponse> {
    return await this.delete(`/users/${userId}`);
  }

  /**
   * Get all users
   * @param params Query parameters
   * @returns List of users
   */
  async getAllUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
  } = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params as any).toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return await this.get(endpoint);
  }
}

/**
 * Authentication API utilities
 */
export class AuthApiHelper extends ApiHelper {
  /**
   * Login user and get authentication token
   * @param credentials Login credentials
   * @returns Authentication response with token
   */
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.post('/auth/login', credentials);

    if (response.success && response.data.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  /**
   * Refresh authentication token
   * @param refreshToken Refresh token
   * @returns New authentication token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    return await this.post('/auth/refresh', { refresh_token: refreshToken });
  }

  /**
   * Logout user
   * @returns Logout confirmation
   */
  async logout(): Promise<ApiResponse> {
    const response = await this.post('/auth/logout');
    this.clearAuthToken();
    return response;
  }

  /**
   * Verify authentication token
   * @returns Token verification response
   */
  async verifyToken(): Promise<ApiResponse> {
    return await this.get('/auth/verify');
  }
}

/**
 * Factory function to create API helpers with page context
 * @param page Playwright page object
 * @returns Object with API helper instances
 */
export function createApiHelpers(page: Page) {
  const request = page.request;

  return {
    api: new ApiHelper(request),
    userApi: new UserApiHelper(request),
    authApi: new AuthApiHelper(request)
  };
}