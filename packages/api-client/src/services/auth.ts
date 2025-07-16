import { apiClient } from '../utils/api-client';

export interface AuthLoginInput {
  email: string;
  password: string;
}

export interface AuthRegisterInput {
  email: string;
  password: string;
  username: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  user: User;
}

export class AuthService {
  /**
   * ユーザーログイン
   */
  async login(credentials: AuthLoginInput): Promise<AuthResponse> {
    return apiClient.post('auth/login', credentials);
  }

  /**
   * ユーザー登録
   */
  async register(userData: AuthRegisterInput): Promise<AuthResponse> {
    return apiClient.post('auth/signup', userData);
  }

  /**
   * ログアウト
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post('auth/logout');
  }

  /**
   * 現在のユーザー情報を取得
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get('auth/me');
  }
}

export const authService = new AuthService();