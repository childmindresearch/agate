import { env } from '$env/dynamic/private';

export const OPENAI_API_KEY = env.OPENAI_API_KEY || '';

export const AZURE_OPENAI_ENDPOINT = env.AZURE_OPENAI_ENDPOINT || '';
export const AZURE_OPENAI_API_KEY = env.AZURE_OPENAI_API_KEY || '';
export const AZURE_OPENAI_GPT_DEPLOYMENT_NAME = env.AZURE_OPENAI_GPT_DEPLOYMENT_NAME || '';
export const AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME =
	env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME || '';
export const AZURE_OPENAI_WHISPER_DEPLOYMENT_NAME = env.AZURE_OPENAI_WHISPER_DEPLOYMENT_NAME || '';

export const AZURE_SPEECH_SERVICES_ENDPOINT = env.AZURE_SPEECH_SERVICES_ENDPOINT || '';
export const AZURE_SPEECH_SERVICES_KEY = env.AZURE_SPEECH_SERVICES_KEY || '';
export const AZURE_CREATE_DIARIZATION_ENDPOINT = env.AZURE_CREATE_DIARIZATION_ENDPOINT || '';

export const AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT = env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || '';
export const AZURE_DOCUMENT_INTELLIGENCE_KEY = env.AZURE_DOCUMENT_INTELLIGENCE_KEY || '';

export const AWS_ACCESS_KEY = env.AWS_ACCESS_KEY || '';
export const AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY || '';
