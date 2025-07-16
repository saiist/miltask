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
  const { 
    data: user, 
    isLoading: isUserLoading,
    error: userError
  } = useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      try {
        const response = await authService.getCurrentUser();
        // APIレスポンスからユーザーデータを取得
        return response.data || response;
      } catch (error: any) {
        // 401の場合は null を返す（未認証状態）
        if (error?.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    gcTime: 10 * 60 * 1000, // 10分間ガベージコレクションを遅延
    refetchOnWindowFocus: false,
    refetchOnMount: false, // マウント時の再取得を無効化
    refetchOnReconnect: false, // 再接続時の再取得を無効化
  });

  // ログイン状態
  const isAuthenticated = !!user && user !== null;
  const isLoading = isUserLoading;

  // デバッグログ
  console.log('[useAuth] State:', {
    user: user ? `User(${user.id})` : null,
    isAuthenticated,
    isLoading,
    error: userError,
    timestamp: new Date().toISOString()
  });

  // ログイン処理
  const loginMutation = useMutation({
    mutationFn: async (credentials: AuthLoginInput) => {
      return await authService.login(credentials);
    },
    onSuccess: (response: any) => {
      console.log('[Login] Success:', response);
      
      // レスポンス構造を確認してユーザー情報を取得
      const user = response.data.user;
      console.log('[Login] User data:', user);
      
      // ユーザー情報をキャッシュに保存
      queryClient.setQueryData(authKeys.user(), user);
      console.log('[Login] Cache updated');
      
      toast({
        title: 'ログイン成功',
        description: 'ようこそ！',
      });
      
      // ダッシュボードへリダイレクト
      console.log('[Login] Navigating to dashboard');
      // キャッシュ更新が反映されるまで少し待つ
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
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
      return await authService.register(userData);
    },
    onSuccess: (response: any) => {
      // レスポンス構造を確認してユーザー情報を取得
      const user = response.data.user;
      
      // ユーザー情報をキャッシュに保存
      queryClient.setQueryData(authKeys.user(), user);
      
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
      return await authService.logout();
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