export interface SpotifyTrackDownload {
  mp3: string | null;
  coverHd: string | null;
}

export interface SpotifyTrackResult {
  id: string | null;
  title: string;
  artist: string;
  album: string;
  duration: string;
  releaseYear: number | string | null;
  cover: string | null;
  download: SpotifyTrackDownload;
}

export interface UrlValidationResult {
  isValid: boolean;
  type: 'track' | 'playlist' | 'album' | 'artist' | 'unknown';
  cleanedUrl: string;
  error?: string;
}

const BASE = 'https://spotidown.app';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

/**
 * Validates and normalizes user input into a canonical Spotify track URL.
 */
export function validateSpotifyUrl(input: string): UrlValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      type: 'unknown',
      cleanedUrl: '',
      error: 'Please enter a Spotify URL',
    };
  }

  const trimmed = input.trim();

  // Handle Spotify URI format (e.g. spotify:track:4cOdK2wGLETKBW3PvgPWqT)
  if (trimmed.startsWith('spotify:')) {
    const parts = trimmed.split(':');
    const type = parts[1];
    const id = parts[2];
    if (type && id) {
      const url = `https://open.spotify.com/${type}/${id}`;
      return {
        isValid: type === 'track',
        type: (type as 'track' | 'playlist' | 'album' | 'artist') || 'unknown',
        cleanedUrl: url,
        error: type !== 'track' ? `This downloader currently specializes in single tracks. Detected ${type}.` : undefined,
      };
    }
  }

  // Handle standard HTTP URLs
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.toLowerCase();

    const isSpotifyHost =
      host === 'open.spotify.com' ||
      host === 'spotify.com' ||
      host === 'spotify.link' ||
      host.endsWith('.spotify.com');

    if (!isSpotifyHost) {
      return {
        isValid: false,
        type: 'unknown',
        cleanedUrl: trimmed,
        error: 'URL is not from Spotify. Please paste a link from open.spotify.com or spotify.link.',
      };
    }

    // Determine type from path
    const pathSegments = parsed.pathname.split('/').filter(Boolean);
    let detectedType: 'track' | 'playlist' | 'album' | 'artist' | 'unknown' = 'unknown';

    if (pathSegments.includes('track')) {
      detectedType = 'track';
    } else if (pathSegments.includes('playlist')) {
      detectedType = 'playlist';
    } else if (pathSegments.includes('album')) {
      detectedType = 'album';
    } else if (pathSegments.includes('artist')) {
      detectedType = 'artist';
    } else if (host === 'spotify.link') {
      // Shortened link, could be track
      detectedType = 'track';
    }

    // Strip tracking parameters (e.g., ?si=...&utm_source=...)
    const cleanUrl = `${parsed.origin}${parsed.pathname}`;

    if (detectedType !== 'track') {
      return {
        isValid: false,
        type: detectedType,
        cleanedUrl: cleanUrl,
        error: `Only individual track links are currently supported. Detected ${detectedType}. Please copy the link of a single track.`,
      };
    }

    return {
      isValid: true,
      type: 'track',
      cleanedUrl: cleanUrl,
    };
  } catch {
    return {
      isValid: false,
      type: 'unknown',
      cleanedUrl: trimmed,
      error: 'Invalid URL format.',
    };
  }
}

export function parseMetadata(dataVal: string): Record<string, any> {
  try {
    if (typeof Buffer !== 'undefined') {
      return JSON.parse(Buffer.from(dataVal, 'base64').toString('utf8'));
    }
    // Browser fallback
    return JSON.parse(atob(dataVal));
  } catch {
    return {};
  }
}

/**
 * Executes the 2-step scrape request to spotidown.app to extract metadata and direct media download links.
 */
export async function scrapeSpotify(url: string): Promise<SpotifyTrackResult> {
  const validation = validateSpotifyUrl(url);
  if (!validation.isValid && validation.error && !url.includes('spotify.link')) {
    throw new Error(validation.error);
  }

  const targetUrl = validation.cleanedUrl || url;

  const step1Res = await fetch(`${BASE}/action`, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Origin': BASE,
      'Referer': `${BASE}/`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      url: targetUrl,
      'g-recaptcha-response': '',
    }),
  });

  if (!step1Res.ok) {
    throw new Error(`Failed to fetch Spotify track info (${step1Res.status} ${step1Res.statusText})`);
  }

  const step1Json = await step1Res.json();
  if (step1Json.error) {
    throw new Error(step1Json.message || 'Failed to extract Spotify track metadata. The track might be private or region-restricted.');
  }

  const rawCookies = (step1Res.headers as any).getSetCookie
    ? (step1Res.headers as any).getSetCookie()
    : [step1Res.headers.get('set-cookie')];
  const cookieHeader = (rawCookies || []).filter(Boolean).map((c: string) => c.split(';')[0]).join('; ');

  const html1 = step1Json.data ?? '';
  const dataVal = html1.match(/name="data" value=[\x27"]([^\x27"]+)[\x27"]/)?.[1];
  const baseVal = html1.match(/name="base" value=[\x27"]([^\x27"]+)[\x27"]/)?.[1];
  const tokenVal = html1.match(/name="token" value=[\x27"]([^\x27"]+)[\x27"]/)?.[1];

  if (!dataVal || !tokenVal) {
    throw new Error('Failed to parse track tokens from the upstream server. Please try again.');
  }

  const meta = parseMetadata(dataVal);

  const step2Res = await fetch(`${BASE}/action/track`, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Origin': BASE,
      'Referer': `${BASE}/`,
      'Cookie': cookieHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      data: dataVal,
      base: baseVal ?? targetUrl,
      token: tokenVal,
    }),
  });

  if (!step2Res.ok) {
    throw new Error(`Failed to generate download link (${step2Res.status} ${step2Res.statusText})`);
  }

  const step2Json = await step2Res.json();
  if (step2Json.error) {
    throw new Error(step2Json.message || 'Failed to generate download link from track tokens.');
  }

  const html2 = step2Json.data ?? '';
  const mp3Match = html2.match(/<a[^>]+href="([^"]+)"[^>]*>\s*<span><span>Download Mp3<\/span><\/span>/i);
  const coverMatch = html2.match(/<a[^>]+href="([^"]+)"[^>]*>\s*<span><span>Download Cover[^<]*<\/span><\/span>/i);

  return {
    id: meta.tid ?? null,
    title: meta.name ?? 'Unknown Title',
    artist: meta.artist ?? 'Unknown Artist',
    album: meta.album ?? '',
    duration: meta.duration ?? '',
    releaseYear: meta.date ?? null,
    cover: meta.cover ?? null,
    download: {
      mp3: mp3Match ? mp3Match[1] : null,
      coverHd: coverMatch ? coverMatch[1] : null,
    },
  };
}

/**
 * Sanitizes a filename for cross-platform file saving.
 */
export function sanitizeFilename(title: string, artist?: string, ext = 'mp3'): string {
  const base = artist ? `${artist} - ${title}` : title;
  const cleaned = base
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
  return `${cleaned || 'Spotify-Track'}.${ext.replace(/^\./, '')}`;
}
