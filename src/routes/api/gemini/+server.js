import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { getGeminiModel, getMaxUploadBytes, guardRequest } from '$lib/server/apiGuard';

let genAI = null;
let model = null;

function getModel() {
	if (!model) {
		genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
		model = genAI.getGenerativeModel({ model: getGeminiModel() });
	}

	return model;
}

export async function POST(event) {
	try {
		const guardResponse = guardRequest(event);
		if (guardResponse) {
			return guardResponse;
		}

		const { request } = event;
		if (!env.GEMINI_API_KEY) {
			return json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
		}

		const { prompt, audioData, mimeType } = await request.json();
		if (
			typeof prompt !== 'string' ||
			typeof audioData !== 'string' ||
			typeof mimeType !== 'string' ||
			!prompt.trim() ||
			!audioData.trim() ||
			!mimeType.trim()
		) {
			return json({ error: 'Invalid transcription payload' }, { status: 400 });
		}

		const maxUploadBytes = getMaxUploadBytes();
		const estimatedBytes = Math.ceil((audioData.length * 3) / 4);
		if (estimatedBytes > maxUploadBytes) {
			const mb = (maxUploadBytes / 1024 / 1024).toFixed(0);
			return json({ error: `Audio payload too large. Maximum size is ${mb}MB.` }, { status: 413 });
		}

		const result = await getModel().generateContent([
			prompt,
			{
				inlineData: {
					data: audioData,
					mimeType
				}
			}
		]);

		const response = await result.response;
		return json({ text: response.text() });
	} catch (error) {
		console.error('Error in Gemini API route:', error);
		const message = error?.message?.toLowerCase?.() || '';
		let friendlyMessage = 'Transcription failed. Please try again.';

		if (message.includes('quota')) {
			friendlyMessage = 'API quota exceeded. Please try again later.';
		} else if (message.includes('api key')) {
			friendlyMessage = 'Server configuration error: Gemini API key not set.';
		} else if (message.includes('origin')) {
			friendlyMessage = 'This request is coming from an unexpected origin.';
		}

		return json({ error: friendlyMessage }, { status: error?.status || 500 });
	}
}
