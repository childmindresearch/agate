import { AZURE_SPEECH_SERVICES_ENDPOINT, AZURE_SPEECH_SERVICES_KEY } from '$lib/server/secrets';
import type { TranscriptionResponse } from './types';

export async function load({ fetch, locals }) {
	const transcriptions: TranscriptionResponse = await fetch(
		AZURE_SPEECH_SERVICES_ENDPOINT + '/speechtotext/v3.2/transcriptions',
		{
			headers: {
				'Ocp-Apim-Subscription-Key': AZURE_SPEECH_SERVICES_KEY
			}
		}
	).then(async (resp) => await resp.json());
	const userTranscriptions = transcriptions.values
		.filter((transcript) => {
			// As a bit of a user-management hack, the owner is stored in the display name.
			return transcript.displayName.split('-!-')[0] === locals.user;
		})
		.map((transcript) => {
			transcript.displayName = transcript.displayName.split('-!-')[1] ?? transcript.displayName;
			return transcript;
		})
		.sort((a, b) => b.createdDateTime.localeCompare(a.createdDateTime));
	return { values: userTranscriptions };
}
