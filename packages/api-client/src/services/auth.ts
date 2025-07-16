import { apiClient } from '../utils/api-client';
import type { 
  AuthLoginInput, 
  AuthRegisterInput,
  PasswordChangeInput,
  User,
  ApiResponse 
} from '@otaku-secretary/shared';

export interface AuthResponse {
  user: User;
}

export class AuthService {
  /**
   * ユーザーログイン
   */
  async login(credentials: AuthLoginInput): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('auth/login', credentials);
  }

  /**
   * ユーザー登録
   */
  async register(userData: AuthRegisterInput): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('auth/signup', userData);
  }

  /**
   * ログアウト
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('auth/logout');
  }

  /**
   * 現在のユーザー情報を取得
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('auth/me');
  }

  /**
   * パスワード変更
   */
  async changePassword(passwordData: PasswordChangeInput): Promise<ApiResponse<void>> {
    return apiClient.post<void>('auth/change-password', passwordData);
  }

  /**
   * パスワードリセットリクエスト
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('auth/reset-password', { email });
  }

  /**
   * パスワードリセット実行
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('auth/reset-password/confirm', {
      token,
      newPassword
    });
  }

  /**
   * セッション検証
   */
  async validateSession(): Promise<ApiResponse<{ valid: boolean; user?: User }>> {
    return apiClient.get<{ valid: boolean; user?: User }>('auth/validate');
  }

  /**
   * セッション更新
   */
  async refreshSession(): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('auth/refresh');
  }
}

export const authService = new AuthService();