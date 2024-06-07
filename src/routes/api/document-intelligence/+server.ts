import { memoryFileToDiskFile } from '$lib/fileHandling.js';
import { getAzureDocumentAnalysisClient } from '$lib/server/azure';
import { logger } from '$lib/server/utils';
import { type DocumentAnalysisClient } from '@azure/ai-form-recognizer';
import fs, { createReadStream } from 'fs';
import { PrebuiltDocumentModel } from './models';

export const POST = async ({ request }) => {
	logger.info('Document Intelligence API called');

	const azureDocumentAnalysis = getAzureDocumentAnalysisClient();
	const formData = await request.formData();
	const file = formData.get('file') as File;
	if (!file) {
		return new Response('No file found.', { status: 422 });
	}

	const pages = await getPages(azureDocumentAnalysis, file);
	if (!pages) {
		return new Response('No pages found in document', { status: 400 });
	}

	let text = '';
	for (const page of pages) {
		if (!page.lines) {
			continue;
		}
		for (const line of page.lines) {
			text += line.content + '\n';
		}
	}
	return new Response(text, { status: 200 });
};

async function getPages(client: DocumentAnalysisClient, file: File) {
	const tempDir = fs.mkdtempSync('temp');
	const tempFile = `${tempDir}/${file.name}`;
	try {
		await memoryFileToDiskFile(file, tempFile);
		const stream = createReadStream(tempFile);
		const poller = await client.beginAnalyzeDocument(PrebuiltDocumentModel, stream);
		const { pages } = await poller.pollUntilDone();
		return pages;
	} finally {
		fs.unlinkSync(tempFile);
		fs.rmdirSync(tempDir);
	}
}
