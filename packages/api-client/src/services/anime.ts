import { apiClient } from '../utils/api-client';
import type { 
  Anime,
  AnimeListEntry,
  AnimeListResponse,
  ApiResponse
} from '@otaku-secretary/shared';

export interface AnimeSearchQuery {
  query: string;
  year?: number;
  genre?: string;
  studio?: string;
  limit?: number;
}

export interface AnimeListQuery {
  page?: number;
  limit?: number;
  status?: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';
  sort?: 'title' | 'score' | 'date_added' | 'date_updated';
  order?: 'asc' | 'desc';
}

export interface AnimeListEntryInput {
  animeId: string;
  status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';
  score?: number;
  episodesWatched?: number;
  notes?: string;
  startDate?: Date;
  finishDate?: Date;
}

export class AnimeService {
  /**
   * アニメ検索
   */
  async searchAnime(query: AnimeSearchQuery): Promise<ApiResponse<Anime[]>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    
    return apiClient.get<Anime[]>(`anime/search?${params.toString()}`);
  }

  /**
   * アニメ詳細取得
   */
  async getAnime(id: string): Promise<ApiResponse<Anime>> {
    return apiClient.get<Anime>(`anime/${id}`);
  }

  /**
   * ユーザーのアニメリスト取得
   */
  async getUserAnimeList(query?: AnimeListQuery): Promise<ApiResponse<AnimeListResponse>> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    
    const url = params.toString() ? `anime/list?${params.toString()}` : 'anime/list';
    return apiClient.get<AnimeListResponse>(url);
  }

  /**
   * アニメをリストに追加
   */
  async addToList(entry: AnimeListEntryInput): Promise<ApiResponse<AnimeListEntry>> {
    return apiClient.post<AnimeListEntry>('anime/list', entry);
  }

  /**
   * アニメリストエントリ更新
   */
  async updateListEntry(animeId: string, updates: Partial<AnimeListEntryInput>): Promise<ApiResponse<AnimeListEntry>> {
    return apiClient.put<AnimeListEntry>(`anime/list/${animeId}`, updates);
  }

  /**
   * アニメをリストから削除
   */
  async removeFromList(animeId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`anime/list/${animeId}`);
  }

  /**
   * 人気アニメ取得
   */
  async getPopularAnime(limit: number = 20): Promise<ApiResponse<Anime[]>> {
    return apiClient.get<Anime[]>(`anime/popular?limit=${limit}`);
  }

  /**
   * 今期アニメ取得
   */
  async getCurrentSeasonAnime(): Promise<ApiResponse<Anime[]>> {
    return apiClient.get<Anime[]>('anime/current-season');
  }

  /**
   * おすすめアニメ取得
   */
  async getRecommendations(limit: number = 10): Promise<ApiResponse<Anime[]>> {
    return apiClient.get<Anime[]>(`anime/recommendations?limit=${limit}`);
  }
}

export const animeService = new AnimeService();