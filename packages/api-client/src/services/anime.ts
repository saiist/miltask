import { apiClient } from '../utils/api-client';

// アニメ型定義
export interface Anime {
  id: string;
  userId: string;
  title: string;
  malId?: number;
  imageUrl?: string;
  status: 'watching' | 'completed' | 'planned' | 'dropped';
  currentEpisode: number;
  totalEpisodes?: number;
  rating?: number;
  notes?: string;
  metadata?: string;
  startedAt?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// アニメ作成入力型
export interface AnimeCreateInput {
  title: string;
  malId?: number;
  imageUrl?: string;
  status?: 'watching' | 'completed' | 'planned' | 'dropped';
  currentEpisode?: number;
  totalEpisodes?: number;
  rating?: number;
  notes?: string;
}

// アニメ更新入力型
export interface AnimeUpdateInput {
  title?: string;
  malId?: number;
  imageUrl?: string;
  status?: 'watching' | 'completed' | 'planned' | 'dropped';
  currentEpisode?: number;
  totalEpisodes?: number;
  rating?: number;
  notes?: string;
}

// エピソード進行度更新入力型
export interface AnimeProgressInput {
  currentEpisode: number;
}

// API レスポンス型
export interface AnimeResponse {
  success: boolean;
  data: Anime;
}

export interface AnimeListResponse {
  success: boolean;
  data: Anime[];
}

export interface AnimeDeleteResponse {
  success: boolean;
  message: string;
}

export const animeService = {
  // アニメ一覧取得
  async getAnimeList(): Promise<Anime[]> {
    const response: AnimeListResponse = await apiClient.get('/api/anime');
    return response.data;
  },

  // ステータス別アニメ取得
  async getAnimeByStatus(status: 'watching' | 'completed' | 'planned' | 'dropped'): Promise<Anime[]> {
    const response: AnimeListResponse = await apiClient.get(`/api/anime/status/${status}`);
    return response.data;
  },

  // アニメ作成
  async createAnime(animeData: AnimeCreateInput): Promise<Anime> {
    const response: AnimeResponse = await apiClient.post('/api/anime', animeData);
    return response.data;
  },

  // アニメ更新
  async updateAnime(id: string, animeData: AnimeUpdateInput): Promise<Anime> {
    const response: AnimeResponse = await apiClient.put(`/api/anime/${id}`, animeData);
    return response.data;
  },

  // アニメ削除
  async deleteAnime(id: string): Promise<void> {
    await apiClient.delete(`/api/anime/${id}`);
  },

  // エピソード進行度更新
  async updateProgress(id: string, progressData: AnimeProgressInput): Promise<Anime> {
    const response: AnimeResponse = await apiClient.post(`/api/anime/${id}/progress`, progressData);
    return response.data;
  },
};