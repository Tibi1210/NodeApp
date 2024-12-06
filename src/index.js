// src/index.js
const http = require('http');
const url = require('url');
const { addNumbers, subtractNumbers, multiplyNumbers, divideNumbers } = require('./math');
const promClient = require('prom-client');

// Create a Registry to store metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'mathapp_'
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code']
});

const calculationErrors = new promClient.Counter({
  name: 'calculation_errors_total',
  help: 'Total number of calculation errors',
  labelNames: ['error_type']
});

const calculationTotal = new promClient.Counter({
  name: 'calculations_total',
  help: 'Total number of calculations performed',
});

const calculationDuration = new promClient.Histogram({
  name: 'calculation_duration_seconds',
  help: 'Duration of calculation operations in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});

const concurrentRequests = new promClient.Gauge({
  name: 'http_concurrent_requests',
  help: 'Number of concurrent HTTP requests'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(calculationErrors);
register.registerMetric(calculationTotal);
register.registerMetric(calculationDuration);
register.registerMetric(concurrentRequests);

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {

  const startTime = process.hrtime();

  const endTimer = (statusCode) => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds + nanoseconds / 1e9;
    const path = url.parse(req.url).pathname;
    
    httpRequestDuration
      .labels(req.method, path, statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, path, statusCode)
      .inc();
  };

  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const { pathname, query } = url.parse(req.url, true);
  console.log(`Requested path: ${pathname}`);

  var { num1, num2} = {};
  var parsedNum1;
  var parsedNum2;
  var resolution;
  var startCalculation;
  var [calcSeconds, calcNanoseconds] = [];
  var calcDuration;

  // Add metrics endpoint
  if (pathname === '/metrics' && req.method === 'GET') {
    console.log('/metrics endpoint called.');
    res.setHeader('Content-Type', register.contentType);
    try {
      const metrics = await register.metrics();
      res.writeHead(200);
      res.end(metrics);
      console.log('metrics set correctly');
      endTimer(200);
      return;
    } catch (error) {
      res.writeHead(500);
      res.end('Error collecting metrics');
      console.error('error occured while collecting metrics');
      endTimer(500);
      return;
    }
  }

  if (pathname === '/add' && req.method === 'GET') {
    console.log('/add endpoint called.');
    ({ num1, num2 } = query);
    
    if (!num1 || !num2) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Please provide two numbers as query parameters: num1 and num2');
      calculationErrors.labels('missing_parameters').inc();
      endTimer(400);
      console.error('bad query parameters at /add endpoint');
      return;
    }

    parsedNum1 = parseFloat(num1);
    parsedNum2 = parseFloat(num2);

    if (isNaN(parsedNum1) || isNaN(parsedNum2)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Both query parameters must be valid numbers.');
      calculationErrors.labels('invalid_number').inc();
      endTimer(400);
      console.error('no valid numbers at /add endpoint');
      return;
    }

    startCalculation = process.hrtime();
    try {
      resolution = addNumbers(parsedNum1, parsedNum2);
      [calcSeconds, calcNanoseconds] = process.hrtime(startCalculation);
      calcDuration = calcSeconds + calcNanoseconds / 1e9;
      calculationDuration.labels('add').observe(calcDuration);
      calculationTotal.inc();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`The sum of ${parsedNum1} and ${parsedNum2} is ${resolution}`);
      endTimer(200);
      console.log(`The sum of ${parsedNum1} and ${parsedNum2} is ${resolution}`);
    } catch (error) {
      calculationErrors.labels('calculation_error').inc();
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('An error occurred while processing your request.');
      endTimer(500);
      console.error('An error occurred while processing your request.');
    }
  } 
  
  if (pathname === '/sub' && req.method === 'GET') {
    console.log('/sub endpoint called.');
    ({ num1, num2 } = query);
    
    if (!num1 || !num2) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Please provide two numbers as query parameters: num1 and num2');
      calculationErrors.labels('missing_parameters').inc();
      endTimer(400);
      console.error('bad query parameters at /sub endpoint');
      return;
    }

    parsedNum1 = parseFloat(num1);
    parsedNum2 = parseFloat(num2);

    if (isNaN(parsedNum1) || isNaN(parsedNum2)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Both query parameters must be valid numbers.');
      calculationErrors.labels('invalid_number').inc();
      endTimer(400);
      console.error('no valid numbers at /sub endpoint');
      return;
    }

    startCalculation = process.hrtime();
    try {
      resolution = subtractNumbers(parsedNum1, parsedNum2);
      [calcSeconds, calcNanoseconds] = process.hrtime(startCalculation);
      calcDuration = calcSeconds + calcNanoseconds / 1e9;
      calculationDuration.labels('sub').observe(calcDuration);
      calculationTotal.inc();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`The difference of ${parsedNum1} and ${parsedNum2} is ${resolution}`);
      endTimer(200);
      console.log(`The difference of ${parsedNum1} and ${parsedNum2} is ${resolution}`);
    } catch (error) {
      calculationErrors.labels('calculation_error').inc();
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('An error occurred while processing your request.');
      console.error('An error occurred while processing your request.');
      endTimer(500);
    }
  } 

  if (pathname === '/mul' && req.method === 'GET') {
    console.log('/mul endpoint called.');
    ({ num1, num2 } = query);
    
    if (!num1 || !num2) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Please provide two numbers as query parameters: num1 and num2');
      calculationErrors.labels('missing_parameters').inc();
      endTimer(400);
      console.error('bad query parameters at /mul endpoint');
      return;
    }

    parsedNum1 = parseFloat(num1);
    parsedNum2 = parseFloat(num2);

    if (isNaN(parsedNum1) || isNaN(parsedNum2)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Both query parameters must be valid numbers.');
      calculationErrors.labels('invalid_number').inc();
      endTimer(400);
      console.error('no valid numbers at /mul endpoint');
      return;
    }

    startCalculation = process.hrtime();
    try {
      resolution = multiplyNumbers(parsedNum1, parsedNum2);
      [calcSeconds, calcNanoseconds] = process.hrtime(startCalculation);
      calcDuration = calcSeconds + calcNanoseconds / 1e9;
      calculationDuration.labels('mul').observe(calcDuration);
      calculationTotal.inc();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`The product of ${parsedNum1} and ${parsedNum2} is ${resolution}`);
      endTimer(200);
      console.log(`The product of ${parsedNum1} and ${parsedNum2} is ${resolution}`);
    } catch (error) {
      calculationErrors.labels('calculation_error').inc();
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('An error occurred while processing your request.');
      endTimer(500);
      console.error('An error occurred while processing your request.');
    }
  } 

  if (pathname === '/div' && req.method === 'GET') {
    console.log('/div endpoint called.');
    ({ num1, num2 } = query);
    
    if (!num1 || !num2) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Please provide two numbers as query parameters: num1 and num2');
      calculationErrors.labels('missing_parameters').inc();
      endTimer(400);
      console.error('bad query parameters at /div endpoint');
      return;
    }

    parsedNum1 = parseFloat(num1);
    parsedNum2 = parseFloat(num2);

    if (isNaN(parsedNum1) || isNaN(parsedNum2)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Both query parameters must be valid numbers.');
      calculationErrors.labels('invalid_number').inc();
      endTimer(400);
      console.error('no valid numbers at /div endpoint');
      return;
    }

    startCalculation = process.hrtime();
    try {
      resolution = divideNumbers(parsedNum1, parsedNum2);
      [calcSeconds, calcNanoseconds] = process.hrtime(startCalculation);
      calcDuration = calcSeconds + calcNanoseconds / 1e9;
      calculationDuration.labels('div').observe(calcDuration);
      calculationTotal.inc();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`The quotient of ${parsedNum1} and ${parsedNum2} is ${resolution}`);
      endTimer(200);
      console.log(`The quotient of ${parsedNum1} and ${parsedNum2} is ${resolution}`);
    } catch (error) {
      calculationErrors.labels('calculation_error').inc();
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('An error occurred while processing your request.');
      endTimer(500);
      console.error('An error occurred while processing your request.');
    }
  } 
  
  if (pathname !== '/metrics' && pathname !== '/add' && pathname !== '/sub' && pathname !== '/mul' && pathname !== '/div') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    endTimer(404);
  }
}).on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

server.on('request', (req, res) => {
  concurrentRequests.inc();
  res.on('finish', () => {
    concurrentRequests.dec();
  });
});

function createServer() {
  return server;
}

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}

module.exports = { createServer };