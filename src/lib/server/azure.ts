import { AzureKeyCredential, OpenAIClient } from '@azure/openai';
import {
	AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
	AZURE_DOCUMENT_INTELLIGENCE_KEY,
	AZURE_OPENAI_API_KEY,
	AZURE_OPENAI_ENDPOINT
} from '$lib/server/secrets';
import { DocumentAnalysisClient } from '@azure/ai-form-recognizer';

export function getAzureOpenAiClient() {
	return new OpenAIClient(AZURE_OPENAI_ENDPOINT, new AzureKeyCredential(AZURE_OPENAI_API_KEY));
}

export function getAzureDocumentAnalysisClient() {
	return new DocumentAnalysisClient(
		AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
		new AzureKeyCredential(AZURE_DOCUMENT_INTELLIGENCE_KEY)
	);
}
