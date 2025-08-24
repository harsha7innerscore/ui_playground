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

interface HttpState {
  client: AxiosInstance;
  baseURL: string;
  prePrevState: StateType | null;
  prevState: StateType | null;
  currState: StateType | null;
  nextState: StateType;
}

// Create default http state
const createHttpState = (config?: MicrofrontendConfig): HttpState => {
  const client = axios.create({
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const state: HttpState = {
    client,
    baseURL: '',
    prePrevState: null,
    prevState: null,
    currState: null,
    nextState: STATES.EXCEPTION_ERROR,
  };

  if (config) {
    state.baseURL = config.apiGateway;
    state.client.defaults.baseURL = config.apiGateway;
  }

  return state;
};

// Global state instance
let httpState = createHttpState();

const setConfig = (config: MicrofrontendConfig): void => {
  httpState.baseURL = config.apiGateway;
  httpState.client.defaults.baseURL = config.apiGateway;
};

const setAuthToken = (token?: string): void => {
  if (token) {
    httpState.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete httpState.client.defaults.headers.common['Authorization'];
  }
};

const handleStateMachine = async (state: StateType, params: APICallParams): Promise<APIResponse> => {
  httpState.prePrevState = httpState.prevState;
  httpState.prevState = httpState.currState;
  httpState.currState = state;

  switch (state) {
    case STATES.CALL_API:
      return await handleApiCall(params);
    case STATES.CALL_REFRESH_TOKEN:
      return await handleRefreshToken(params);
    case STATES.API_SUCCESS:
      return handleSuccess(params);
    case STATES.EXCEPTION_ERROR:
      return await handleExceptionError(params);
    default:
      throw new Error(`Unknown state: ${state}`);
  }
};

const handleApiCall = async (params: APICallParams): Promise<APIResponse> => {
  try {
    const response = await httpState.client.request({
      url: params.url,
      method: params.method,
      data: params.body,
      headers: params.headers,
      ...params.options,
    });

    const result = await handleAPIResponse(response, params);
    httpState.nextState = result.nextState;
    params = result.params;
  } catch (error) {
    httpState.nextState = STATES.EXCEPTION_ERROR;
    params = { ...params, error };
  }

  return httpState.nextState ? await handleStateMachine(httpState.nextState, params) : { success: false, errorMessage: 'Unknown error' };
};

const handleAPIResponse = async (response: AxiosResponse, params: APICallParams) => {
  if (response?.status >= 200 && response?.status < 300) {
    httpState.nextState = STATES.API_SUCCESS;
    params = { ...params, data: response.data, status: response.status };
    return { nextState: httpState.nextState, params };
  } else {
    httpState.nextState = STATES.EXCEPTION_ERROR;
    return { nextState: httpState.nextState, params };
  }
};

// Comment out refresh token functionality as requested
const handleRefreshToken = async (_params: APICallParams): Promise<APIResponse> => {
  // TODO: Refresh token functionality commented out as per requirements
  // const mainParams = params;
  
  // try {
  //   const refreshToken = localStorage.getItem('refreshToken');
  //   if (!refreshToken) {
  //     throw new Error('No refresh token available');
  //   }

  //   params = { ...mainParams, client: httpState.client };
  //   return await callApi(params.url, params.method, params.body, params.headers, params.options);
  // } catch (error) {
  //   return {
  //     success: false,
  //     errorMessage: 'Session expired. Please login again.',
  //   };
  // }

  return {
    success: false,
    errorMessage: 'Refresh token functionality is currently disabled.',
  };
};

const handleSuccess = (params: any): APIResponse => {
  return {
    success: true,
    data: params.data,
  };
};

const handleExceptionError = async (params: APICallParams): Promise<APIResponse> => {
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
          // Comment out refresh token logic as requested
          // if (httpState.prePrevState === STATES.CALL_REFRESH_TOKEN) {
          //   return {
          //     success: false,
          //     errorMessage: 'Authentication failed. Please login again.',
          //     statusCode: status,
          //   };
          // }
          
          // const { error: _, ...newParams } = params;
          // httpState.nextState = STATES.CALL_REFRESH_TOKEN;
          // return await handleStateMachine(httpState.nextState, newParams);
          
          return {
            success: false,
            errorMessage: 'Authentication failed. Please login again.',
            statusCode: status,
          };
          
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
};

const callApi = async (url: string, method: 'get' | 'post' | 'put' | 'delete' | 'patch', body?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> => {
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    setAuthToken(authToken);
  }

  if (headers) {
    Object.assign(httpState.client.defaults.headers, headers);
  }

  httpState.nextState = STATES.CALL_API;
  const params: APICallParams = { url, method, body, options, client: httpState.client };

  return await handleStateMachine(httpState.nextState, params);
};

const get = async (url: string, params?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> => {
  return callApi(url, 'get', { params }, headers, options);
};

const post = async (url: string, body?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> => {
  return callApi(url, 'post', body, headers, options);
};

const put = async (url: string, body?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> => {
  return callApi(url, 'put', body, headers, options);
};

const deleteRequest = async (url: string, body?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> => {
  return callApi(url, 'delete', body, headers, options);
};

const patch = async (url: string, body?: any, headers?: Record<string, string>, options?: any): Promise<APIResponse> => {
  return callApi(url, 'patch', body, headers, options);
};

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

// Initialize with environment config
setConfig(getEnvironmentConfig());

export const httpService = {
  setConfig,
  setAuthToken,
  get,
  post,
  put,
  delete: deleteRequest,
  patch,
};

export default httpService;