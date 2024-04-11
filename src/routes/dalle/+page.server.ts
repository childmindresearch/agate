import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$lib/server/secrets';
import type { ImagesResponse } from 'openai/resources/images.mjs';
import type { APIPromise } from 'openai/core.mjs';
import { fail } from '@sveltejs/kit';
import { logger } from '$lib/server/utils';

export const actions = {
	default: async (event) => {
		const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

		const formData = await event.request.formData();
		const prompt = formData.get('text') as string;
		const size = formData.get('size') as '1024x1024' | '1024x1792' | '1792x1024';
		const number = Number(formData.get('number'));
		const quality = formData.get('quality') as 'standard' | 'hd';

		if (!prompt || !size || !number) {
			return fail(422, { message: 'Missing input.' });
		}

		const model = 'dall-e-3';
		const requestId = event.request.headers.get('X-Request-ID');
		const user = event.request.headers.get('X-User');
		logger.info({
			type: 'OpenAI Request',
			model,
			requestId,
			user
		});
		const responses: APIPromise<ImagesResponse>[] = [];
		for (let i = 0; i < number; i++) {
			responses.push(
				openai.images.generate({
					prompt,
					quality,
					model,
					size,
					n: 1
				})
			);
		}
		let images: ImagesResponse[];
		try {
			images = await Promise.all(responses);
		} catch (error) {
			logger.error({
				type: 'OpenAI Error',
				error
			});
			return fail(500, { message: 'OpenAI error.' });
		}
		const urls = images.map((image) => image.data[0].url);

		return { urls };
	}
};
