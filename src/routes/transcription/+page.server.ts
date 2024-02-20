import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$lib/server/secrets.js';
import { fail } from '@sveltejs/kit';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const validFileFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const file = formData.get('file') as File;
		const language = formData.get('language') as string;

		console.log(file);
		if (file.size == 0 || typeof file === 'string') {
			return fail(422, { message: 'No file found.' });
		}

		const fileExtension = file.name.split('.').pop();
		console.log(fileExtension);
		if (!fileExtension) {
			return fail(422, { message: 'Invalid file; no extension found.' });
		}

		if (!validFileFormats.includes(fileExtension)) {
			console.log('invalid file format');
			return fail(422, { message: 'Invalid file format.' });
		}

		if (file.size > 24900000) {
			return fail(413, { message: 'File too large' });
		}

		const model = 'whisper-1';
		const transcription = await openai.audio.transcriptions.create({
			file,
			language,
			model
		});
		return { text: transcription };
	}
};
