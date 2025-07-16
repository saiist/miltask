import { vi } from 'vitest';

// Mock crypto.randomUUID for test environment
if (!global.crypto) {
  global.crypto = {} as any;
}
Object.defineProperty(global.crypto, 'randomUUID', {
  value: vi.fn(() => `test-uuid-${Date.now()}`),
  writable: true,
  configurable: true,
});

// Mock console to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};