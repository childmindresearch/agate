import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$lib/server/secrets.js';
import type { ImagesResponse } from 'openai/resources/images.mjs';
import type { APIPromise } from 'openai/core.mjs';
import { fail } from '@sveltejs/kit';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const prompt = formData.get('text') as string;
		const size = formData.get('size') as '1024x1024' | '1024x1792' | '1792x1024';
		const number = Number(formData.get('number'));

		if (!prompt || !size || !number) {
			return fail(422, { message: 'Missing input.' });
		}

		const model = 'dall-e-3';
		const responses: APIPromise<ImagesResponse>[] = [];
		for (let i = 0; i < number; i++) {
			responses.push(
				openai.images.generate({
					prompt,
					model,
					size,
					n: 1
				})
			);
		}
		const images = await Promise.all(responses);
		const urls = images.map((image) => image.data[0].url);

		return { urls };
	}
};
