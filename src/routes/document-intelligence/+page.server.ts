import { logger } from '$lib/server/utils';
import { env } from '$env/dynamic/private';
import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';
import { PrebuiltDocumentModel } from './models.js';
import fs, { createReadStream } from 'fs';
import { memoryFileToDiskFile } from '$lib/utils.js';

export const actions = {
	default: async (event) => {
		logger.info('Document Intelligence API called');
		if (!env.AZURE_DOCUMENT_INTELLIGENCE_KEY || !env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT) {
			return new Response('Azure document intelligence environment varibales not set correctly.', {
				status: 500
			});
		}
		const client = new DocumentAnalysisClient(
			env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
			new AzureKeyCredential(env.AZURE_DOCUMENT_INTELLIGENCE_KEY)
		);

		const formData = await event.request.formData();
		const file = formData.get('file') as File;

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
		return { text };
	}
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
