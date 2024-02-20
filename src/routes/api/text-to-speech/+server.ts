import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$lib/server/secrets.js';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST({ request }) {
	const formData = await request.formData();
	const input = formData.get('text') as string;
	const voice = formData.get('voice') as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
	const model = formData.get('model') as string;
	const format = formData.get('format') as 'mp3' | 'flac' | 'opus' | 'aac';

	if (!input || !voice || !model) {
		return new Response('Missing input.', { status: 422 });
	}

	const audio = await openai.audio.speech.create({
		input,
		voice,
		model
	});

	const bodyBlob = await audio.blob();
	const body = await bodyBlob.arrayBuffer();

	return new Response(body, {
		status: 200,
		headers: {
			'Content-Type': `audio/${format}`,
			'Content-Disposition': `attachment; filename="audio.${format}"`
		}
	});
}
