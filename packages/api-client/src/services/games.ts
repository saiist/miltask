import { apiClient } from '../utils/api-client';
import type { 
  Game,
  GameListEntry,
  GameListResponse,
  ApiResponse
} from '@otaku-secretary/shared';

export interface GameSearchQuery {
  query: string;
  platform?: string;
  genre?: string;
  year?: number;
  limit?: number;
}

export interface GameListQuery {
  page?: number;
  limit?: number;
  status?: 'playing' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_play';
  platform?: string;
  sort?: 'title' | 'score' | 'date_added' | 'date_updated';
  order?: 'asc' | 'desc';
}

export interface GameListEntryInput {
  gameId: string;
  status: 'playing' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_play';
  score?: number;
  hoursPlayed?: number;
  notes?: string;
  startDate?: Date;
  finishDate?: Date;
  platform?: string;
}

export class GamesService {
  /**
   * ゲーム検索
   */
  async searchGames(query: GameSearchQuery): Promise<ApiResponse<Game[]>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    
    return apiClient.get<Game[]>(`games/search?${params.toString()}`);
  }

  /**
   * ゲーム詳細取得
   */
  async getGame(id: string): Promise<ApiResponse<Game>> {
    return apiClient.get<Game>(`games/${id}`);
  }

  /**
   * ユーザーのゲームリスト取得
   */
  async getUserGameList(query?: GameListQuery): Promise<ApiResponse<GameListResponse>> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    
    const url = params.toString() ? `games/list?${params.toString()}` : 'games/list';
    return apiClient.get<GameListResponse>(url);
  }

  /**
   * ゲームをリストに追加
   */
  async addToList(entry: GameListEntryInput): Promise<ApiResponse<GameListEntry>> {
    return apiClient.post<GameListEntry>('games/list', entry);
  }

  /**
   * ゲームリストエントリ更新
   */
  async updateListEntry(gameId: string, updates: Partial<GameListEntryInput>): Promise<ApiResponse<GameListEntry>> {
    return apiClient.put<GameListEntry>(`games/list/${gameId}`, updates);
  }

  /**
   * ゲームをリストから削除
   */
  async removeFromList(gameId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`games/list/${gameId}`);
  }

  /**
   * 人気ゲーム取得
   */
  async getPopularGames(limit: number = 20): Promise<ApiResponse<Game[]>> {
    return apiClient.get<Game[]>(`games/popular?limit=${limit}`);
  }

  /**
   * 新作ゲーム取得
   */
  async getNewReleases(limit: number = 20): Promise<ApiResponse<Game[]>> {
    return apiClient.get<Game[]>(`games/new-releases?limit=${limit}`);
  }

  /**
   * おすすめゲーム取得
   */
  async getRecommendations(limit: number = 10): Promise<ApiResponse<Game[]>> {
    return apiClient.get<Game[]>(`games/recommendations?limit=${limit}`);
  }
}

export const gamesService = new GamesService();