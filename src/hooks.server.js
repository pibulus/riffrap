// Content-Security-Policy for RiffRap.
// - script-src allows 'unsafe-inline' because SvelteKit injects an inline
//   hydration bootstrap; tighten to nonces only if we move to kit.csp.
// - img-src allows data:/blob: for canvas confetti + generated waveform art.
// - media-src allows blob: for recorded-audio playback.
// - style-src/font-src must name the Google Fonts origins. app.html loads
//   DM Sans, Quicksand and Recursive from fonts.googleapis.com, and until
//   2026-07-31 the CSP blocked that stylesheet outright: document.fonts was
//   empty and every glyph in the app silently fell back to ui-sans-serif.
//   The two origins are separate on purpose — googleapis.com serves the
//   @font-face CSS, gstatic.com serves the actual woff2 files, so allowing
//   only the first still leaves the fonts unloadable.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://fleetcount.pibulus.deno.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "media-src 'self' blob:",
  "connect-src 'self' https://fleetcount.pibulus.deno.net",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

/**
 * Apply baseline security headers to a response. Shared so that both the normal
 * resolve() chain and out-of-chain error responses get the same protection.
 * @param {Response} response
 */
function applySecurityHeaders(response) {
  response.headers.set("Content-Security-Policy", CSP);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "microphone=(self), camera=(), geolocation=(), payment=()",
  );
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event);

  applySecurityHeaders(response);

  return response;
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
  const details =
    error instanceof Error
      ? `${error.name}: ${error.message}\n${error.stack ?? ""}`
      : String(error);

  process.stderr.write(
    `Server-side error on ${event.url.pathname}\n${details}\n`,
  );

  return {
    message: "Internal Server Error",
  };
}
