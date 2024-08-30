import { memoryFileToDiskFile } from '$lib/fileHandling.js';
import { DocumentAnalysis } from '$lib/server/azure';
import { logger } from '$lib/server/utils';
import fs from 'fs';

export const POST = async ({ request }) => {
	logger.info('Document Intelligence API called');

	const formData = await request.formData();
	const file = formData.get('file') as File;
	if (!file) {
		return new Response('No file found.', { status: 422 });
	}

	const analysis = new DocumentAnalysis();
	const tempdir = fs.mkdtempSync('temp');
	const filename = `${tempdir}/${file.name}`;
	try {
		await memoryFileToDiskFile(file, filename);
		const response = await analysis.analyze(filename);
		if (!response.ok) {
			return new Response('Something went wrong, contact an admin.', { status: 500 });
		}
		const content = (await response.json()).analyzeResult.content;

		return new Response(content, { status: 200 });
	} finally {
		fs.unlinkSync(filename);
	}
};
