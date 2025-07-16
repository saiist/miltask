import { apiClient } from '../utils/api-client';
import type { 
  User,
  UserProfile,
  UserUpdateInput,
  ApiResponse
} from '@otaku-secretary/shared';

export class UsersService {
  /**
   * ユーザープロフィール取得
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('users/profile');
  }

  /**
   * ユーザー情報更新
   */
  async updateProfile(updates: UserUpdateInput): Promise<ApiResponse<User>> {
    return apiClient.put<User>('users/profile', updates);
  }

  /**
   * アバター画像アップロード
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiClient.post<{ avatarUrl: string }>('users/avatar', formData, {
      headers: {
        // Content-Typeを削除してmultipart/form-dataを自動設定
      }
    });
  }

  /**
   * ユーザー設定更新
   */
  async updatePreferences(preferences: Partial<User['preferences']>): Promise<ApiResponse<User>> {
    return apiClient.patch<User>('users/preferences', { preferences });
  }

  /**
   * アカウント削除
   */
  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('users/account', {
      json: { password }
    });
  }

  /**
   * ユーザー統計情報取得
   */
  async getStats(): Promise<ApiResponse<UserProfile['stats']>> {
    return apiClient.get<UserProfile['stats']>('users/stats');
  }
}

export const usersService = new UsersService();