import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksService, type TaskCreateInput, type Task, type TodayTasksResponse } from '@otaku-secretary/api-client';
import { toast } from '@/hooks/use-toast';

export function useTodayTasks() {
  return useQuery<TodayTasksResponse>({
    queryKey: ['tasks', 'today'],
    queryFn: async () => {
      try {
        return await tasksService.getTodayTasks();
      } catch (error) {
        console.error('Failed to fetch today tasks:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
    retry: 1, // 1回だけリトライ
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: TaskCreateInput) => tasksService.createTask(taskData),
    onSuccess: (newTask: Task) => {
      // 今日のタスクキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['tasks', 'today'] });
      
      toast({
        title: "タスクを作成しました",
        description: `「${newTask.title}」を追加しました`,
      });
    },
    onError: (error: any) => {
      console.error('Task creation error:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクの作成に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksService.completeTask(taskId),
    onSuccess: (completedTask: Task) => {
      // 今日のタスクキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['tasks', 'today'] });
      
      toast({
        title: "タスクを完了しました",
        description: `「${completedTask.title}」を完了しました`,
      });
    },
    onError: (error: any) => {
      console.error('Task completion error:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクの完了に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
  });
}

export function useBulkCompleteTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskIds: string[]) => tasksService.bulkCompleteTasks(taskIds),
    onSuccess: (result: { tasks: Task[]; count: number }) => {
      // 今日のタスクキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['tasks', 'today'] });
      
      toast({
        title: `${result.count}件のタスクを完了しました`,
        description: "一括操作が完了しました",
      });
    },
    onError: (error: any) => {
      console.error('Bulk task completion error:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクの一括完了に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
  });
}