// Jest setup file for Zod generator tests

// Mock console.warn to avoid noise in tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  // Only suppress warnings about invalid regex patterns
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Invalid regex pattern')) {
    return;
  }
  originalWarn(...args);
};

// Global test timeout
jest.setTimeout(10000);

// Mock performance API if not available
if (typeof performance === 'undefined') {
  (global as any).performance = {
    now: () => Date.now()
  };
} 