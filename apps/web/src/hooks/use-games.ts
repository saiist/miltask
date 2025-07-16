import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamesService, type UserGame } from '@otaku-secretary/api-client';
import { toast } from '@/hooks/use-toast';

// 利用可能なゲーム一覧を取得
export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      try {
        const response = await gamesService.getGames();
        return response.games;
      } catch (error) {
        console.error('Failed to fetch games:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60, // 1時間キャッシュ
  });
}

// ユーザーのゲーム設定を取得
export function useUserGames() {
  return useQuery({
    queryKey: ['user-games'],
    queryFn: async () => {
      try {
        const response = await gamesService.getUserGames();
        return response.userGames;
      } catch (error) {
        console.error('Failed to fetch user games:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

// ゲーム設定を追加/更新
export function useAddUserGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { gameId: string; settings?: any }) => 
      gamesService.addUserGame(data),
    onSuccess: (newUserGame: UserGame) => {
      // ユーザーゲーム設定のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['user-games'] });
      
      toast({
        title: "ゲームを追加しました",
        description: `${newUserGame.game.name}を追加しました`,
      });
    },
    onError: (error: any) => {
      console.error('Add user game error:', error);
      toast({
        title: "エラーが発生しました",
        description: "ゲームの追加に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
  });
}

// ゲーム設定を削除
export function useRemoveUserGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => gamesService.removeUserGame(gameId),
    onSuccess: () => {
      // ユーザーゲーム設定のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['user-games'] });
      
      toast({
        title: "ゲームを削除しました",
        description: "設定を削除しました",
      });
    },
    onError: (error: any) => {
      console.error('Remove user game error:', error);
      toast({
        title: "エラーが発生しました",
        description: "ゲームの削除に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
  });
}