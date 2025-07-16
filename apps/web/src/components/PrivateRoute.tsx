import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/hooks/use-auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * 認証が必要なルートをラップするコンポーネント
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 認証状態チェック中はローディング表示
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">認証状態を確認しています...</p>
        </div>
      </div>
    );
  }

  // 認証されていない場合はログインページへリダイレクト
  // 現在のURLを保存してログイン後に戻れるようにする
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * 認証されていないユーザーのみアクセス可能なルートをラップするコンポーネント
 * （ログイン、登録ページなど）
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 認証状態チェック中はローディング表示
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">認証状態を確認しています...</p>
        </div>
      </div>
    );
  }

  // 認証されている場合はダッシュボードへリダイレクト
  // ログイン前のURLがある場合はそちらへ
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}