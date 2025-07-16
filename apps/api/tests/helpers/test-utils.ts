import { Hono } from 'hono';
import type { Env } from '../../src/routes';
import type { User, Session } from 'lucia';
import { createMockDb } from './mock-db';

// Mock user for testing
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
};

// Mock session for testing
export const mockSession: Session = {
  id: 'test-session-id',
  userId: mockUser.id,
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
};

// Create test app with mocked environment
export function createTestApp() {
  const app = new Hono<{ Bindings: Env; Variables: { user: User | null; session: Session | null } }>();
  
  // Mock environment with proper D1 database mock
  const mockEnv: Env = {
    DB: createMockDb() as any,
    CACHE: {} as KVNamespace,
    ENVIRONMENT: 'test',
  };

  // Middleware to inject mock environment
  app.use('*', async (c, next) => {
    c.env = mockEnv;
    await next();
  });

  return { app, mockEnv };
}

// Mock auth middleware that always authenticates
export const mockAuthMiddleware = async (c: any, next: any) => {
  c.set('user', mockUser);
  c.set('session', mockSession);
  await next();
};

// Mock auth middleware that always fails
export const mockAuthMiddlewareFail = async (c: any, next: any) => {
  return c.json({ error: '認証が必要です' }, 401);
};

// Helper to create request with auth headers
export function createAuthRequest(method: string, path: string, body?: any) {
  const request = new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'auth_session=test-session-id',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return request;
}