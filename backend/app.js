const http = require('http');
const os = require('os');
const client = require('prom-client');

const PORT = process.env.PORT || 80;

// ── Prometheus metrics ───────────────────────────────────────────────────────
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2],
  registers: [register],
});

// ── HTTP Server ──────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const start = Date.now();

  res.setHeader('Access-Control-Allow-Origin', '*');

  // Metrics endpoint — no instrumentar esta ruta
  if (req.url === '/metrics') {
    res.setHeader('Content-Type', register.contentType);
    res.writeHead(200);
    res.end(await register.metrics());
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  let status = 200;

  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      service: 'jfc-backend',
      hostname: os.hostname(),
      environment: process.env.APP_ENV || 'dev',
      timestamp: new Date().toISOString(),
    }));
  } else if (req.url === '/api/products' || req.url === '/products') {
    res.writeHead(200);
    res.end(JSON.stringify({
      products: [
        { id: 1, name: 'Laptop Pro', price: 1299.99, stock: 50 },
        { id: 2, name: 'Mouse Inalámbrico', price: 29.99, stock: 200 },
        { id: 3, name: 'Teclado Mecánico', price: 89.99, stock: 75 },
      ],
    }));
  } else {
    status = 404;
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  const duration = (Date.now() - start) / 1000;
  const path = req.url.split('?')[0];

  httpRequestsTotal.inc({ method: req.method, path, status });
  httpRequestDuration.observe({ method: req.method, path }, duration);
});

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
