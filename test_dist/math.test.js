const { addNumbers, subtractNumbers, multiplyNumbers, divideNumbers } = require('../dist/math');
const http = require('http');
const { createServer } = require('../dist/index');

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

describe('subtractNumbers function', () => {
  test('should correctly subtract two numbers', () => {
    expect(subtractNumbers(5, 3)).toBe(2);
  });

  test('should throw an error if non-numeric values are passed', () => {
    expect(() => subtractNumbers(5, 'a')).toThrow('Both arguments must be numbers');
  });

  test('should return negative values correctly', () => {
    expect(subtractNumbers(-5, -3)).toBe(-2);
  });

  test('should handle floating-point numbers correctly', () => {
    expect(subtractNumbers(0.3, 0.1)).toBeCloseTo(0.2);
  });
});

describe('multiplyNumbers function', () => {
  test('should correctly multiply two numbers', () => {
    expect(multiplyNumbers(2, 3)).toBe(6);
  });

  test('should throw an error if non-numeric values are passed', () => {
    expect(() => multiplyNumbers(2, 'a')).toThrow('Both arguments must be numbers');
  });

  test('should handle negative numbers correctly', () => {
    expect(multiplyNumbers(-2, 3)).toBe(-6);
  });

  test('should handle floating-point numbers correctly', () => {
    expect(multiplyNumbers(0.2, 0.5)).toBeCloseTo(0.1);
  });
});

describe('divideNumbers function', () => {
  test('should correctly divide two numbers', () => {
    expect(divideNumbers(6, 3)).toBe(2);
  });

  test('should throw an error if non-numeric values are passed', () => {
    expect(() => divideNumbers(6, 'a')).toThrow('Both arguments must be numbers');
  });

  test('should handle negative numbers correctly', () => {
    expect(divideNumbers(-6, 3)).toBe(-2);
  });

  test('should handle floating-point numbers correctly', () => {
    expect(divideNumbers(0.4, 0.2)).toBe(2);
  });

  test('should throw an error for division by zero', () => {
    expect(() => divideNumbers(6, 0)).toThrow('Division by zero is not allowed');
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

  test('should handle negative numbers in addition', async () => {
    const response = await makeRequest('/add?num1=-5&num2=-3');
    expect(response.statusCode).toBe(200);
    expect(response.data).toBe('The sum of -5 and -3 is -8');
  });

  test('should return correct difference for valid numbers', async () => {
    const response = await makeRequest('/sub?num1=5&num2=3');
    expect(response.statusCode).toBe(200);
    expect(response.data).toBe('The difference of 5 and 3 is 2');
  });

  test('should handle negative numbers in subtraction', async () => {
    const response = await makeRequest('/sub?num1=-5&num2=-3');
    expect(response.statusCode).toBe(200);
    expect(response.data).toBe('The difference of -5 and -3 is -2');
  });

  test('should return correct product for valid numbers', async () => {
    const response = await makeRequest('/mul?num1=2&num2=3');
    expect(response.statusCode).toBe(200);
    expect(response.data).toBe('The product of 2 and 3 is 6');
  });

  test('should handle negative numbers in multiplication', async () => {
    const response = await makeRequest('/mul?num1=-2&num2=3');
    expect(response.statusCode).toBe(200);
    expect(response.data).toBe('The product of -2 and 3 is -6');
  });

  test('should return correct quotient for valid numbers', async () => {
    const response = await makeRequest('/div?num1=6&num2=3');
    expect(response.statusCode).toBe(200);
    expect(response.data).toBe('The quotient of 6 and 3 is 2');
  });

  test('should handle negative numbers in division', async () => {
    const response = await makeRequest('/div?num1=-6&num2=3');
    expect(response.statusCode).toBe(200);
    expect(response.data).toBe('The quotient of -6 and 3 is -2');
  });

  test('should return 400 for missing parameters in division', async () => {
    const response = await makeRequest('/div?num1=6');
    expect(response.statusCode).toBe(400);
    expect(response.data).toBe('Please provide two numbers as query parameters: num1 and num2');
  });

  test('should return 400 for invalid numbers in division', async () => {
    const response = await makeRequest('/div?num1=6&num2=abc');
    expect(response.statusCode).toBe(400);
    expect(response.data).toBe('Both query parameters must be valid numbers.');
  });

  test('should return 404 for invalid path', async () => {
    const response = await makeRequest('/invalid');
    expect(response.statusCode).toBe(404);
    expect(response.data).toBe('Not Found');
  });
});
