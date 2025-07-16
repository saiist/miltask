import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { authService } from '@otaku-secretary/api-client';
import type { 
  AuthLoginInput, 
  AuthRegisterInput
} from '@otaku-secretary/shared';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  validation: () => [...authKeys.all, 'validation'] as const,
};

/**
 * 認証状態管理フック
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 現在のユーザー情報を取得
  const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await authService.getCurrentUser();
      if (!response.success) {
        // 401の場合は null を返す（未認証状態）
        if (response.error?.code === 'UNAUTHORIZED') {
          return null;
        }
        throw new Error(response.error?.message || '認証エラー');
      }
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効化
    refetchOnMount: false, // マウント時の再取得を無効化
  });

  // ログイン状態
  const isAuthenticated = !!user && !userError;
  const isLoading = isUserLoading;

  // ログイン処理
  const loginMutation = useMutation({
    mutationFn: async (credentials: AuthLoginInput) => {
      const response = await authService.login(credentials);
      if (!response.success) {
        throw new Error(response.error?.message || 'ログインに失敗しました');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // ユーザー情報をキャッシュに保存
      queryClient.setQueryData(authKeys.user(), data?.user);
      
      toast({
        title: 'ログイン成功',
        description: 'ようこそ！',
      });
      
      // ダッシュボードへリダイレクト
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: 'ログインエラー',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // ユーザー登録処理
  const registerMutation = useMutation({
    mutationFn: async (userData: AuthRegisterInput) => {
      const response = await authService.register(userData);
      if (!response.success) {
        throw new Error(response.error?.message || 'アカウント作成に失敗しました');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // ユーザー情報をキャッシュに保存
      queryClient.setQueryData(authKeys.user(), data?.user);
      
      toast({
        title: 'アカウント作成完了',
        description: 'ようこそ！アカウントが作成されました。',
      });
      
      // ダッシュボードへリダイレクト
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: 'アカウント作成エラー',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // ログアウト処理
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await authService.logout();
      if (!response.success) {
        throw new Error(response.error?.message || 'ログアウトに失敗しました');
      }
    },
    onSuccess: () => {
      // キャッシュをクリア
      queryClient.clear();
      
      toast({
        title: 'ログアウト',
        description: 'ログアウトしました。',
      });
      
      // ログインページへリダイレクト
      navigate('/login');
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      // エラーが発生してもキャッシュをクリアしてログインページへ
      queryClient.clear();
      navigate('/login');
    },
  });

  return {
    // 状態
    user,
    isAuthenticated,
    isLoading,
    
    // ログイン
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    
    // ユーザー登録
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    
    // ログアウト
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    
    // ユーティリティ
    refetchUser: () => queryClient.invalidateQueries({ queryKey: authKeys.user() }),
  };
}

/**
 * 認証が必要なページで使用するフック
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // 認証されていない場合はログインページへリダイレクト
  if (!isLoading && !isAuthenticated) {
    navigate('/login');
    return { isAuthenticated: false, isLoading: false };
  }

  return { isAuthenticated, isLoading };
}