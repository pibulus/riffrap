# RiffRap Deployment Guide

## Quick Start

RiffRap uses `@sveltejs/adapter-static` and can be deployed to any static hosting provider.

### Build Output

```bash
npm run build
```

Output directory: `/build`

## Deployment Options

### Option 1: Cloudflare Pages (Recommended)

**Why Cloudflare Pages?**
- Free tier is generous
- Global CDN with excellent performance
- Zero-config HTTPS
- Great integration with GitHub

**Steps:**

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Connect your GitHub account
3. Select the `pibulus/riffrap` repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Output directory**: `build`
   - **Node version**: 20 or 22 (not 24)
5. Add environment variable:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
6. Deploy!

**Custom Domain:**
- Add `riffrap.app` in Cloudflare Pages settings
- Update DNS records as instructed

### Option 2: Netlify

1. Go to [Netlify](https://netlify.com/)
2. Connect your GitHub account
3. Select the `pibulus/riffrap` repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
5. Add environment variable:
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: Your Gemini API key
6. Deploy!

### Option 3: GitHub Pages

1. Build locally: `npm run build`
2. Install gh-pages: `npm install -D gh-pages`
3. Add to package.json scripts:
   ```json
   "deploy": "gh-pages -d build"
   ```
4. Deploy: `npm run deploy`

**Note:** GitHub Pages requires a different approach for environment variables (not recommended for production with API keys).

### Option 4: Any Static Host

The `/build` directory contains a complete static site that works on:
- Surge: `surge build riffrap.surge.sh`
- Vercel (as static): Connect repo and configure static adapter
- Any CDN or web server

## Environment Variables

**Required:**
- `VITE_GEMINI_API_KEY` - Your Google Gemini API key

**Important:** Environment variables prefixed with `VITE_` are exposed to the client. Only use API keys that are safe for client-side use. The Gemini API key has usage quotas to prevent abuse.

## Post-Deployment

### Testing Checklist

- [ ] Recording works (microphone permissions)
- [ ] Transcription generates text
- [ ] Ghost animations working
- [ ] Mobile responsive
- [ ] PWA installable
- [ ] SEO metadata present (check view-source)
- [ ] Performance (Lighthouse score 85+)

### Domain Setup

If using custom domain `riffrap.app`:

1. Update DNS records (depends on host)
2. Wait for DNS propagation (5-30 minutes)
3. Verify SSL certificate is active
4. Test: `https://riffrap.app`

## Troubleshooting

### Build Fails

**Node version mismatch:**
- Use Node 20 or 22 (not 24)
- Set in deployment platform settings

**Missing dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variable Not Working

- Ensure it's prefixed with `VITE_`
- Check deployment platform environment variable settings
- Rebuild after adding environment variables
- Clear browser cache

### API Key Issues

- Verify key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Check quota limits
- Ensure key is active (not disabled)

### Static Assets Not Loading

- Check `svelte.config.js` has correct adapter settings
- Ensure paths are relative (not absolute)
- Verify `/build` directory structure after build

## CI/CD (Optional)

For automatic deployments on git push:

**Cloudflare Pages**: Auto-deploys on push to master (built-in)
**Netlify**: Auto-deploys on push to master (built-in)
**GitHub Actions**: See `.github/workflows/deploy.yml` (if configured)

## Performance Optimization

Already implemented:
- ✅ Static adapter (no server-side rendering)
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Optimized images
- ✅ Minified assets
- ✅ Hardware-accelerated animations

## Security Notes

- API key is exposed client-side (by design for Gemini API)
- No server-side secrets required
- HTTPS enforced on all modern platforms
- No user authentication (stateless app)

## Maintenance

**Update deployed app:**
1. Push changes to GitHub
2. Deployment platform auto-rebuilds (if configured)
3. Or manually trigger rebuild in platform dashboard

**Monitor usage:**
- Check Gemini API quota at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Monitor deployment platform analytics
