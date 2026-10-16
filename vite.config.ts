import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';
import { scrapeSpotify } from './src/lib/spotifyScraper.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function spotifyApiPlugin(): Plugin {
  return {
    name: 'spotify-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        const host = req.headers.host || 'localhost:3000';
        const parsedUrl = new URL(req.url, `http://${host}`);

        // Scrape endpoint
        if (parsedUrl.pathname === '/api/spotify' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const { url } = JSON.parse(body || '{}');
              if (!url) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Valid Spotify URL is required.' }));
                return;
              }
              const data = await scrapeSpotify(url);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, data }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Scrape failed.' }));
            }
          });
          return;
        }

        // Direct Download proxy endpoint
        if (parsedUrl.pathname === '/api/download' && req.method === 'GET') {
          const mediaUrl = parsedUrl.searchParams.get('url');
          const filename = parsedUrl.searchParams.get('filename') || 'spotify_track.mp3';

          if (!mediaUrl) {
            res.statusCode = 400;
            res.end('Missing media URL parameter');
            return;
          }

          try {
            const upstream = await fetch(mediaUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
              },
            });

            if (!upstream.ok) {
              res.statusCode = upstream.status;
              res.end(`Upstream server returned ${upstream.status}`);
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
            res.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
            const cl = upstream.headers.get('content-length');
            if (cl) res.setHeader('Content-Length', cl);

            if (upstream.body) {
              const reader = upstream.body.getReader();
              const pump = async () => {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    res.end();
                    break;
                  }
                  res.write(value);
                }
              };
              pump().catch(() => res.end());
            } else {
              const arrayBuf = await upstream.arrayBuffer();
              res.end(Buffer.from(arrayBuf));
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.end(`Download failed: ${err.message}`);
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), spotifyApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
