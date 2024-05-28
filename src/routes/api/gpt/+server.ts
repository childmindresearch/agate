import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import type { Message } from '$lib/types';
import { logger } from '$lib/server/utils';
import { json } from '@sveltejs/kit';
import {
	AZURE_OPENAI_ENDPOINT,
	AZURE_OPENAI_API_KEY,
	AZURE_OPENAI_GPT_DEPLOYMENT_NAME
} from '$lib/server/secrets';

export async function POST({ request }) {
	const openai = new OpenAIClient(
		AZURE_OPENAI_ENDPOINT,
		new AzureKeyCredential(AZURE_OPENAI_API_KEY)
	);

	const data = await request.json();
	const messages = data.messages as Message[];

	if (messages.length === 0) {
		return new Response('Missing input.', { status: 422 });
	}
	if (messages[messages.length - 1].role !== 'user') {
		return new Response('Last message must be from user.', { status: 422 });
	}

	const requestId = request.headers.get('X-Request-ID');
	const user = request.headers.get('X-User');
	logger.info({
		type: 'OpenAI Request',
		AZURE_OPENAI_GPT_DEPLOYMENT_NAME,
		requestId,
		user
	});

	const completion = await openai.getChatCompletions(AZURE_OPENAI_GPT_DEPLOYMENT_NAME, messages);
	return json({ message: completion.choices[0].message?.content });
}
