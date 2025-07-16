import { apiClient } from '../utils/api-client';

export class UsersService {
  async getProfile(): Promise<any> {
    return apiClient.get('api/users/profile');
  }
}

export const usersService = new UsersService();