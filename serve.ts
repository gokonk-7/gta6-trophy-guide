// Neon Leonida — local static server for development and testing.
// Serves app/ at its root on http://localhost:8080 . Node 22, stdlib only.
// Usage: node serve.ts  (then open http://localhost:8080/ in desktop Chrome)

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(join(fileURLToPath(import.meta.url), '..', 'app'));
const PORT = 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = rawPath === '/' ? 'index.html' : rawPath.replace(/^\/+/, '');
  const file = resolve(join(appDir, normalize(rel)));
  if (!file.startsWith(appDir + '/') && file !== appDir) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  if (!existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found: ' + rawPath);
    return;
  }
  const type = TYPES[extname(file)] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': type });
  res.end(readFileSync(file));
});

server.listen(PORT, () => {
  console.log('Neon Leonida serving app/ at http://localhost:' + PORT + '/');
});
