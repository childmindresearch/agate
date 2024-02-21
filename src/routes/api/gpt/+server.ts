import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$lib/server/secrets.js';
import type { Message } from '$lib/types';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST({ request }) {
	const json = await request.json();
	const messages = json.messages as Message[];
	const messagesOpenai = messages.map((message) => {
		return {
			role: message.role,
			content: message.content
		};
	});
	const model = json.model as string;

	if (messages.length === 0) {
		return new Response('Missing input.', { status: 422 });
	}
	if (messages[messages.length - 1].role !== 'user') {
		return new Response('Last message must be from user.', { status: 422 });
	}

	const response = await openai.chat.completions.create({
		model,
		messages: messagesOpenai
	});
	const response_message = response.choices[0].message.content;
	if (!response_message) {
		return new Response('No response from OpenAI.', { status: 500 });
	}

	return new Response(JSON.stringify({ message: response_message }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
}
