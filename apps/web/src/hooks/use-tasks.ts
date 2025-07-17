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
    onMutate: async (taskData: TaskCreateInput) => {
      // キャンセル可能な進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['tasks', 'today'] });
      
      // 前の状態をスナップショット
      const previousTasks = queryClient.getQueryData<TodayTasksResponse>(['tasks', 'today']);
      
      // 一時的なIDを生成（楽観的更新用）
      const tempId = `temp-${Date.now()}`;
      const optimisticTask: Task = {
        id: tempId,
        userId: 'temp-user', // 実際のユーザーIDは後でサーバーが設定
        title: taskData.title,
        description: taskData.description || null,
        type: taskData.type,
        priority: taskData.priority || 'medium',
        deadline: taskData.deadline || null,
        completed: false,
        source: 'manual',
        externalId: null,
        metadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      // 楽観的更新を実行
      queryClient.setQueryData<TodayTasksResponse>(['tasks', 'today'], (old) => {
        if (!old) {
          return {
            tasks: [optimisticTask],
            summary: {
              total: 1,
              completed: 0,
              completionRate: 0
            }
          };
        }
        
        const newTasks = [...old.tasks, optimisticTask];
        const completedCount = newTasks.filter(t => t.completed).length;
        const completionRate = Math.round((completedCount / newTasks.length) * 100);
        
        return {
          ...old,
          tasks: newTasks,
          summary: {
            total: newTasks.length,
            completed: completedCount,
            completionRate
          }
        };
      });
      
      // 成功した場合のトーストを即座に表示
      toast({
        title: "タスクを作成しました",
        description: `「${taskData.title}」を追加しました`,
      });
      
      // 前の状態を返して、エラー時にロールバックできるようにする
      return { previousTasks, tempId };
    },
    onError: (error: any, _taskData: TaskCreateInput, context: any) => {
      // エラー時は前の状態にロールバック
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', 'today'], context.previousTasks);
      }
      
      console.error('Task creation error:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクの作成に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // 成功・失敗に関わらず、最終的にサーバーからデータを再取得
      queryClient.invalidateQueries({ queryKey: ['tasks', 'today'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksService.completeTask(taskId),
    onMutate: async (taskId: string) => {
      // キャンセル可能な進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['tasks', 'today'] });
      
      // 前の状態をスナップショット
      const previousTasks = queryClient.getQueryData<TodayTasksResponse>(['tasks', 'today']);
      
      // 楽観的更新を実行
      queryClient.setQueryData<TodayTasksResponse>(['tasks', 'today'], (old) => {
        if (!old) return old;
        
        const updatedTasks = old.tasks.map((task) => 
          task.id === taskId 
            ? { ...task, completed: true, updatedAt: Date.now() }
            : task
        );
        
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const completionRate = Math.round((completedCount / updatedTasks.length) * 100);
        
        return {
          ...old,
          tasks: updatedTasks,
          summary: {
            ...old.summary,
            completed: completedCount,
            completionRate
          }
        };
      });
      
      // 成功した場合のトーストを即座に表示
      const task = previousTasks?.tasks.find(t => t.id === taskId);
      if (task) {
        toast({
          title: "タスクを完了しました",
          description: `「${task.title}」を完了しました`,
        });
      }
      
      // 前の状態を返して、エラー時にロールバックできるようにする
      return { previousTasks };
    },
    onError: (error: any, _taskId: string, context: any) => {
      // エラー時は前の状態にロールバック
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', 'today'], context.previousTasks);
      }
      
      console.error('Task completion error:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクの完了に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // 成功・失敗に関わらず、最終的にサーバーからデータを再取得
      queryClient.invalidateQueries({ queryKey: ['tasks', 'today'] });
    },
  });
}

export function useBulkCompleteTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskIds: string[]) => tasksService.bulkCompleteTasks(taskIds),
    onMutate: async (taskIds: string[]) => {
      // キャンセル可能な進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['tasks', 'today'] });
      
      // 前の状態をスナップショット
      const previousTasks = queryClient.getQueryData<TodayTasksResponse>(['tasks', 'today']);
      
      // 楽観的更新を実行
      queryClient.setQueryData<TodayTasksResponse>(['tasks', 'today'], (old) => {
        if (!old) return old;
        
        const updatedTasks = old.tasks.map((task) => 
          taskIds.includes(task.id)
            ? { ...task, completed: true, updatedAt: Date.now() }
            : task
        );
        
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const completionRate = Math.round((completedCount / updatedTasks.length) * 100);
        
        return {
          ...old,
          tasks: updatedTasks,
          summary: {
            ...old.summary,
            completed: completedCount,
            completionRate
          }
        };
      });
      
      // 成功した場合のトーストを即座に表示
      toast({
        title: `${taskIds.length}件のタスクを完了しました`,
        description: "一括操作が完了しました",
      });
      
      // 前の状態を返して、エラー時にロールバックできるようにする
      return { previousTasks };
    },
    onError: (error: any, _taskIds: string[], context: any) => {
      // エラー時は前の状態にロールバック
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', 'today'], context.previousTasks);
      }
      
      console.error('Bulk task completion error:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクの一括完了に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // 成功・失敗に関わらず、最終的にサーバーからデータを再取得
      queryClient.invalidateQueries({ queryKey: ['tasks', 'today'] });
    },
  });
}