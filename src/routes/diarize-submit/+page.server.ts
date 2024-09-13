import { fail } from '@sveltejs/kit';
import { convertToMp3, logger } from '$lib/server/utils';
import { AZURE_CREATE_DIARIZATION_ENDPOINT } from '$lib/server/secrets';

const SPEECH_SERVICES_MAX_SIZE = 200000000; // 200MB

export const actions = {
	default: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const files = [formData.get('files')] as File[];

		if (files.some((file) => file.size > SPEECH_SERVICES_MAX_SIZE)) {
			return fail(413, {
				message: `One or more of your files are larger than ${SPEECH_SERVICES_MAX_SIZE} bytes.`
			});
		}

		if (files.some((file) => file.name.split('.').length < 2)) {
			return fail(422, { message: 'Invalid file; no extension found.' });
		}

		const mp3Files = await Promise.all(
			files.map((file) => {
				return convertToMp3(file, true);
			})
		);

		const requestId = request.headers.get('X-Request-ID');
		logger.info({
			type: 'Speech Services Request',
			requestId,
			user: locals.user
		});

		const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
			let binary = '';
			const bytes = new Uint8Array(buffer);
			const len = bytes.byteLength;
			for (let i = 0; i < len; i++) {
				binary += String.fromCharCode(bytes[i]);
			}
			return btoa(binary);
		};

		const responses = await Promise.all(
			mp3Files.map(async (file) => {
				const body = JSON.stringify({
					fileName: file.name,
					email: locals.user,
					fileContent: arrayBufferToBase64(await file.arrayBuffer())
				});
				return await fetch(AZURE_CREATE_DIARIZATION_ENDPOINT, {
					headers: {
						'Content-Type': 'application/json'
					},
					body,
					method: 'POST'
				});
			})
		);
		if (responses.some((r) => !r.ok)) {
			await Promise.all(
				responses.map(async (r) => {
					logger.error(await r.text());
				})
			);
			return fail(500, { message: 'At least one audio file failed to submit.' });
		}
		return { success: true };
	}
};
