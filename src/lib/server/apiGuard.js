import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const rateLimitBuckets = new Map();

function toPositiveInt(value, fallback) {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getClientKey(event) {
	const forwarded = event.request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}

	return event.getClientAddress?.() || 'unknown';
}

function isAllowedOrigin(origin) {
	const allowedOrigins = (env.ALLOWED_ORIGINS || '')
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean);

	if (allowedOrigins.length === 0 || !origin) {
		return true;
	}

	return allowedOrigins.includes(origin);
}

export function getGeminiModel() {
	return env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview';
}

export function getMaxUploadBytes() {
	return toPositiveInt(env.MAX_UPLOAD_BYTES, 15 * 1024 * 1024);
}

export function guardRequest(event) {
	const origin = event.request.headers.get('origin');
	if (!isAllowedOrigin(origin)) {
		return json(
			{ error: 'This request is coming from an unexpected origin.' },
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
		return null;
	}

	if (bucket.count >= rateLimit) {
		return json(
			{ error: 'Too many transcription attempts. Please wait a moment.' },
			{ status: 429 },
		);
	}

	bucket.count += 1;
	return null;
}
