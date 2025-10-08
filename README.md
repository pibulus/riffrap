# 🟪 Riff Rap

> Freestyle-ready lyric scrapbook.  
> You riff the bars — we fill the gaps.  
> Gibberish in, killer lines out.

---

## What is this?

Riff Rap is a web app for snapping down lyrics from your voice — line by line, riff by riff.  
You talk, mumble, freestyle, rant — whatever gets the spark going.

As the words come out, they land in a text box. If something hits, you **grab** it. If it doesn't, you **re-roll**. If you collect enough good ones, you can rearrange them, edit, and copy or download the result.

It's especially good for when you're half-singing, half-thinking — testing ideas, rhythms, phrasing.  
Even when you're just mumbling gibberish, Riff Rap tries to **meet you halfway**.  
It fills in the gaps, makes sense of the nonsense, and helps you catch what was almost there.

It's not about getting it right. It's about getting it *out*.

---

## What it does

- 🔵 Turns your vocal gibberish into usable lyric ideas  
- 🟣 Snap the lines that feel good  
- 🟢 Re-roll the ones that don't until they make sense  
- 🟡 Test rhythms, flows, and melodies without committing  
- 🟠 Rearrange, edit, compile, and export when it's feeling right  

That's it. No more, no less. It gets out of your way.

---

## Why?

Because mumble-to-meaningful is where the magic happens.  
Because sometimes you need to make a mess to find the line.  
Because your best vocal ideas often come from half-formed thoughts and rhythms.

It's a bridge between your voice's raw energy and words that actually work.

---

## How it works

1. **Speak** — Mumble, freestyle, or just make sounds with rhythm
2. **Snap** — Riff Rap intelligently interprets your vocal patterns
3. **Refine** — Keep re-rolling until the gibberish becomes gold
4. **Arrange** — Drag, edit, and compile your best lines
5. **Export** — Take your lyrics anywhere

The rougher, the better — Riff Rap thrives on turning vocal chaos into lyrical order.

---

## Built With

- **SvelteKit** – Reactive UI with minimal overhead
- **Tailwind CSS + DaisyUI** – For the SoftStack™ design aesthetic
- **Google Gemini API** – AI-powered voice transcription that understands context
- **Custom Audio Visualizer** – So you know when you're being heard
- **PWA-ready** – Install as an app on any device
- **Brain-friendly UX** – Designed for creative flow states

---

## Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/pibulus/riffrap.git
   cd riffrap
   npm install
   ```

2. **Add your Gemini API key:**
   Create a `.env` file in the project root:
   ```bash
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey)

3. **Start development server:**
   ```bash
   npm run dev
   # or open in browser automatically
   npm run dev -- --open
   ```

## Building & Deployment

Riff Rap uses a static adapter and can be deployed to any static hosting provider:

```bash
npm run build
```

The built app outputs to the `/build` directory.

### Deploy to Cloudflare Pages (Recommended)

1. Connect your GitHub repo to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variable: `VITE_GEMINI_API_KEY`

### Deploy to Netlify

1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`
4. Add environment variable: `VITE_GEMINI_API_KEY`

### Other Static Hosts

The `/build` directory contains a complete static site that works on:
- GitHub Pages
- Surge
- Vercel (as static)
- Any CDN or static file server

---

## Fueled by

Mezcal, churros, tramadol and the B-52s

---

## License

Riff Rap Proprietary License – All rights reserved. Personal use is permitted, but commercial use requires explicit permission. See LICENSE file for details.