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
    onMutate: async (data: { gameId: string; settings?: any }) => {
      // キャンセル可能な進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['user-games'] });

      // 前の状態をスナップショット
      const previousUserGames = queryClient.getQueryData<UserGame[]>(['user-games']);
      const availableGames = queryClient.getQueryData<any>(['games']);
      
      // 追加するゲームの情報を取得
      const gameToAdd = availableGames?.games?.find((g: any) => g.id === data.gameId);
      if (!gameToAdd) {
        throw new Error('Game not found');
      }

      // 一時的なユーザーゲームオブジェクトを作成（楽観的更新用）
      const tempUserGame: UserGame = {
        gameId: data.gameId,
        game: gameToAdd,
        settings: data.settings || {},
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // ユーザーゲーム設定のキャッシュを楽観的に更新
      queryClient.setQueryData<UserGame[]>(['user-games'], (old) => {
        return old ? [...old, tempUserGame] : [tempUserGame];
      });

      // 成功した場合のトーストを即座に表示
      toast({
        title: "ゲームを追加しました",
        description: `${gameToAdd.name}を追加しました`,
      });

      // 前の状態を返して、エラー時にロールバックできるようにする
      return { previousUserGames, gameToAdd };
    },
    onError: (error: any, _data, context) => {
      // エラー時は前の状態にロールバック
      if (context?.previousUserGames !== undefined) {
        queryClient.setQueryData(['user-games'], context.previousUserGames);
      }

      console.error('Add user game error:', error);
      toast({
        title: "エラーが発生しました",
        description: "ゲームの追加に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // 成功・失敗に関わらず、最終的にサーバーからデータを再取得
      queryClient.invalidateQueries({ queryKey: ['user-games'] });
    },
  });
}

// ゲーム設定を削除
export function useRemoveUserGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => gamesService.removeUserGame(gameId),
    onMutate: async (gameId: string) => {
      // キャンセル可能な進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['user-games'] });

      // 前の状態をスナップショット
      const previousUserGames = queryClient.getQueryData<UserGame[]>(['user-games']);
      
      // 削除されるゲームを見つける
      const removedGame = previousUserGames?.find(ug => ug.gameId === gameId);

      // ユーザーゲーム設定のキャッシュを楽観的に更新
      queryClient.setQueryData<UserGame[]>(['user-games'], (old) => {
        return old ? old.filter(ug => ug.gameId !== gameId) : [];
      });

      // 成功した場合のトーストを即座に表示
      if (removedGame) {
        toast({
          title: "ゲームを削除しました",
          description: `${removedGame.game.name}の設定を削除しました`,
        });
      }

      // 前の状態を返して、エラー時にロールバックできるようにする
      return { previousUserGames, removedGame };
    },
    onError: (error: any, _gameId, context) => {
      // エラー時は前の状態にロールバック
      if (context?.previousUserGames !== undefined) {
        queryClient.setQueryData(['user-games'], context.previousUserGames);
      }

      console.error('Remove user game error:', error);
      toast({
        title: "エラーが発生しました",
        description: "ゲームの削除に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // 成功・失敗に関わらず、最終的にサーバーからデータを再取得
      queryClient.invalidateQueries({ queryKey: ['user-games'] });
    },
  });
}