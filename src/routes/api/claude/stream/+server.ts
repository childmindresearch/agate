import { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY } from '$lib/server/secrets.js';
import { logger } from '$lib/server/utils';
import type { Message } from '$lib/chat';
import { BedrockRuntimeClient, ConverseStreamCommand } from '@aws-sdk/client-bedrock-runtime';

export async function POST({ request }) {
	const data = await request.json();
	const messages = data.messages as Message[];
	const model = data.model;
	const systemMessage = messages.filter((message) => message.role === 'system')[0];
	const conversation = messages.filter((message) => message.role !== 'system');
	const conversationCommand = conversation.map((message) => ({
		role: message.role,
		content: [{ text: message.content }]
	}));
	let region: string;

	if (model === 'anthropic.claude-3-5-sonnet-20240620-v1:0') {
		region = 'us-east-1';
	} else {
		region = 'us-west-2';
	}

	const bedrockRuntime = new BedrockRuntimeClient({
		region,
		credentials: { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_ACCESS_KEY }
	});

	const command = new ConverseStreamCommand({
		modelId: model,
		// @ts-expect-error because our message type contains a 'system' role.
		messages: conversationCommand,
		system: [{ text: systemMessage.content }]
	});
	const response = await bedrockRuntime.send(command);
	if (!response.stream) {
		return new Response('No stream in response', { status: 500 });
	}

	const stream = new ReadableStream({
		async start(controller) {
			if (!response.stream) {
				controller.close();
				return;
			}

			for await (const item of response.stream) {
				controller.enqueue(
					JSON.stringify({ data: { content: item.contentBlockDelta?.delta?.text } }) + '\n\n'
				);
			}

			controller.close();
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
