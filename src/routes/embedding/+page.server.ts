import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$lib/server/secrets.js';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const file = formData.get('file') as File;
		const model = formData.get('model') as
			| 'text-embedding-3-small'
			| 'text-embedding-3-large'
			| 'text-embedding-ada-002';

		const input = await file.text();
		if (!input) {
			return new Response('Missing input.', { status: 422 });
		}
		const binary = input.split('').some((char) => char.charCodeAt(0) > 127);
		if (binary) {
			return new Response('Invalid input. Input may not be binary.', { status: 422 });
		}

		const response = await openai.embeddings.create({
			model,
			input,
			encoding_format: 'float'
		});
		const embedding = response.data[0].embedding;
		return { embedding };
	}
};
