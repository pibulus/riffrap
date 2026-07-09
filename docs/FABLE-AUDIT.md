# Fable Audit — 2026-07-06

Launch-readiness audit-and-fix pass on branch `fable-audit-2026-07-06` (1
commit on top of `b84bebb`). This is RiffRap's first audit pass — its three
sibling apps (ziplist, talktype, daysay) were each audited on 2026-07-05.
Three read-only sweeps (server/security, core pipeline, docs/dead-code) +
manual verification of every finding before fixing.

`npm run build` ✅, `npm run lint` ✅ (prettier + eslint), plus a production
build smoke test (`/` 200, `/ghost-test` correctly 404s, security headers
present, bad-origin request correctly 403s).

Note: everything below landed in one commit (`7d43389`) rather than several —
a `git add -A` swept it all together before I split it out. The commit
message only describes the security-header work; this doc is the accurate
record of everything that changed.

---

## Findings and fixes (ranked by launch impact)

### 1. Missing security headers — the one real gap in an otherwise well-built API
Unlike its siblings, RiffRap's `/api/gemini` route (`src/lib/server/apiGuard.js`)
already had a **correctly-built** origin check + rate limiter using the right
Cloudflare header trust order (`cf-connecting-ip` first) — neither the
ziplist "one shared bucket" bug nor the talktype "spoofable XFF" bug applies
here. But there was no `src/hooks.server.js` at all, so no CSP, HSTS,
X-Frame-Options, or Referrer-Policy anywhere. Added one matching the fleet
pattern (scoped to RiffRap's actual origins — no PartyKit/live-share, so a
simpler `connect-src 'self'`).

### 2. Rate-limit Map had no eviction
`apiGuard.js`'s in-memory bucket Map could grow unbounded under a flood of
distinct keys (e.g. spoofed X-Forwarded-For when `cf-connecting-ip` is
somehow absent). Capped at 10k tracked keys, oldest-evicted — same pattern as
ziplist's rate limiter.

### 3. MediaRecorder had no bitrate cap or enforced duration limit
`AudioService_Recording.js` used the browser-default MediaRecorder bitrate
(~128kbps) with **no `audioBitsPerSecond` set anywhere**. Worse than ziplist's
equivalent bug: RiffRap sends audio as a **JSON base64 payload**
(`/api/gemini` reads `audioData` as a string), which inflates size ~33% on
top of the raw recording — and `BODY_SIZE_LIMIT` isn't set in production
env, so adapter-node's 512KB default applies. On top of that, the recording
timer UI displays `ANIMATION.RECORDING.LIMIT` (600 seconds) as a visual
countdown, but **nothing enforced it** — a user could keep talking past the
displayed cap indefinitely.

Fixed: 48kbps speech bitrate (same value as ziplist/talktype), plus a real
hard-stop timer wired through `audioService.js` → `AudioService_Recording.js`
that force-calls `stopRecording()` when `ANIMATION.RECORDING.LIMIT` is
reached, independent of whatever UI timer does or doesn't fire.

### 4. Console.log leaking user transcript/lyric content
Two lyrics stores (`lyricsStore.js`, `snippetStore.js`) logged the actual
snippet text on every add. Two DOM-fallback-chasing files
(`TranscriptDisplay_Notification.js`, `TranscriptDisplay_Selection.js`,
`SelectionButton.svelte` — ~35 call sites total) logged selected transcript
text and internal state-machine tracing unconditionally. These three read
like leftover debug scaffolding from building the multi-fallback "try the
button, then the parent container, then the global window trigger" collection
logic. Removed the two stray logs outright; gated the ~35 DOM-tracing logs
behind a local `debugLog()` (mirrors the existing `dev`-gated pattern already
used elsewhere in the codebase — RiffRap already has a proper
`loggerService.js` "safe for production" logger, these three files just
weren't using it).

### 5. Dead task-master CLI scaffolding — 389 packages removed
`scripts/dev.js` imported `./modules/commands.js`, **which does not exist in
the repo** — `npm run list`/`generate`/`parse-prd` would throw immediately on
invocation. It was leftover Task-Master AI-dev-tooling scaffolding, unrelated
to RiffRap itself. Verified zero references anywhere in `scripts/` or `src/`
for all 19 devDependencies it alone justified: `@anthropic-ai/sdk`, `boxen`,
`chalk`, `cli-table3`, `commander`, `cors`, `depcheck`, `express`, `fastmcp`,
`figlet`, `fuse.js`, `gradient-string`, `helmet`, `inquirer`, `jsonwebtoken`,
`lru-cache`, `openai`, `ora`, `purgecss`, `unimported`, `wrangler`. Confirmed
`sharp` (used by `scripts/generate-*-icons.js`) was NOT part of this cluster
and is kept. Deleted the script, the three broken npm scripts, and all 19
unused deps — `npm install` dropped 389 packages from `node_modules`.

---

## Deliberately left alone (and why)

- **`.env.example` / `BODY_SIZE_LIMIT` production config**: documented in
  KEYS.md as required, but the Pi was unreachable from this network during
  the audit (same as during ziplist's pass yesterday) — could not verify or
  set the live value. Treat as unset until confirmed.
- **Old Gemini SDK** (`@google/generative-ai` v0.21, not `@google/genai`):
  works fine as-is; migrating is a real but separate task, not launch-
  blocking, and riskier to do blind under time pressure.
- **`svgexport` import in an icon script**: `scripts/generate-*.js` imports
  `svgexport`, which isn't even in `package.json` — a separate pre-existing
  bug, unrelated to the task-master cluster, out of scope for this pass.
- **`response.text()` called with no structured fallback parser** (unlike
  ziplist's `responseParser.js`): functional today (errors surface as a
  generic "Transcription failed" via the route's catch-all), but a real
  robustness gap if Gemini starts returning safety-blocked/empty candidates
  more often. Worth porting ziplist's parser pattern in a future pass.
- **IntroModal missing an explicit Escape handler** (relies on native
  `<dialog>` behavior via `showModal()`): likely fine, not verified against a
  case where the dialog might be shown without `showModal()`.

## Verification

- `npm run build` — passes.
- `npm run lint` (prettier + eslint) — passes; was failing on baseline
  (2 files with prettier drift) before this pass, now clean.
- Production build smoke test: `/` → 200, `/ghost-test` → 404 (correctly
  gated by `dev` check, confirmed not shipped), security headers present on
  every response, a bad-origin POST to `/api/gemini` correctly 403s.
- Not run: real-device recording pass, actual long-recording-vs-body-limit
  test against a live deploy (needs `BODY_SIZE_LIMIT` set first).
