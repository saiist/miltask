import { apiClient } from '../utils/api-client';

export interface StatisticsData {
  today: {
    total: number;
    completed: number;
    completionRate: number;
  };
  week: {
    total: number;
    completed: number;
    completionRate: number;
    trend: string;
  };
  byType: {
    anime: {
      total: number;
      completed: number;
      completionRate: number;
    };
    gameTasks: {
      total: number;
      completed: number;
      completionRate: number;
    };
    bookReleases: {
      total: number;
      completed: number;
      completionRate: number;
    };
  };
  games: {
    active: number;
  };
}

export class StatisticsService {
  /**
   * 統計データを取得
   */
  async getStatistics(): Promise<StatisticsData> {
    const response = await apiClient.get('/api/statistics');
    return response.data;
  }
}

export const statisticsService = new StatisticsService();