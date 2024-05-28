import { diskFileToMemoryFile, memoryFileToDiskFile } from '$lib/fileHandling';
import {
	AZURE_OPENAI_API_KEY,
	AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
	AZURE_OPENAI_ENDPOINT
} from '$lib/server/secrets';
import { logger } from '$lib/server/utils';
import { AzureKeyCredential, OpenAIClient, type Embeddings } from '@azure/openai';
import { fail } from '@sveltejs/kit';
import { spawnSync } from 'child_process';
import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist';

export const actions = {
	default: async (event) => {
		const openai = new OpenAIClient(
			AZURE_OPENAI_ENDPOINT,
			new AzureKeyCredential(AZURE_OPENAI_API_KEY)
		);

		const formData = await event.request.formData();
		const file = formData.get('file') as File;
		if (file.size == 0) {
			return fail(422, { message: 'Found an empty file.' });
		}

		const input = await extractText(file);
		if (!input) {
			return fail(422, { message: 'Empty file.' });
		}

		const requestId = event.request.headers.get('X-Request-ID');
		const user = event.request.headers.get('X-User');
		logger.info({
			type: 'OpenAI Request',
			requestId,
			user
		});

		let response: Embeddings;
		try {
			response = await openai.getEmbeddings(AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME, [input]);
		} catch (error) {
			// @ts-expect-error as error is unknown.
			return fail(500, { message: error.message });
		}

		const embedding = response.data[0].embedding;
		return { embedding };
	}
};

async function extractText(file: File): Promise<string> {
	const fileExtension = file.name.split('.').pop();
	const tempDir = fs.mkdtempSync('temp');
	const tempFileFrom = `${tempDir}/${file.name}`;
	const tempFileTo = `${tempDir}/${file.name}.txt`;
	try {
		await memoryFileToDiskFile(file, tempFileFrom);
		if (fileExtension === 'pdf') {
			return await pdfToText(tempFileFrom);
		}
		pandoc(tempFileFrom, tempFileTo);
		const newFile = diskFileToMemoryFile(tempFileTo, 'text/plain');
		return await newFile.text();
	} finally {
		fs.rmdirSync(tempDir, { recursive: true });
	}
}

function pandoc(from: string, to: string) {
	const result = spawnSync('pandoc', [from, '-o', to, '-t', 'plain']);
	if (result.error) {
		console.error(result.error);
	}
}

async function pdfToText(filepath: string): Promise<string> {
	const loadingTask = pdfjsLib.getDocument({ url: filepath });
	const pdfDocument = await loadingTask.promise;
	const nPages = pdfDocument.numPages;
	let text = '';

	for (let i = 0; i < nPages; i++) {
		const page = await pdfDocument.getPage(i + 1);
		const textContent = await page.getTextContent();
		text += textContent.items
			.filter((item) => Object.prototype.hasOwnProperty.call(item, 'str')) // @ts-expect-error str is filtered for.
			.filter((item) => item.str.trim() !== '') // @ts-expect-error str is filtered for.
			.map((item) => item.str)
			.join(' ');
	}

	return text;
}
