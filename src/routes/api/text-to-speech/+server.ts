import OpenAI from 'openai';
import { logger } from '$lib/server/utils';
import { OPENAI_API_KEY } from '$lib/server/secrets';

export async function POST({ request, locals }) {
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
	logger.info({
		type: 'OpenAI Request',
		model,
		requestId,
		user: locals.user
	});
	const audioResponse = await openai.audio.speech.create({
		input,
		voice,
		model
	});

	if (audioResponse.status !== 200) {
		logger.error({
			type: 'OpenAI Error',
			error: audioResponse
		});
		return new Response('OpenAI error.', { status: 500 });
	}

	const bodyBlob = await audioResponse.blob();
	const body = await bodyBlob.arrayBuffer();

	return new Response(body, {
		status: 200,
		headers: {
			'Content-Type': `audio/${format}`,
			'Content-Disposition': `attachment; filename="audio.${format}"`
		}
	});
}
