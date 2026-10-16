export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.query?.url as string;
  const filename = (req.query?.filename as string) || 'track.mp3';

  if (!url) {
    return res.status(400).send('Missing media URL parameter');
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send(`Upstream server returned ${upstream.status}`);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
    const cl = upstream.headers.get('content-length');
    if (cl) res.setHeader('Content-Length', cl);

    const arrayBuf = await upstream.arrayBuffer();
    return res.status(200).send(Buffer.from(arrayBuf));
  } catch (err: any) {
    return res.status(500).send(`Download failed: ${err.message}`);
  }
}
