import { logger } from '$lib/server/utils';
import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';
import { PrebuiltDocumentModel } from './models';
import fs, { createReadStream } from 'fs';
import { memoryFileToDiskFile } from '$lib/fileHandling.js';
import {
	AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
	AZURE_DOCUMENT_INTELLIGENCE_KEY
} from '$lib/server/secrets';

export const POST = async ({ request }) => {
	logger.info('Document Intelligence API called');
	if (!AZURE_DOCUMENT_INTELLIGENCE_KEY || !AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT) {
		return new Response('Azure document intelligence environment varibales not set correctly.', {
			status: 500
		});
	}
	const client = new DocumentAnalysisClient(
		AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
		new AzureKeyCredential(AZURE_DOCUMENT_INTELLIGENCE_KEY)
	);

	const formData = await request.formData();
	const file = formData.get('file') as File;
	if (!file) {
		return new Response('No file found.', { status: 422 });
	}

	const pages = await getPages(client, file);
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