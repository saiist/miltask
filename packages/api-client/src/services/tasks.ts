import { apiClient } from '../utils/api-client';
import type { 
  Task,
  TaskListResponse,
  ApiResponse
} from '@otaku-secretary/shared';

export interface TaskCreateInput {
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
}

export interface TaskUpdateInput extends Partial<TaskCreateInput> {
  completed?: boolean;
}

export interface TasksQuery {
  page?: number;
  limit?: number;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
  search?: string;
}

export class TasksService {
  /**
   * タスク一覧取得
   */
  async getTasks(query?: TasksQuery): Promise<ApiResponse<TaskListResponse>> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    
    const url = params.toString() ? `tasks?${params.toString()}` : 'tasks';
    return apiClient.get<TaskListResponse>(url);
  }

  /**
   * タスク詳細取得
   */
  async getTask(id: string): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`tasks/${id}`);
  }

  /**
   * タスク作成
   */
  async createTask(taskData: TaskCreateInput): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>('tasks', taskData);
  }

  /**
   * タスク更新
   */
  async updateTask(id: string, taskData: TaskUpdateInput): Promise<ApiResponse<Task>> {
    return apiClient.put<Task>(`tasks/${id}`, taskData);
  }

  /**
   * タスク削除
   */
  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`tasks/${id}`);
  }

  /**
   * タスク完了/未完了切り替え
   */
  async toggleTask(id: string): Promise<ApiResponse<Task>> {
    return apiClient.patch<Task>(`tasks/${id}/toggle`);
  }

  /**
   * 複数タスクの一括操作
   */
  async bulkUpdateTasks(ids: string[], updates: TaskUpdateInput): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('tasks/bulk', { ids, updates });
  }

  /**
   * タスクカテゴリ一覧取得
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('tasks/categories');
  }
}

export const tasksService = new TasksService();