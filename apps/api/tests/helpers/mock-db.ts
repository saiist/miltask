import { vi } from 'vitest';

// Mock database result
export function mockDbResult<T>(data: T | T[] | null) {
  return {
    get: vi.fn().mockResolvedValue(Array.isArray(data) ? data[0] : data),
    all: vi.fn().mockResolvedValue(Array.isArray(data) ? data : [data]),
    run: vi.fn().mockResolvedValue({ success: true }),
  };
}

// Create mock D1 database
export function createMockDb() {
  const mockResults = new Map<string, any>();
  
  return {
    prepare: vi.fn((query: string) => {
      const bind = vi.fn().mockReturnThis();
      const get = vi.fn().mockImplementation(async () => {
        const key = `${query}`;
        return mockResults.get(key)?.[0] || null;
      });
      const all = vi.fn().mockImplementation(async () => {
        const key = `${query}`;
        return mockResults.get(key) || [];
      });
      const run = vi.fn().mockResolvedValue({ success: true });
      
      return { bind, get, all, run };
    }),
    batch: vi.fn().mockResolvedValue([]),
    dump: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    exec: vi.fn().mockResolvedValue(null),
    
    // Helper methods for testing
    setMockData: (query: string, data: any) => {
      mockResults.set(query, data);
    },
    clearMockData: () => {
      mockResults.clear();
    },
  };
}

// Create mock Drizzle instance
export function createMockDrizzle() {
  const mockData = new Map<string, any[]>();
  const insertedData = new Map<string, any>();
  const callSequence: any[] = [];
  let sequenceIndex = 0;
  
  // Create a chainable query builder
  const createQueryBuilder = (operation: string = 'select', initialData?: any[]) => {
    let currentData = initialData || mockData.get(operation) || [];
    
    const queryBuilder: any = {
      from: vi.fn((table: any) => {
        // Get data based on the table if available
        const tableData = mockData.get(operation) || currentData;
        currentData = tableData;
        return queryBuilder;
      }),
      where: vi.fn((condition: any) => {
        // For testing, we don't filter - just return all data
        return queryBuilder;
      }),
      orderBy: vi.fn((order: any) => {
        return queryBuilder;
      }),
      limit: vi.fn((limit: number) => {
        currentData = currentData.slice(0, limit);
        return queryBuilder;
      }),
      offset: vi.fn((offset: number) => {
        currentData = currentData.slice(offset);
        return queryBuilder;
      }),
      innerJoin: vi.fn(() => queryBuilder),
      leftJoin: vi.fn(() => queryBuilder),
      
      // Execute methods
      execute: vi.fn(async () => {
        // Use sequence-based data if available
        if (callSequence.length > 0 && sequenceIndex < callSequence.length) {
          const result = callSequence[sequenceIndex];
          sequenceIndex++;
          return result;
        }
        return currentData;
      }),
      get: vi.fn(async () => {
        // Use sequence-based data if available
        if (callSequence.length > 0 && sequenceIndex < callSequence.length) {
          const result = callSequence[sequenceIndex];
          sequenceIndex++;
          return Array.isArray(result) ? result[0] || null : result;
        }
        return currentData[0] || null;
      }),
      all: vi.fn(async () => {
        // Use sequence-based data if available
        if (callSequence.length > 0 && sequenceIndex < callSequence.length) {
          const result = callSequence[sequenceIndex];
          sequenceIndex++;
          return Array.isArray(result) ? result : [result];
        }
        return currentData;
      }),
      
      // Allow the builder to be awaited directly
      then: (resolve: any, reject: any) => {
        // Use sequence-based data if available
        if (callSequence.length > 0 && sequenceIndex < callSequence.length) {
          const result = callSequence[sequenceIndex];
          sequenceIndex++;
          return Promise.resolve(Array.isArray(result) ? result : [result]).then(resolve, reject);
        }
        return Promise.resolve(currentData).then(resolve, reject);
      },
    };
    
    return queryBuilder;
  };
  
  const drizzleInstance: any = {
    select: vi.fn((columns?: any) => {
      return createQueryBuilder('select');
    }),
    
    insert: vi.fn((table: any) => ({
      values: vi.fn(async (values: any) => {
        const valueArray = Array.isArray(values) ? values : [values];
        const results = valueArray.map((v: any) => {
          const id = v.id || crypto.randomUUID();
          const newData = { ...v, id };
          insertedData.set(id, newData);
          return newData;
        });
        return { rows: results };
      }),
    })),
    
    update: vi.fn((table: any) => ({
      set: vi.fn((values: any) => ({
        where: vi.fn(async (condition: any) => {
          return { rowsAffected: 1 };
        }),
      })),
    })),
    
    delete: vi.fn((table: any) => ({
      where: vi.fn(async (condition: any) => {
        return { rowsAffected: 1 };
      }),
    })),
    
    // Helper methods for testing
    setMockData: (operation: string, data: any[]) => {
      mockData.set(operation, data);
    },
    setMockSequence: (sequence: any[]) => {
      callSequence.length = 0;
      callSequence.push(...sequence);
      sequenceIndex = 0;
    },
    clearMockData: () => {
      mockData.clear();
      insertedData.clear();
      callSequence.length = 0;
      sequenceIndex = 0;
    },
    getInsertedData: (id: string) => insertedData.get(id),
  };
  
  return drizzleInstance;
}