import { apiClient } from '../utils/api-client';

export interface Game {
  id: string;
  name: string;
  platform: string;
  iconUrl?: string;
  dailyTasks: any[];
}

export interface UserGame {
  gameId: string;
  active: boolean;
  settings: any;
  createdAt: string;
  updatedAt: string;
  game: Game;
}

export class GamesService {
  /**
   * 利用可能ゲーム一覧取得（認証不要）
   */
  async getGames(): Promise<{ games: Game[] }> {
    return apiClient.get('api/games');
  }

  /**
   * ユーザーのゲーム設定取得
   */
  async getUserGames(): Promise<{ userGames: UserGame[] }> {
    return apiClient.get('api/games/user');
  }

  /**
   * ゲーム設定追加/更新
   */
  async addUserGame(data: {
    gameId: string;
    settings?: any;
  }): Promise<UserGame> {
    return apiClient.post('api/games/user', data);
  }

  /**
   * ゲーム設定削除
   */
  async removeUserGame(gameId: string): Promise<{ message: string }> {
    return apiClient.delete(`api/games/user/${gameId}`);
  }
}

export const gamesService = new GamesService();