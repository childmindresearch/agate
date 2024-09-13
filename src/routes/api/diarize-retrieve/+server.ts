import { AZURE_SPEECH_SERVICES_KEY } from '$lib/server/secrets';

type TranscriptionLocationResponse = {
	values: {
		self: string;
		name: string;
		kind: 'Transcription' | 'TranscriptionReport';
		properties: {
			size: number;
		};
		createdDateTime: string;
		links: {
			contentUrl: string;
		};
	}[];
};

export async function GET({ request }) {
	const url = request.headers.get('X-Transcript-Url');
	if (url === null) {
		return new Response('No valid url.', { status: 400 });
	}

	const transcriptLocationJson: TranscriptionLocationResponse = await (
		await fetch(url, {
			headers: {
				'Ocp-Apim-Subscription-Key': AZURE_SPEECH_SERVICES_KEY
			}
		})
	).json();

	const urls = transcriptLocationJson.values
		.filter((json) => json.kind === 'Transcription')
		.map((json) => {
			return { name: json.name, link: json.links.contentUrl };
		});
	const responses = await Promise.all(
		urls.map(async (url) => {
			return await fetch(url.link, {
				headers: {
					'Ocp-Apim-Subscription-Key': AZURE_SPEECH_SERVICES_KEY
				}
			});
		})
	);

	return new Response(responses[0].body);
}
