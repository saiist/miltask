import { apiClient } from '../utils/api-client';

export interface Anime {
  id: string;
  title: string;
  status: string;
  episodes: number;
}

export class AnimeService {
  async getAnimeList(): Promise<{ anime: Anime[] }> {
    return apiClient.get('api/anime');
  }
}

export const animeService = new AnimeService();