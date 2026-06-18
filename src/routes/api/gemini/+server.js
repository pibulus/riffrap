import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";
import { json } from "@sveltejs/kit";
import {
  getGeminiModel,
  getMaxUploadBytes,
  guardRequest,
} from "$lib/server/apiGuard";
import { applyTemplate, promptTemplates } from "$lib/services/promptTemplates";

const API_TIMEOUT_MS = 45_000;
const ALLOWED_AUDIO_MIME_TYPES = new Set([
  "audio/aac",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/x-wav",
]);

let genAI = null;
let model = null;

function getModel() {
  if (!model) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: getGeminiModel() });
  }

  return model;
}

function noStoreJson(body, init = {}) {
  return json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init.headers,
    },
  });
}

function normalizeMimeType(mimeType) {
  return mimeType.split(";")[0].trim().toLowerCase();
}

function isValidBase64(value) {
  return /^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length % 4 === 0;
}

function getPrompt(operation, promptStyle = "standard", variables = {}) {
  const style = promptTemplates[promptStyle] ? promptStyle : "standard";
  const template =
    promptTemplates[style]?.[operation] ||
    promptTemplates.standard?.[operation];

  if (!template?.text) {
    return null;
  }

  return applyTemplate(template.text, variables);
}

function withTimeout(promise) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error("Gemini request timed out");
      error.status = 504;
      reject(error);
    }, API_TIMEOUT_MS);
  });

  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timeoutId),
  );
}

async function withRetry(fn, { tries = 3, baseMs = 600 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = String(err?.message || err);
      const transient = /\b(503|429|overload|UNAVAILABLE|RESOURCE_EXHAUSTED)\b/i.test(msg);
      lastErr = err;
      if (!transient || i === tries - 1) throw err;
      await new Promise((r) => setTimeout(r, baseMs * 2 ** i));
    }
  }
  throw lastErr;
}

export async function POST(event) {
  try {
    const guardResponse = guardRequest(event);
    if (guardResponse) {
      return guardResponse;
    }

    const { request } = event;
    if (!env.GEMINI_API_KEY) {
      return noStoreJson(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    if (!request.headers.get("content-type")?.includes("application/json")) {
      return noStoreJson(
        { error: "Content-Type must be application/json" },
        { status: 415 },
      );
    }

    const contentLength = Number.parseInt(
      request.headers.get("content-length") || "0",
      10,
    );
    if (contentLength > getMaxUploadBytes() * 1.4) {
      return noStoreJson(
        { error: "Audio payload too large." },
        { status: 413 },
      );
    }

    const {
      operation = "transcribeAudio",
      promptStyle = "standard",
      variables = {},
      audioData,
      mimeType,
    } = await request.json();
    if (operation === "generateAnimation") {
      if (!dev) {
        return noStoreJson(
          { error: "Unsupported Gemini operation" },
          { status: 404 },
        );
      }

      const description = variables?.description;
      if (
        typeof description !== "string" ||
        !description.trim() ||
        description.length > 500
      ) {
        return noStoreJson(
          { error: "Invalid animation description" },
          { status: 400 },
        );
      }

      const prompt = getPrompt("generateAnimation", "standard", {
        description,
      });
      const result = await withTimeout(
        withRetry(() => getModel().generateContent(prompt)),
      );
      const response = await result.response;
      return noStoreJson({ text: response.text() });
    }

    if (operation !== "transcribeAudio") {
      return noStoreJson(
        { error: "Unsupported Gemini operation" },
        { status: 400 },
      );
    }

    if (
      typeof audioData !== "string" ||
      typeof mimeType !== "string" ||
      !audioData.trim() ||
      !mimeType.trim()
    ) {
      return noStoreJson(
        { error: "Invalid transcription payload" },
        { status: 400 },
      );
    }

    const normalizedMimeType = normalizeMimeType(mimeType);
    if (
      !ALLOWED_AUDIO_MIME_TYPES.has(normalizedMimeType) ||
      !isValidBase64(audioData)
    ) {
      return noStoreJson({ error: "Invalid audio payload" }, { status: 400 });
    }

    const maxUploadBytes = getMaxUploadBytes();
    const estimatedBytes = Math.ceil((audioData.length * 3) / 4);
    if (estimatedBytes > maxUploadBytes) {
      const mb = (maxUploadBytes / 1024 / 1024).toFixed(0);
      return noStoreJson(
        { error: `Audio payload too large. Maximum size is ${mb}MB.` },
        { status: 413 },
      );
    }

    const prompt = getPrompt(operation, promptStyle, variables);
    if (!prompt) {
      return noStoreJson(
        { error: "Invalid transcription style" },
        { status: 400 },
      );
    }

    const result = await withTimeout(
      withRetry(() =>
        getModel().generateContent([
          prompt,
          {
            inlineData: {
              data: audioData,
              mimeType: normalizedMimeType,
            },
          },
        ]),
      ),
    );

    const response = await result.response;
    return noStoreJson({ text: response.text() });
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    const message = error?.message?.toLowerCase?.() || "";
    let friendlyMessage = "Transcription failed. Please try again.";

    if (message.includes("quota")) {
      friendlyMessage = "API quota exceeded. Please try again later.";
    } else if (message.includes("api key")) {
      friendlyMessage = "Server configuration error: Gemini API key not set.";
    } else if (message.includes("origin")) {
      friendlyMessage = "This request is coming from an unexpected origin.";
    }

    return noStoreJson(
      { error: friendlyMessage },
      { status: error?.status || 500 },
    );
  }
}
