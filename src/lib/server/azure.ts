import { AzureOpenAI } from 'openai';
import {
	AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
	AZURE_DOCUMENT_INTELLIGENCE_KEY,
	AZURE_OPENAI_API_KEY,
	AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
	AZURE_OPENAI_GPT_DEPLOYMENT_NAME,
	AZURE_OPENAI_WHISPER_DEPLOYMENT_NAME
} from '$lib/server/secrets';
import * as fs from 'fs';
import { logger } from '$lib/server/utils';

export const modelDeployments = {
	'gpt-4o': AZURE_OPENAI_GPT_DEPLOYMENT_NAME,
	'text-embedding-3-large': AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
	whisper: AZURE_OPENAI_WHISPER_DEPLOYMENT_NAME
};

export function getAzureOpenAiClient(deployment: string) {
	return new AzureOpenAI({
		apiKey: AZURE_OPENAI_API_KEY,
		deployment,
		apiVersion: '2024-07-01-preview'
	});
}

export class DocumentAnalysis {
	private endpoint: string;
	private access_key;

	constructor() {
		this.endpoint =
			AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT +
			'documentintelligence/documentModels/prebuilt-read:analyze?_overload=analyzeDocument&api-version=2024-07-31-preview';
		this.access_key = AZURE_DOCUMENT_INTELLIGENCE_KEY;
	}

	public async analyze(filepath: string) {
		const base64 = fs.readFileSync(filepath, { encoding: 'base64' });
		const postResponse = await fetch(this.endpoint, {
			headers: { 'Ocp-Apim-Subscription-Key': this.access_key, 'Content-Type': 'application/json' },
			body: `{'base64Source': '${base64}'}`,
			method: 'POST'
		});

		const operationLocation = postResponse.headers.get('Operation-Location');
		if (!operationLocation) {
			logger.error([postResponse, await postResponse.json()]);
			return new Response('', { status: 500 });
		}

		let attempts = 0;
		while (attempts < 15) {
			attempts += 1;
			const getResponse = await fetch(operationLocation, {
				headers: { 'Ocp-Apim-Subscription-Key': this.access_key }
			});
			const json = await getResponse.json();
			if (json.status !== 'running') {
				return new Response(JSON.stringify(json), { status: 200 });
			}
			await new Promise((resolve) => {
				setTimeout(resolve, 2000);
			});
		}

		return new Response('', { status: 500 });
	}
}
