import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  animeService, 
  type Anime, 
  type AnimeCreateInput, 
  type AnimeUpdateInput,
  type AnimeProgressInput 
} from '@otaku-secretary/api-client';
import { useToast } from '@/hooks/use-toast';

// アニメ一覧取得
export function useAnimeList() {
  return useQuery<Anime[]>({
    queryKey: ['anime'],
    queryFn: async () => {
      try {
        return await animeService.getAnimeList();
      } catch (error) {
        console.error('Failed to fetch anime list:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

// ステータス別アニメ取得
export function useAnimeByStatus(status: 'watching' | 'completed' | 'planned' | 'dropped') {
  return useQuery<Anime[]>({
    queryKey: ['anime', 'status', status],
    queryFn: async () => {
      try {
        return await animeService.getAnimeByStatus(status);
      } catch (error) {
        console.error(`Failed to fetch ${status} anime:`, error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

// アニメ作成
export function useCreateAnime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (animeData: AnimeCreateInput) => {
      return await animeService.createAnime(animeData);
    },
    onMutate: async (animeData: AnimeCreateInput) => {
      // キャンセル可能な進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['anime'] });
      await queryClient.cancelQueries({ queryKey: ['anime', 'status'] });

      // 前の状態をスナップショット
      const previousAnimeList = queryClient.getQueryData<Anime[]>(['anime']);
      const previousStatusAnime = queryClient.getQueryData<Anime[]>(['anime', 'status', animeData.status]);

      // 一時的なアニメオブジェクトを作成（楽観的更新用）
      const tempAnime: Anime = {
        id: `temp-${Date.now()}`,
        userId: 'temp-user',
        title: animeData.title,
        malId: animeData.malId,
        imageUrl: animeData.imageUrl,
        status: animeData.status || 'planned',
        currentEpisode: animeData.currentEpisode || 0,
        totalEpisodes: animeData.totalEpisodes,
        rating: animeData.rating,
        notes: animeData.notes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // アニメ一覧のキャッシュを楽観的に更新
      queryClient.setQueryData<Anime[]>(['anime'], (old) => {
        return old ? [tempAnime, ...old] : [tempAnime];
      });

      // ステータス別アニメのキャッシュも楽観的に更新
      queryClient.setQueryData<Anime[]>(['anime', 'status', tempAnime.status], (old) => {
        return old ? [tempAnime, ...old] : [tempAnime];
      });

      // 成功した場合のトーストを即座に表示
      toast({
        title: 'アニメを追加しました',
        description: `「${animeData.title}」を追加しました`,
      });

      // 前の状態を返して、エラー時にロールバックできるようにする
      return { previousAnimeList, previousStatusAnime, tempAnime };
    },
    onError: (error, _animeData, context) => {
      // エラー時は前の状態にロールバック
      if (context?.previousAnimeList !== undefined) {
        queryClient.setQueryData(['anime'], context.previousAnimeList);
      }
      if (context?.previousStatusAnime !== undefined) {
        queryClient.setQueryData(['anime', 'status', context.tempAnime.status], context.previousStatusAnime);
      }

      console.error('Failed to create anime:', error);
      toast({
        title: 'アニメの追加に失敗しました',
        description: 'もう一度お試しください。',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // 成功・失敗に関わらず、最終的にサーバーからデータを再取得
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      queryClient.invalidateQueries({ queryKey: ['anime', 'status'] });
    },
  });
}

// アニメ更新
export function useUpdateAnime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, animeData }: { id: string; animeData: AnimeUpdateInput }) => {
      return await animeService.updateAnime(id, animeData);
    },
    onMutate: async ({ id, animeData }) => {
      // キャンセル可能な進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['anime'] });
      await queryClient.cancelQueries({ queryKey: ['anime', 'status'] });

      // 前の状態をスナップショット
      const previousAnimeList = queryClient.getQueryData<Anime[]>(['anime']);
      const previousStatusAnime: Record<string, Anime[] | undefined> = {};
      
      // 既存のアニメを見つける
      const existingAnime = previousAnimeList?.find(anime => anime.id === id);
      if (!existingAnime) {
        throw new Error('Anime not found');
      }

      // ステータス別のキャッシュをスナップショット
      const statuses: ('watching' | 'completed' | 'planned' | 'dropped')[] = ['watching', 'completed', 'planned', 'dropped'];
      statuses.forEach(status => {
        previousStatusAnime[status] = queryClient.getQueryData<Anime[]>(['anime', 'status', status]);
      });

      // 更新されたアニメオブジェクトを作成（楽観的更新用）
      const updatedAnime: Anime = {
        ...existingAnime,
        ...animeData,
        updatedAt: Date.now(),
      };

      // アニメ一覧のキャッシュを楽観的に更新
      queryClient.setQueryData<Anime[]>(['anime'], (old) => {
        return old ? old.map(anime => 
          anime.id === id ? updatedAnime : anime
        ) : [updatedAnime];
      });

      // ステータス別アニメのキャッシュを楽観的に更新
      statuses.forEach(status => {
        queryClient.setQueryData<Anime[]>(['anime', 'status', status], (old) => {
          if (!old) return old;
          
          // 古いアニメを削除
          const filtered = old.filter(anime => anime.id !== id);
          
          // 新しいステータスと一致する場合は追加
          if (updatedAnime.status === status) {
            return [updatedAnime, ...filtered];
          }
          
          return filtered;
        });
      });

      // 成功した場合のトーストを即座に表示
      toast({
        title: 'アニメを更新しました',
        description: `「${updatedAnime.title}」を更新しました`,
      });

      return { previousAnimeList, previousStatusAnime, existingAnime };
    },
    onError: (error, _variables, context) => {
      // エラー時は前の状態にロールバック
      if (context?.previousAnimeList !== undefined) {
        queryClient.setQueryData(['anime'], context.previousAnimeList);
      }
      
      // ステータス別のキャッシュもロールバック
      const statuses: ('watching' | 'completed' | 'planned' | 'dropped')[] = ['watching', 'completed', 'planned', 'dropped'];
      statuses.forEach(status => {
        if (context?.previousStatusAnime[status] !== undefined) {
          queryClient.setQueryData(['anime', 'status', status], context.previousStatusAnime[status]);
        }
      });

      console.error('Failed to update anime:', error);
      toast({
        title: 'アニメの更新に失敗しました',
        description: 'もう一度お試しください。',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // 成功・失敗に関わらず、最終的にサーバーからデータを再取得
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      queryClient.invalidateQueries({ queryKey: ['anime', 'status'] });
    },
  });
}

// アニメ削除
export function useDeleteAnime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await animeService.deleteAnime(id);
      return id;
    },
    onMutate: async (id: string) => {
      // キャンセル可能な進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['anime'] });
      await queryClient.cancelQueries({ queryKey: ['anime', 'status'] });

      // 前の状態をスナップショット
      const previousAnimeList = queryClient.getQueryData<Anime[]>(['anime']);
      const previousStatusAnime: Record<string, Anime[] | undefined> = {};
      
      // 削除されるアニメを見つける
      const deletedAnime = previousAnimeList?.find(anime => anime.id === id);
      
      // ステータス別のキャッシュをスナップショット
      const statuses: ('watching' | 'completed' | 'planned' | 'dropped')[] = ['watching', 'completed', 'planned', 'dropped'];
      statuses.forEach(status => {
        previousStatusAnime[status] = queryClient.getQueryData<Anime[]>(['anime', 'status', status]);
      });

      // アニメ一覧のキャッシュを楽観的に更新
      queryClient.setQueryData<Anime[]>(['anime'], (old) => {
        return old ? old.filter(anime => anime.id !== id) : [];
      });

      // ステータス別アニメのキャッシュも楽観的に更新
      statuses.forEach(status => {
        queryClient.setQueryData<Anime[]>(['anime', 'status', status], (old) => {
          return old ? old.filter(anime => anime.id !== id) : [];
        });
      });

      // 成功した場合のトーストを即座に表示
      if (deletedAnime) {
        toast({
          title: 'アニメを削除しました',
          description: `「${deletedAnime.title}」を削除しました`,
        });
      }

      return { previousAnimeList, previousStatusAnime, deletedAnime };
    },
    onError: (error, _id, context) => {
      // エラー時は前の状態にロールバック
      if (context?.previousAnimeList !== undefined) {
        queryClient.setQueryData(['anime'], context.previousAnimeList);
      }
      
      // ステータス別のキャッシュもロールバック
      const statuses: ('watching' | 'completed' | 'planned' | 'dropped')[] = ['watching', 'completed', 'planned', 'dropped'];
      statuses.forEach(status => {
        if (context?.previousStatusAnime[status] !== undefined) {
          queryClient.setQueryData(['anime', 'status', status], context.previousStatusAnime[status]);
        }
      });

      console.error('Failed to delete anime:', error);
      toast({
        title: 'アニメの削除に失敗しました',
        description: 'もう一度お試しください。',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // 成功・失敗に関わらず、最終的にサーバーからデータを再取得
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      queryClient.invalidateQueries({ queryKey: ['anime', 'status'] });
    },
  });
}

// エピソード進行度更新
export function useUpdateAnimeProgress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, progressData }: { id: string; progressData: AnimeProgressInput }) => {
      return await animeService.updateProgress(id, progressData);
    },
    onMutate: async ({ id, progressData }) => {
      // キャンセル可能な進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['anime'] });
      await queryClient.cancelQueries({ queryKey: ['anime', 'status'] });

      // 前の状態をスナップショット
      const previousAnimeList = queryClient.getQueryData<Anime[]>(['anime']);
      const previousStatusAnime: Record<string, Anime[] | undefined> = {};
      
      // 既存のアニメを見つける
      const existingAnime = previousAnimeList?.find(anime => anime.id === id);
      if (!existingAnime) {
        throw new Error('Anime not found');
      }

      // ステータス別のキャッシュをスナップショット
      const statuses: ('watching' | 'completed' | 'planned' | 'dropped')[] = ['watching', 'completed', 'planned', 'dropped'];
      statuses.forEach(status => {
        previousStatusAnime[status] = queryClient.getQueryData<Anime[]>(['anime', 'status', status]);
      });

      // 更新されたアニメオブジェクトを作成（楽観的更新用）
      const newEpisode = progressData.currentEpisode || existingAnime.currentEpisode;
      const isCompleted = existingAnime.totalEpisodes && newEpisode >= existingAnime.totalEpisodes;
      
      const updatedAnime: Anime = {
        ...existingAnime,
        currentEpisode: newEpisode,
        status: isCompleted ? 'completed' : existingAnime.status,
        updatedAt: Date.now(),
      };

      // アニメ一覧のキャッシュを楽観的に更新
      queryClient.setQueryData<Anime[]>(['anime'], (old) => {
        return old ? old.map(anime => 
          anime.id === id ? updatedAnime : anime
        ) : [updatedAnime];
      });

      // ステータス別アニメのキャッシュを楽観的に更新
      statuses.forEach(status => {
        queryClient.setQueryData<Anime[]>(['anime', 'status', status], (old) => {
          if (!old) return old;
          
          // 古いアニメを削除
          const filtered = old.filter(anime => anime.id !== id);
          
          // 新しいステータスと一致する場合は追加
          if (updatedAnime.status === status) {
            return [updatedAnime, ...filtered];
          }
          
          return filtered;
        });
      });

      // 成功した場合のトーストを即座に表示
      if (isCompleted) {
        toast({
          title: 'アニメを完了しました！',
          description: `「${updatedAnime.title}」の視聴を完了しました`,
        });
      } else {
        toast({
          title: 'エピソード進行度を更新しました',
          description: `${updatedAnime.title}: ${newEpisode}/${updatedAnime.totalEpisodes || '?'}話`,
        });
      }

      return { previousAnimeList, previousStatusAnime, existingAnime };
    },
    onError: (error, _variables, context) => {
      // エラー時は前の状態にロールバック
      if (context?.previousAnimeList !== undefined) {
        queryClient.setQueryData(['anime'], context.previousAnimeList);
      }
      
      // ステータス別のキャッシュもロールバック
      const statuses: ('watching' | 'completed' | 'planned' | 'dropped')[] = ['watching', 'completed', 'planned', 'dropped'];
      statuses.forEach(status => {
        if (context?.previousStatusAnime[status] !== undefined) {
          queryClient.setQueryData(['anime', 'status', status], context.previousStatusAnime[status]);
        }
      });

      console.error('Failed to update anime progress:', error);
      toast({
        title: 'エピソード進行度の更新に失敗しました',
        description: 'もう一度お試しください。',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // 成功・失敗に関わらず、最終的にサーバーからデータを再取得
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      queryClient.invalidateQueries({ queryKey: ['anime', 'status'] });
    },
  });
}