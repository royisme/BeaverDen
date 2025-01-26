import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getBackendUrl, getDeviceInfo } from './electron-utils';
import { User, UserPreferences,AuthenticationResult , DeviceInfo, SessionToken } from '@/types/user';
import { SystemInitializationResult } from '@/types/system';
import { BaseResponse } from '@/types/base-response';
import { ApiVersion } from '@/types/enums';

// 创建一个类型来处理 axios 拦截器的类型转换
declare module 'axios' {
  export interface AxiosInstance {
    get<T = any>(url: string, config?: any): Promise<T>;
    post<T = any>(url: string, data?: any, config?: any): Promise<T>;
    put<T = any>(url: string, data?: any, config?: any): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
    delete<T = any>(url: string, config?: any): Promise<T>;
  }
}


export class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor(url: string = '/api') {
    this.client = axios.create({
      baseURL: `${url}/api/${ApiVersion}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器：添加认证token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器：自动提取 data 字段
    this.client.interceptors.response.use(
      (response: AxiosResponse<BaseResponse<any>>) => {
        const baseResponse = response.data;
        if (baseResponse.status !== 200) {
          return Promise.reject(new Error(baseResponse.message || 'Request failed'));
        }
        return baseResponse.data;
      },
      (error) => {
        if (error.response?.data?.message) {
          return Promise.reject(new Error(error.response.data.message));
        }
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  async login(username: string, password: string): Promise<AuthenticationResult> {
    const deviceInfo = await getDeviceInfo();

    const result = await this.client.post<AuthenticationResult>('/auth/login', {
      username,
      password,
      deviceInfo
    });
    
    if (result.token) {
      this.setAccessToken(result.token.accessToken);
    }
    return result;
  }

  async register(
    username: string,
    password: string,
    email: string,
    preferences: UserPreferences,
  ): Promise<AuthenticationResult> {
    const deviceInfo = await getDeviceInfo();
    const result = await this.client.post<AuthenticationResult>('/auth/register', {
      username,
      password,
      email,
      preferences,
      deviceInfo
    });
    
    if (result.token) {
      this.setAccessToken(result.token.accessToken);
    }
    return result;
  }

  async refreshToken(token: string): Promise<SessionToken> {
    return await this.client.post<SessionToken>('/auth/refresh', { token });
  }

  async verifySession(userId: string, deviceId: string, token: string): Promise<boolean> {
    return await this.client.post<boolean>('/auth/verify', {
      userId,
      deviceId,
      token
    });
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<User> {
    return await this.client.put<User>(`/users/${userId}/preferences`, preferences);
  }

  async initializeSystem(): Promise<SystemInitializationResult> {
    return await this.client.get<SystemInitializationResult>('/system/init');
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

// 创建单例实例
let apiClientInstance: ApiClient | null = null;

export async function getApiClient(): Promise<ApiClient> {
  if (!apiClientInstance) {
    const backendUrl = await getBackendUrl();
    apiClientInstance = new ApiClient(backendUrl);
  }
  // const token = useSessionStore.getState().sessionToken;
  // if (token) {
  //   apiClientInstance.setAccessToken(token.accessToken);
  // }
  return apiClientInstance;
}