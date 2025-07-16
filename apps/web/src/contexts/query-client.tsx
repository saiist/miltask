import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10分間キャッシュ
      gcTime: 30 * 60 * 1000, // 30分間メモリ保持
      retry: (failureCount, error: any) => {
        // 認証エラーの場合はリトライしない
        if (error?.code === 'UNAUTHORIZED' || error?.response?.status === 401) {
          return false;
        }
        // ネットワークエラーの場合も1回までリトライ（頻度を下げる）
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
    mutations: {
      retry: false,
    },
  },
});

interface QueryClientProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryClientProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* {import.meta.env.DEV && <ReactQueryDevtools />} */}
    </QueryClientProvider>
  );
}

export { queryClient };