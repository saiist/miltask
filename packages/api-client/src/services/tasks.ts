import { apiClient } from '../utils/api-client';

export interface TaskCreateInput {
  type: 'anime' | 'game-daily' | 'book-release';
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  deadline?: string; // ISO datetime string
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  deadline?: string;
  completed?: boolean;
}

export interface TasksQuery {
  type?: 'anime' | 'game-daily' | 'book-release';
  completed?: boolean;
  date?: string; // YYYY-MM-DD format
  limit?: number;
  offset?: number;
}

export interface TodayTasksResponse {
  tasks: Task[];
  summary: {
    total: number;
    completed: number;
    completionRate: number;
  };
}

export interface Task {
  id: string;
  userId: string;
  type: 'anime' | 'game-daily' | 'book-release';
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  deadline: string | null;
  completed: boolean;
  source: 'manual' | 'recurring' | 'external';
  externalId: string | null;
  metadata: any;
  createdAt: number;
  updatedAt: number;
}

export class TasksService {
  /**
   * 今日のタスク取得
   */
  async getTodayTasks(): Promise<TodayTasksResponse> {
    const response = await apiClient.get('api/tasks/today');
    return response;
  }

  /**
   * タスク一覧取得（フィルタ可）
   */
  async getTasks(query?: TasksQuery): Promise<{ tasks: Task[]; pagination: any }> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    
    const url = params.toString() ? `api/tasks?${params.toString()}` : 'api/tasks';
    const response = await apiClient.get(url);
    return response;
  }

  /**
   * タスク作成
   */
  async createTask(taskData: TaskCreateInput): Promise<Task> {
    const response = await apiClient.post('api/tasks', taskData);
    return response;
  }

  /**
   * タスク更新
   */
  async updateTask(id: string, taskData: TaskUpdateInput): Promise<Task> {
    const response = await apiClient.put(`api/tasks/${id}`, taskData);
    return response;
  }

  /**
   * タスク削除
   */
  async deleteTask(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`api/tasks/${id}`);
    return response;
  }

  /**
   * タスク完了
   */
  async completeTask(id: string): Promise<Task> {
    const response = await apiClient.post(`api/tasks/${id}/complete`);
    return response;
  }

  /**
   * 複数タスクの一括完了
   */
  async bulkCompleteTasks(taskIds: string[]): Promise<{ tasks: Task[]; count: number }> {
    const response = await apiClient.post('api/tasks/bulk-complete', { taskIds });
    return response;
  }
}

export const tasksService = new TasksService();