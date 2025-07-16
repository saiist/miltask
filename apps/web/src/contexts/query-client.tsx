import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分間キャッシュ
      gcTime: 10 * 60 * 1000, // 10分間メモリ保持
      retry: (failureCount, error: any) => {
        // 認証エラーの場合はリトライしない
        if (error?.code === 'UNAUTHORIZED' || error?.response?.status === 401) {
          return false;
        }
        // ネットワークエラーの場合も3回までリトライ
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
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