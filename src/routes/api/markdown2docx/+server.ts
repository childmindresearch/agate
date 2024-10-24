import { PANDOC_SERVER_ENDPOINT } from '$lib/server/secrets.js';
import { logger } from '$lib/server/utils';

export const POST = async ({ request, fetch }) => {
	logger.info('Pandoc API called');

	const markdown = await request.text();
	const blob = new Blob([markdown], { type: 'text/markdown' });
	const form = new FormData();
	form.append('to', 'docx');
	form.append('from', 'md');
	form.append('file', blob);

	const response = await fetch(PANDOC_SERVER_ENDPOINT, {
		method: 'POST',
		body: form
	});

	if (!response.ok) {
		return new Response(await response.text(), { status: 500 });
	}
	return new Response(await response.blob());
};
