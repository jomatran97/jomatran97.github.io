import { createServer, type Server } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

/** Minimal static file server for `dist/` (directory index, 404.html fallback). */
export function serve(dir: string, port = 0): Promise<{ server: Server; url: string }> {
  const root = resolve(dir);
  const server = createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
    let file = join(root, normalize(pathname));
    if (!file.startsWith(root)) return void res.writeHead(403).end();
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      const notFound = await readFile(join(root, '404.html')).catch(() => 'Not found');
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }).end(notFound);
    }
  });
  return new Promise((ok) =>
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      ok({
        server,
        url: `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : port}`,
      });
    }),
  );
}

// `tsx scripts/static-server.ts [dir] [port]` serves a directory (used by the Playwright webServer).
if (process.argv[1]?.endsWith('static-server.ts')) {
  const { url } = await serve(process.argv[2] ?? 'dist', Number(process.argv[3] ?? 4321));
  console.log(`Serving at ${url}`);
}
