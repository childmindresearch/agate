import OpenAI from 'openai';
import type { Message } from '$lib/types';
import { logger } from '$lib/server/utils';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function POST({ request }) {
	const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

	const data = await request.json();
	const messages = data.messages as Message[];
	const messagesOpenai = messages.map((message) => {
		return {
			role: message.role,
			content: message.content
		};
	});
	const model = data.model as string;

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
		model,
		requestId,
		user
	});

	const response = await openai.chat.completions.create({
		model,
		messages: messagesOpenai
	});
	const responseMessage = response.choices[0].message.content;
	if (!responseMessage) {
		return new Response('No response from OpenAI.', { status: 500 });
	}

	return json({ message: responseMessage, user });
}
