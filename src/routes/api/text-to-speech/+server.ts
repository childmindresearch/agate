import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$lib/server/secrets.js';
import { logger } from '$lib/server/utils';

export async function POST({ request }) {
	const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

	const formData = await request.formData();
	const input = formData.get('text') as string;
	const voice = formData.get('voice') as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
	const model = formData.get('model') as string;
	const format = formData.get('format') as 'mp3' | 'flac' | 'opus' | 'aac';

	if (!input || !voice || !model) {
		return new Response('Missing input.', { status: 422 });
	}

	const requestId = request.headers.get('X-Request-ID');
	const user = request.headers.get('X-User');
	logger.info({
		type: 'OpenAI Request',
		model,
		requestId,
		user
	});
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
