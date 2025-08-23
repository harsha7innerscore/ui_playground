import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { MicrofrontendConfig } from '../types';

const STATES = {
  CALL_API: 'call_api',
  CALL_REFRESH_TOKEN: 'call_refresh_token',
  API_SUCCESS: 'api_success',
  EXCEPTION_ERROR: 'exception_error',
} as const;

type StateType = typeof STATES[keyof typeof STATES];

interface APICallParams {
  url: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  body?: any;
  headers?: Record<string, string>;
  options?: any;
  client?: AxiosInstance;
  error?: any;
  data?: any;
  status?: number;
}

interface APIResponse {
  success: boolean;
  data?: any;
  errorMessage?: string;
  statusCode?: number;
  message?: string;
}

class HttpService {
  private client: AxiosInstance;
  private baseURL: string = '';
  
  // State machine variables
  private prePrevState: StateType | null = null;
  private prevState: StateType | null = null;
  private currState: StateType | null = null;
  private nextState: StateType = STATES.EXCEPTION_ERROR;

  constructor(config?: MicrofrontendConfig) {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (config) {
      this.setConfig(config);
    }
  }

  public setConfig(config: MicrofrontendConfig): void {
    this.baseURL = config.apiGateway;
    this.client.defaults.baseURL = this.baseURL;
  }

  public setAuthToken(token?: string): void {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  private async handleStateMachine(state: StateType, params: APICallParams): Promise<APIResponse> {
    this.prePrevState = this.prevState;
    this.prevState = this.currState;
    this.currState = state;

    switch (state) {
      case STATES.CALL_API:
        return await this.handleApiCall(params);
      case STATES.CALL_REFRESH_TOKEN:
        return await this.handleRefreshToken(params);
      case STATES.API_SUCCESS:
        return this.handleSuccess(params);
      case STATES.EXCEPTION_ERROR:
        return await this.handleExceptionError(params);
      default:
        throw new Error(`Unknown state: ${state}`);
    }
  }

  private async handleApiCall(params: APICallParams): Promise<APIResponse> {
    try {
      const response = await this.client.request({
        url: params.url,
        method: params.method,
        data: params.body,
        headers: params.headers,
        ...params.options,
      });

      const result = await this.handleAPIResponse(response, params);
      this.nextState = result.nextState;
      params = result.params;
    } catch (error) {
      this.nextState = STATES.EXCEPTION_ERROR;
      params = { ...params, error };
    }

    return this.nextState ? await this.handleStateMachine(this.nextState, params) : { success: false, errorMessage: 'Unknown error' };
  }

  private async handleAPIResponse(response: AxiosResponse, params: APICallParams) {
    if (response?.status >= 200 && response?.status < 300) {
      this.nextState = STATES.API_SUCCESS;
      params = { ...params, data: response.data, status: response.status };
      return { nextState: this.nextState, params };
    } else {
      this.nextState = STATES.EXCEPTION_ERROR;
      return { nextState: this.nextState, params };
    }
  }

  private async handleRefreshToken(params: APICallParams): Promise<APIResponse> {
    const mainParams = params;
    
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      params = { ...mainParams, client: this.client };
      return await this.callApi(params.url, params.method, params.body, params.headers, params.options);
    } catch (error) {
      return {
        success: false,
        errorMessage: 'Session expired. Please login again.',
      };
    }
  }

  private handleSuccess(params: any): APIResponse {
    return {
      success: true,
      data: params.data,
    };
  }

  private async handleExceptionError(params: APICallParams): Promise<APIResponse> {
    const error = params.error;
    
    if (axios.isAxiosError(error)) {
      if (error?.message === 'Network Error') {
        return {
          success: false,
          errorMessage: 'Network Error. Please check your internet connection.',
        };
      }

      if (error?.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            if (this.prePrevState === STATES.CALL_REFRESH_TOKEN) {
              return {
                success: false,
                errorMessage: 'Authentication failed. Please login again.',
                statusCode: status,
              };
            }
            
            const { error: _, ...newParams } = params;
            this.nextState = STATES.CALL_REFRESH_TOKEN;
            return await this.handleStateMachine(this.nextState, newParams);
            
          default:
            return {
              success: false,
              errorMessage: data?.message || 'An error occurred',
              statusCode: status,
            };
        }
      }
    }

    return {
      success: false,
      errorMessage: error?.message || 'Unknown error occurred',
    };
  }

  private async callApi(url: string, method: 'get' | 'post' | 'put' | 'delete' | 'patch', body?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      this.setAuthToken(authToken);
    }

    if (headers) {
      Object.assign(this.client.defaults.headers, headers);
    }

    this.nextState = STATES.CALL_API;
    const params: APICallParams = { url, method, body, options, client: this.client };

    return await this.handleStateMachine(this.nextState, params);
  }

  public async get(url: string, params?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> {
    return this.callApi(url, 'get', { params }, headers, options);
  }

  public async post(url: string, body?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> {
    return this.callApi(url, 'post', body, headers, options);
  }

  public async put(url: string, body?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> {
    return this.callApi(url, 'put', body, headers, options);
  }

  public async delete(url: string, body?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> {
    return this.callApi(url, 'delete', body, headers, options);
  }

  public async patch(url: string, body?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> {
    return this.callApi(url, 'patch', body, headers, options);
  }
}

const getEnvironmentConfig = (): MicrofrontendConfig => {
  const environment = (import.meta.env.VITE_ENVIRONMENT as 'dev' | 'staging' | 'prod') || 'dev';
  
  const configs = {
    dev: {
      apiGateway: import.meta.env.VITE_API_GATEWAY_DEV || '',
      environment: 'dev' as const,
    },
    staging: {
      apiGateway: import.meta.env.VITE_API_GATEWAY_STAGING || '',
      environment: 'staging' as const,
    },
    prod: {
      apiGateway: import.meta.env.VITE_API_GATEWAY_PROD || '',
      environment: 'prod' as const,
    },
  };

  return configs[environment];
};

export const httpService = new HttpService(getEnvironmentConfig());
export default httpService;