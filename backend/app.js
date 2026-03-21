const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 80;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      service: 'jfc-backend',
      hostname: os.hostname(),
      environment: process.env.APP_ENV || 'dev',
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/api/products' || req.url === '/products') {
    res.writeHead(200);
    res.end(JSON.stringify({
      products: [
        { id: 1, name: 'Laptop Pro', price: 1299.99, stock: 50 },
        { id: 2, name: 'Mouse Inalámbrico', price: 29.99, stock: 200 },
        { id: 3, name: 'Teclado Mecánico', price: 89.99, stock: 75 }
      ]
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
