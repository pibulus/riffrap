import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

let genAI = null;
let model = null;

function getModel() {
	if (!model) {
		genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
		model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
	}

	return model;
}

export async function POST({ request }) {
	try {
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
		return json({ error: 'Transcription failed. Please try again.' }, { status: 500 });
	}
}
