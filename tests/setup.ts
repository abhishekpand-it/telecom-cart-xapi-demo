// Jest setup file for global test configuration

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console.log in tests to reduce noise
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
});