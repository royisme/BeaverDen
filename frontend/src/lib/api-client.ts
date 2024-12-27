import axios, { AxiosInstance } from 'axios';
import { getBackendUrl, getDeviceInfo } from './electron-utils';
import { User, AuthenticationResult, UserPreferences, DeviceInfo } from '@/types/user';
import { ApiVersion } from '@/types/enums';
import { SystemInitializationResult } from '@/types/system';
import { SessionToken } from '@/types/user';

export class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor(private baseUrl: string) {
    this.client = axios.create({
      baseURL: `${baseUrl}/api/${ApiVersion}`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 请求拦截器：添加认证token
    this.client.interceptors.request.use(config => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // 响应拦截器：处理错误
    this.client.interceptors.response.use(
      response => response,
      error => {
        throw error;
      }
    );
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  // 认证相关
  async login(username: string, password: string): Promise<AuthenticationResult> {
    const deviceInfo = await getDeviceInfo();

    const response = await this.client.post<AuthenticationResult>('/auth/login', {
      username,
      password,
      deviceInfo: deviceInfo
    });
    this.setAccessToken(response.data.data.token.accessToken);
    return response.data;
  }

  async register(
    username: string, 
    password: string, 
    email: string,
    preferences: UserPreferences
  ): Promise<AuthenticationResult> {
    const deviceInfo = await getDeviceInfo();
    const response = await this.client.post<
    {
      status: number;
      message: string;
      data: AuthenticationResult;
    }    >('/auth/register', {
      username,
      password,
      email,
      preferences,
      deviceInfo
    });
    
    if (response.data.data.token) {
      this.setAccessToken(response.data.data.token.accessToken);
    }
    return response.data.data;
  }

  async refreshToken(currentRefreshToken: string): Promise<SessionToken> {
    const response = await this.client.post<{ 
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
    }>('/auth/refreshToken', {}, {
      headers: {
        Authorization: `Bearer ${currentRefreshToken}`,
      },
    });

    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      expiresAt: new Date(response.data.expiresAt)
    };
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.setAccessToken(null);
  }

  // 用户数据同步
  async syncUserData(userId: string, lastSyncTime: Date): Promise<User> {
    const response = await this.client.post<User>(`/users/${userId}/sync`, {
      lastSyncTime: lastSyncTime.toISOString()
    });
    return response.data;
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>
  ): Promise<User> {
    const response = await this.client.put<User>(`/users/${userId}/preferences`, preferences);
    return response.data;
  }

  async getSystemInitStatus(): Promise<SystemInitializationResult> {
    const response = await this.client.get<SystemInitializationResult>('/system/init');
    return response.data;
  }
}

// 创建单例实例
let apiClientInstance: ApiClient | null = null;

export async function getApiClient(): Promise<ApiClient> {
  if (!apiClientInstance) {
    const backendUrl = await getBackendUrl();
    apiClientInstance = new ApiClient(backendUrl);
  }
  return apiClientInstance;
}