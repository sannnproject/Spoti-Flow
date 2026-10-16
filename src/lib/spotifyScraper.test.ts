import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSpotifyUrl, parseMetadata, sanitizeFilename } from './spotifyScraper.ts';

test('validateSpotifyUrl correctly validates Spotify track URL', () => {
  const result = validateSpotifyUrl('https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=abc123xyz');
  assert.equal(result.isValid, true);
  assert.equal(result.type, 'track');
  assert.equal(result.cleanedUrl, 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT');
});

test('validateSpotifyUrl identifies non-track Spotify types (playlist)', () => {
  const result = validateSpotifyUrl('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M');
  assert.equal(result.isValid, false);
  assert.equal(result.type, 'playlist');
  assert.match(result.error || '', /playlist/i);
});

test('validateSpotifyUrl parses spotify:track: URI', () => {
  const result = validateSpotifyUrl('spotify:track:4cOdK2wGLETKBW3PvgPWqT');
  assert.equal(result.isValid, true);
  assert.equal(result.type, 'track');
  assert.equal(result.cleanedUrl, 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT');
});

test('validateSpotifyUrl rejects non-Spotify URLs', () => {
  const result = validateSpotifyUrl('https://youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(result.isValid, false);
  assert.match(result.error || '', /not from Spotify/i);
});

test('validateSpotifyUrl rejects empty input', () => {
  const result = validateSpotifyUrl('');
  assert.equal(result.isValid, false);
});

test('parseMetadata safely unpacks base64 JSON', () => {
  const sample = { name: 'Song Title', artist: 'Artist Name', album: 'Greatest Hits' };
  const base64Str = Buffer.from(JSON.stringify(sample)).toString('base64');
  const parsed = parseMetadata(base64Str);
  assert.equal(parsed.name, 'Song Title');
  assert.equal(parsed.artist, 'Artist Name');
});

test('parseMetadata handles malformed base64 without throwing', () => {
  const result = parseMetadata('!!!not-base-64!!!');
  assert.deepEqual(result, {});
});

test('sanitizeFilename produces clean, safe filenames across OSes', () => {
  const filename = sanitizeFilename('Song / Title: "Special"?', 'AC/DC', 'mp3');
  assert.equal(filename, 'ACDC - Song Title Special.mp3');
  assert.doesNotMatch(filename, /[<>:"/\\|?*]/);
});
