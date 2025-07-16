import ky, { type KyInstance, type Options } from 'ky';
import type { ApiResponse, ApiError } from '@otaku-secretary/shared';

export class ApiClient {
  private client: KyInstance;

  constructor(baseURL: string = '/api') {
    this.client = ky.create({
      prefixUrl: baseURL,
      timeout: 30000,
      credentials: 'include', // HTTPOnly cookiesを送信するため
      headers: {
        'Content-Type': 'application/json'
      },
      hooks: {
        beforeError: [
          error => {
            const { response } = error;
            if (response) {
              // APIエラーレスポンスの詳細を追加
              error.name = 'ApiError';
              error.message = `API Error: ${response.status} ${response.statusText}`;
            }
            return error;
          }
        ]
      }
    });
  }

  async get<T>(url: string, options?: Options): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, options);
      return await response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, options?: Options): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, {
        ...options,
        json: data
      });
      return await response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, options?: Options): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, {
        ...options,
        json: data
      });
      return await response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any, options?: Options): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(url, {
        ...options,
        json: data
      });
      return await response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, options?: Options): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url, options);
      return await response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError<T>(error: any): ApiResponse<T> {
    console.error('API Client Error:', error);
    
    // ネットワークエラーの場合
    if (!error.response) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'ネットワークエラーが発生しました。接続を確認してください。'
        }
      };
    }

    // HTTPエラーレスポンスの場合
    const status = error.response.status;
    let errorMessage = 'エラーが発生しました。';
    let errorCode = 'UNKNOWN_ERROR';

    switch (status) {
      case 400:
        errorCode = 'BAD_REQUEST';
        errorMessage = '入力内容に問題があります。';
        break;
      case 401:
        errorCode = 'UNAUTHORIZED';
        errorMessage = '認証が必要です。再度ログインしてください。';
        break;
      case 403:
        errorCode = 'FORBIDDEN';
        errorMessage = 'アクセス権限がありません。';
        break;
      case 404:
        errorCode = 'NOT_FOUND';
        errorMessage = 'リソースが見つかりません。';
        break;
      case 429:
        errorCode = 'RATE_LIMIT';
        errorMessage = 'リクエストが多すぎます。しばらく待ってから再試行してください。';
        break;
      case 500:
        errorCode = 'INTERNAL_ERROR';
        errorMessage = 'サーバーエラーが発生しました。';
        break;
      default:
        errorCode = `HTTP_${status}`;
        errorMessage = `エラーが発生しました (${status})`;
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage
      }
    };
  }
}

// デフォルトのAPIクライアントインスタンス
export const apiClient = new ApiClient();