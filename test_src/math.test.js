// test/app.test.js
const { addNumbers } = require('../src/math');
const http = require('http');
const { createServer } = require('../src/index');

describe('addNumbers function', () => {
  test('should correctly add two numbers', () => {
    expect(addNumbers(1, 2)).toBe(3);
  });

  test('should throw an error if non-numeric values are passed', () => {
    expect(() => addNumbers(1, 'a')).toThrow('Both arguments must be numbers');
  });

  test('should return negative values correctly', () => {
    expect(addNumbers(-5, -3)).toBe(-8);
  });

  test('should handle floating-point numbers correctly', () => {
    expect(addNumbers(0.1, 0.2)).toBeCloseTo(0.3);
  });
});

describe('HTTP Server', () => {
  let server;
  const PORT = 3000;

  beforeAll((done) => {
    server = createServer();
    server.listen(PORT, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  function makeRequest(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${PORT}${path}`, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, data });
        });
      }).on('error', reject);
    });
  }

  test('should return correct sum for valid numbers', async () => {
    const response = await makeRequest('/add?num1=5&num2=3');
    expect(response.statusCode).toBe(200);
    expect(response.data).toBe('The sum of 5 and 3 is 8');
  });

  test('should handle negative numbers', async () => {
    const response = await makeRequest('/add?num1=-5&num2=-3');
    expect(response.statusCode).toBe(200);
    expect(response.data).toBe('The sum of -5 and -3 is -8');
  });

  test('should handle floating-point numbers', async () => {
    const response = await makeRequest('/add?num1=0.1&num2=0.2');
    expect(response.statusCode).toBe(200);
    expect(response.data).toBe('The sum of 0.1 and 0.2 is 0.30000000000000004');
  });

  test('should return 400 for missing parameters', async () => {
    const response = await makeRequest('/add?num1=5');
    expect(response.statusCode).toBe(400);
    expect(response.data).toBe('Please provide two numbers as query parameters: num1 and num2');
  });

  test('should return 400 for invalid numbers', async () => {
    const response = await makeRequest('/add?num1=5&num2=abc');
    expect(response.statusCode).toBe(400);
    expect(response.data).toBe('Both query parameters must be valid numbers.');
  });

  test('should return 404 for invalid path', async () => {
    const response = await makeRequest('/invalid');
    expect(response.statusCode).toBe(404);
    expect(response.data).toBe('Not Found');
  });
});