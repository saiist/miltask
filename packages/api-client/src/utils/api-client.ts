import ky, { type KyInstance, type Options } from 'ky';

export class ApiClient {
  private client: KyInstance;

  constructor(baseURL: string = '') {
    this.client = ky.create({
      prefixUrl: baseURL,
      timeout: 30000,
      credentials: 'include', // HTTPOnly cookiesを送信するため
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async get(url: string, options?: Options): Promise<any> {
    const response = await this.client.get(url, options);
    return response.json();
  }

  async post(url: string, data?: any, options?: Options): Promise<any> {
    const response = await this.client.post(url, {
      ...options,
      json: data
    });
    return response.json();
  }

  async put(url: string, data?: any, options?: Options): Promise<any> {
    const response = await this.client.put(url, {
      ...options,
      json: data
    });
    return response.json();
  }

  async patch(url: string, data?: any, options?: Options): Promise<any> {
    const response = await this.client.patch(url, {
      ...options,
      json: data
    });
    return response.json();
  }

  async delete(url: string, options?: Options): Promise<any> {
    const response = await this.client.delete(url, options);
    return response.json();
  }
}

// デフォルトのAPIクライアントインスタンス
export const apiClient = new ApiClient();