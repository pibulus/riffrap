/**
 * In-app browser detection + human copy for microphone failures.
 *
 * Written 2026-07-31 from real user feedback on TalkType (same family, same
 * bug): someone opened a link straight from Messenger, pressed record, and
 * nothing happened. They assumed the button was broken. It wasn't — Messenger's
 * embedded webview does not grant getUserMedia.
 *
 * RiffRap hits the identical wall in AudioService_Platform.requestPermissions(),
 * which throws UIError("MediaDevices API not available") with the code
 * ERR_AUDIO_MEDIADEVICES_UNSUPPORTED. Nothing maps that code to human copy, so
 * whatever surfaces it shows either the developer string or nothing at all —
 * and either way the person is left tapping a button that cannot work.
 *
 * UA sniffing is normally a smell. Here it is the only signal available: the
 * embedded browser reports no mic and there is no API that says "you are inside
 * an app". It is used ONLY to make a message more specific, never to gate
 * anything — if detection misses, the generic copy is still actionable.
 *
 * Copy follows the RiffRap voice rules: statements, never imperatives aimed at
 * the user, and never speaking as the user.
 */

// Ordered most-specific first: Messenger and Instagram user agents also carry
// the Facebook FBAN/FBAV tokens, so a naive FBAN check would label everything
// "Facebook" and point people at the wrong app's menu.
const IN_APP_BROWSERS = [
  { pattern: /FB_IAB\/MESSENGER|Messenger/i, name: "Messenger" },
  { pattern: /Instagram/i, name: "Instagram" },
  { pattern: /FBAN|FBAV|FB_IAB/i, name: "Facebook" },
  { pattern: /TikTok|musical_ly|BytedanceWebview/i, name: "TikTok" },
  { pattern: /LinkedInApp/i, name: "LinkedIn" },
  { pattern: /Snapchat/i, name: "Snapchat" },
  { pattern: /\bLine\//i, name: "LINE" },
  { pattern: /Twitter|TwitterAndroid/i, name: "X" },
  { pattern: /Pinterest/i, name: "Pinterest" },
  { pattern: /Reddit/i, name: "Reddit" },
];

/**
 * Name the in-app browser we appear to be inside, if any.
 * @param {string} [userAgent] - override, for tests
 * @returns {string|null}
 */
export function getInAppBrowserName(userAgent) {
  const ua =
    userAgent ??
    (typeof navigator === "undefined" ? "" : navigator.userAgent || "");
  if (!ua) return null;

  for (const { pattern, name } of IN_APP_BROWSERS) {
    if (pattern.test(ua)) return name;
  }
  return null;
}

/**
 * True when this environment cannot reach a microphone at all. Checked before
 * the UA list because it is the only authoritative signal — an in-app browser
 * nobody has heard of still fails this test.
 * @returns {boolean}
 */
export function isRecordingUnsupported() {
  if (typeof navigator === "undefined") return false;
  return !navigator.mediaDevices?.getUserMedia;
}

/**
 * Copy for an environment that cannot reach the mic at all. Names the offending
 * app where possible, because "open it in your browser" is much easier to act
 * on when you know which app you are escaping.
 * @returns {string}
 */
export function getUnsupportedBrowserMessage() {
  const app = getInAppBrowserName();
  return app
    ? `${app}'s built-in browser blocks the mic. RiffRap works in Safari or Chrome.`
    : "This browser blocks mic access. RiffRap works in Safari or Chrome.";
}

/**
 * Human copy for a recording failure. Never returns a raw Error message, and
 * never suggests retrying something that cannot succeed in this browser.
 * @param {unknown} error
 * @returns {string}
 */
export function getMicErrorMessage(error) {
  // First, because the in-app browser case throws a bare Error with no .name
  // and would otherwise fall through to generic retry advice that can't work.
  if (isRecordingUnsupported()) {
    return getUnsupportedBrowserMessage();
  }

  switch (error?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "RiffRap needs mic permission before it can listen.";
    case "NotFoundError":
      return "No microphone turned up on this device.";
    case "NotReadableError":
      return "The mic is busy in another app.";
    case "OverconstrainedError":
      return "The mic didn't take those settings.";
    case "AbortError":
      return "The mic request was interrupted.";
    default:
      return "Recording needs one more try.";
  }
}
