# RiffRap Deployment Guide

## Quick Start

RiffRap uses `@sveltejs/adapter-cloudflare` because transcription runs through a
server route at `/api/gemini`. The Gemini key must stay server-side.

```bash
npm run build
```

## Cloudflare Pages

1. Connect the GitHub repo to Cloudflare Pages.
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.svelte-kit/cloudflare`
   - Node version: 20 or 22
3. Add environment variables:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL=gemini-3.1-flash-lite-preview`
   - `ALLOWED_ORIGINS=https://riffrap.app`
   - `API_RATE_LIMIT=10`
   - `API_RATE_WINDOW_MS=60000`
   - `MAX_UPLOAD_BYTES=15728640`
4. Deploy and test `https://riffrap.app/api/gemini` only through the app flow.

Do not use `VITE_GEMINI_API_KEY`. `VITE_` variables are client-exposed and are
not appropriate for the Gemini API key.

## Other Hosts

Use a server-capable SvelteKit adapter for any non-Cloudflare host. Pure static
hosting such as GitHub Pages or a plain CDN will not support `/api/gemini`.

## Post-Deployment Checks

- Recording permission opens and releases the mic indicator after stop.
- Transcription generates text through `/api/gemini`.
- `ALLOWED_ORIGINS` blocks unexpected origins in production.
- PWA install metadata is valid.
- SEO metadata and OG image render correctly.
- Lighthouse performance remains acceptable.

## Security Notes

- Keep `GEMINI_API_KEY` server-side only.
- Rotate any Gemini key that was ever shipped as `VITE_GEMINI_API_KEY`.
- Set Cloudflare rate limiting for `/api/gemini` in addition to app-level limits.
- Do not cache `/api/gemini`, audio payloads, or transcription responses.
