import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$lib/server/secrets';
import fs from 'fs';
import { memoryFileToDiskFile, diskFileToMemoryFile } from '$lib/utils';
import { spawnSync } from 'child_process';
import * as pdfjsLib from 'pdfjs-dist';
import { fail } from '@sveltejs/kit';
import type { CreateEmbeddingResponse } from 'openai/resources/embeddings.mjs';
import { logger } from '$lib/server/utils';

export const actions = {
	default: async (event) => {
		const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

		const formData = await event.request.formData();
		const file = formData.get('file') as File;
		const model = formData.get('model') as
			| 'text-embedding-3-small'
			| 'text-embedding-3-large'
			| 'text-embedding-ada-002';

		if (file.size == 0 || !model) {
			return fail(422, { message: 'Missing input.' });
		}

		const input = await extractText(file);
		if (!input) {
			return fail(422, { message: 'Empty file.' });
		}

		const requestId = event.request.headers.get('X-Request-ID');
		const user = event.request.headers.get('X-User');
		logger.info({
			type: 'OpenAI Request',
			model,
			requestId,
			user
		});

		let response: CreateEmbeddingResponse;
		try {
			response = await openai.embeddings.create({
				model,
				input,
				encoding_format: 'float'
			});
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
