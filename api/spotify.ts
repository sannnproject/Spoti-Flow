import { scrapeSpotify, validateSpotifyUrl } from '../src/lib/spotifyScraper.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid Spotify URL is required.' });
    }

    const validation = validateSpotifyUrl(url);
    if (!validation.isValid && validation.error && !url.includes('spotify.link')) {
      return res.status(400).json({ error: validation.error });
    }

    const data = await scrapeSpotify(url);
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error('Spotify API error:', err);
    return res.status(500).json({ error: err.message || 'Scraping failed.' });
  }
}
