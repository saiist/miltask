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
    onSuccess: (newAnime) => {
      // アニメ一覧のキャッシュを更新
      queryClient.setQueryData<Anime[]>(['anime'], (old) => {
        return old ? [newAnime, ...old] : [newAnime];
      });

      // ステータス別アニメのキャッシュも更新
      queryClient.setQueryData<Anime[]>(['anime', 'status', newAnime.status], (old) => {
        return old ? [newAnime, ...old] : [newAnime];
      });

      toast({
        title: 'アニメを追加しました',
      });
    },
    onError: (error) => {
      console.error('Failed to create anime:', error);
      toast({
        title: 'アニメの追加に失敗しました',
        variant: 'destructive',
      });
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
    onSuccess: (updatedAnime) => {
      // アニメ一覧のキャッシュを更新
      queryClient.setQueryData<Anime[]>(['anime'], (old) => {
        return old ? old.map(anime => 
          anime.id === updatedAnime.id ? updatedAnime : anime
        ) : [updatedAnime];
      });

      // ステータス別アニメのキャッシュを更新（古いステータスと新しいステータス両方）
      ['watching', 'completed', 'planned', 'dropped'].forEach(status => {
        queryClient.setQueryData<Anime[]>(['anime', 'status', status], (old) => {
          if (!old) return old;
          
          // 古いアニメを削除
          const filtered = old.filter(anime => anime.id !== updatedAnime.id);
          
          // 新しいステータスと一致する場合は追加
          if (updatedAnime.status === status) {
            return [updatedAnime, ...filtered];
          }
          
          return filtered;
        });
      });

      toast({
        title: 'アニメを更新しました',
      });
    },
    onError: (error) => {
      console.error('Failed to update anime:', error);
      toast({
        title: 'アニメの更新に失敗しました',
        variant: 'destructive',
      });
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
    onSuccess: (deletedId) => {
      // アニメ一覧のキャッシュを更新
      queryClient.setQueryData<Anime[]>(['anime'], (old) => {
        return old ? old.filter(anime => anime.id !== deletedId) : [];
      });

      // ステータス別アニメのキャッシュも更新
      ['watching', 'completed', 'planned', 'dropped'].forEach(status => {
        queryClient.setQueryData<Anime[]>(['anime', 'status', status], (old) => {
          return old ? old.filter(anime => anime.id !== deletedId) : [];
        });
      });

      toast({
        title: 'アニメを削除しました',
      });
    },
    onError: (error) => {
      console.error('Failed to delete anime:', error);
      toast({
        title: 'アニメの削除に失敗しました',
        variant: 'destructive',
      });
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
    onSuccess: (updatedAnime) => {
      // アニメ一覧のキャッシュを更新
      queryClient.setQueryData<Anime[]>(['anime'], (old) => {
        return old ? old.map(anime => 
          anime.id === updatedAnime.id ? updatedAnime : anime
        ) : [updatedAnime];
      });

      // ステータス別アニメのキャッシュを更新
      ['watching', 'completed', 'planned', 'dropped'].forEach(status => {
        queryClient.setQueryData<Anime[]>(['anime', 'status', status], (old) => {
          if (!old) return old;
          
          // 古いアニメを削除
          const filtered = old.filter(anime => anime.id !== updatedAnime.id);
          
          // 新しいステータスと一致する場合は追加
          if (updatedAnime.status === status) {
            return [updatedAnime, ...filtered];
          }
          
          return filtered;
        });
      });

      toast({
        title: 'エピソード進行度を更新しました',
      });
    },
    onError: (error) => {
      console.error('Failed to update anime progress:', error);
      toast({
        title: 'エピソード進行度の更新に失敗しました',
        variant: 'destructive',
      });
    },
  });
}