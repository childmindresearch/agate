import { getAzureOpenAiClient } from '$lib/server/azure';
import { logger } from '$lib/server/utils';
import { AZURE_OPENAI_GPT_DEPLOYMENT_NAME } from '$lib/server/secrets';
import type { Message } from '$lib/chat.svelte.js';

export async function POST({ request, locals }) {
	const data = await request.json();
	const messages = data.messages as Message[];
	const azureOpenai = getAzureOpenAiClient();

	if (messages.length === 0) {
		return new Response('Missing input.', { status: 422 });
	}
	if (messages[messages.length - 1].role !== 'user') {
		return new Response('Last message must be from user.', { status: 422 });
	}

	const requestId = request.headers.get('X-Request-ID');
	logger.info({
		type: 'OpenAI Request',
		AZURE_OPENAI_GPT_DEPLOYMENT_NAME,
		requestId,
		user: locals.user
	});

	const completion = await azureOpenai.streamChatCompletions(
		AZURE_OPENAI_GPT_DEPLOYMENT_NAME,
		messages
	);
	const stream = new ReadableStream({
		start(controller) {
			const reader = completion.getReader();
			reader.read().then(function processText({ done, value }) {
				if (done) {
					controller.close();
					return;
				}
				controller.enqueue(JSON.stringify({ data: value.choices[0]?.delta }) + '\n\n');
				reader.read().then(processText);
			});
		},
		cancel(controller) {
			logger.info('Stream cancelled');
			controller.close();
		}
	});
	return new Response(stream, {
		headers: {
			'cache-control': 'no-cache',
			'content-type': 'text/event-stream'
		}
	});
}
