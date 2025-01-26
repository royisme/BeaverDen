import { User } from './user';

export interface AuthenticationResult {
  user: User;
  token: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
  deviceInfo?: any;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  preferences?: any;
  deviceInfo?: any;
}
