import { apiClient } from '../utils/api-client';
import type { User, AuthLoginInput, AuthRegisterInput } from '@otaku-secretary/shared';

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export class AuthService {
  /**
   * ユーザーログイン
   */
  async login(credentials: AuthLoginInput): Promise<AuthResponse> {
    return apiClient.post('/auth/login', credentials);
  }

  /**
   * ユーザー登録
   */
  async register(userData: AuthRegisterInput): Promise<AuthResponse> {
    return apiClient.post('/auth/signup', userData);
  }

  /**
   * ログアウト
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post('/auth/logout');
  }

  /**
   * 現在のユーザー情報を取得
   */
  async getCurrentUser(): Promise<{ success: boolean; data: User }> {
    return apiClient.get('/auth/me');
  }
}

export const authService = new AuthService();