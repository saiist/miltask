import { useQuery } from '@tanstack/react-query';
import { statisticsService, type StatisticsData } from '@otaku-secretary/api-client';

// 統計データを取得
export function useStatistics() {
  return useQuery<StatisticsData>({
    queryKey: ['statistics'],
    queryFn: async () => {
      try {
        return await statisticsService.getStatistics();
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
    refetchInterval: 1000 * 60 * 5, // 5分ごとに更新
  });
}