import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";

const rateLimitBuckets = new Map();

// Hard cap on tracked keys so a flood of unique IPs (e.g. spoofed
// X-Forwarded-For values when cf-connecting-ip is absent) can't grow the Map
// without bound. Map preserves insertion order, so oldest-first eviction.
const MAX_RATE_LIMIT_BUCKETS = 10_000;

function evictOldestBucketsIfNeeded() {
  if (rateLimitBuckets.size <= MAX_RATE_LIMIT_BUCKETS) return;
  const overflow = rateLimitBuckets.size - MAX_RATE_LIMIT_BUCKETS;
  let removed = 0;
  for (const key of rateLimitBuckets.keys()) {
    rateLimitBuckets.delete(key);
    if (++removed >= overflow) break;
  }
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getClientKey(event) {
  const cloudflareIp = event.request.headers.get("cf-connecting-ip");
  if (cloudflareIp) {
    return cloudflareIp.trim();
  }

  const forwarded = event.request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return event.getClientAddress?.() || "unknown";
}

function isAllowedOrigin(event) {
  const origin = event.request.headers.get("origin");
  if (!origin) {
    return dev;
  }

  // Same-origin is always allowed — no env var to forget on deploy.
  // Compare hosts, not full origins, so an http/https proxy hop can't 403 us.
  try {
    if (new URL(origin).host === event.url.host) {
      return true;
    }
  } catch {
    return false;
  }

  // ALLOWED_ORIGINS is only for extra origins (staging domains, etc).
  return (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .includes(origin);
}

export function getGeminiModel() {
  return env.GEMINI_MODEL || "gemini-flash-lite-latest";
}

export function getMaxUploadBytes() {
  return toPositiveInt(env.MAX_UPLOAD_BYTES, 15 * 1024 * 1024);
}

export function guardRequest(event) {
  if (!isAllowedOrigin(event)) {
    return json(
      { error: "This request is coming from an unexpected origin." },
      { status: 403 },
    );
  }

  const rateLimit = toPositiveInt(env.API_RATE_LIMIT, 10);
  const rateWindowMs = toPositiveInt(env.API_RATE_WINDOW_MS, 60_000);
  const clientKey = getClientKey(event);
  const now = Date.now();
  const bucket = rateLimitBuckets.get(clientKey);

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(clientKey, {
      count: 1,
      resetAt: now + rateWindowMs,
    });
    evictOldestBucketsIfNeeded();
    return null;
  }

  if (bucket.count >= rateLimit) {
    return json(
      { error: "Too many transcription attempts. Please wait a moment." },
      { status: 429 },
    );
  }

  bucket.count += 1;
  return null;
}
