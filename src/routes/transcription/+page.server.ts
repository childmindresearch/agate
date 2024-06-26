import { fail } from '@sveltejs/kit';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'node:path';
import { memoryFileToDiskFile, diskFileToMemoryFile } from '$lib/fileHandling';
import type { whisperLanguagesTypes } from '$lib/types';
import { logger } from '$lib/server/utils';
import { getAzureOpenAiClient } from '$lib/server/azure';
import { AZURE_OPENAI_WHISPER_DEPLOYMENT_NAME } from '$lib/server/secrets';

const VALID_FILE_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
const WHISPER_MAX_SIZE = 24000000; // Whisper size limit is 25MB, but lets keep a margin.
const LOCAL_MAX_SIZE = 500000000; // 500MB

export const actions = {
	default: async (event) => {
		const azureOpenai = getAzureOpenAiClient();
		const formData = await event.request.formData();
		let files = [formData.get('file')] as File[];
		const language = formData.get('language') as whisperLanguagesTypes;

		if (files[0].size == 0 || typeof files[0] === 'string') {
			return fail(422, { message: 'No file found.' });
		}

		if (files[0].size > LOCAL_MAX_SIZE) {
			return fail(413, { message: 'File too large.' });
		}

		const fileExtension = files[0].name.split('.').pop();
		if (!fileExtension) {
			return fail(422, { message: 'Invalid file; no extension found.' });
		}

		if (!VALID_FILE_FORMATS.includes(fileExtension)) {
			files[0] = await convertToMp3(files[0]);
		}

		if (files[0].size > WHISPER_MAX_SIZE) {
			files = await splitIntoMultipleFiles(files[0]);
		}

		const model = 'whisper-1';
		const transcriptions: string[] = [];
		const requestId = event.request.headers.get('X-Request-ID');
		const user = event.request.headers.get('X-User');
		logger.info({
			type: 'OpenAI Request',
			model,
			requestId,
			user
		});
		for (const f of files) {
			const fileContents = new Uint8Array(await f.arrayBuffer());
			const transcription = await azureOpenai.getAudioTranscription(
				AZURE_OPENAI_WHISPER_DEPLOYMENT_NAME,
				fileContents,
				{
					language
				}
			);
			transcriptions.push(transcription.text);
		}

		const text = transcriptions.join(' ');

		return { text };
	}
};

async function convertToMp3(file: File): Promise<File> {
	const timestamp = new Date().getTime();
	const fileExtension = file.name.split('.').pop();
	const inputName = `tempInputFile_${timestamp}.${fileExtension}`;
	const convertedFileName = `temp_${timestamp}.mp3`;

	try {
		await memoryFileToDiskFile(file, inputName);
		ffmpeg(inputName)
			.format('mp3')
			.on('error', (err) => {
				throw err;
			})
			.saveToFile(convertedFileName);
		const outputFile = diskFileToMemoryFile(convertedFileName, 'audio/mp3');
		return outputFile;
	} finally {
		fs.unlinkSync(inputName);
		fs.unlinkSync(convertedFileName);
	}
}

async function splitIntoMultipleFiles(
	file: File,
	targetFormat: 'mp3' | 'mp4' | 'mpeg' | 'mpga' | 'm4a' | 'wav' | 'webm' = 'mp3'
): Promise<File[]> {
	const timestamp = new Date().getTime();
	const fileExtension = file.name.split('.').pop();
	const nFiles = Math.ceil(file.size / WHISPER_MAX_SIZE);
	const tempDir = fs.mkdtempSync('temp');
	const inputName = path.join(tempDir, `tempInputFile_${timestamp}.${fileExtension}`);
	const outputName = path.join(tempDir, `temp_${timestamp}_%d.${targetFormat}`);
	let clipDuration: number;

	try {
		memoryFileToDiskFile(file, inputName);
		clipDuration = await new Promise<number>((resolve, reject) => {
			ffmpeg.ffprobe(inputName, (err, metadata) => {
				if (err) {
					reject(err);
				}
				const duration = Number(metadata.format.duration);
				return Math.ceil(duration / nFiles);
			});
		});

		ffmpeg(inputName)
			.setStartTime(0)
			.outputOptions(['-map 0:a:0', '-f segment', `-segment_time ${clipDuration}`])
			.output(outputName)
			.on('error', (err) => {
				throw err;
			})
			.run();

		const outputFiles: File[] = [];
		for (let i = 0; i < nFiles; i++) {
			const outputName = path.join(tempDir, `temp_${timestamp}_${i}.${targetFormat}`);
			const outputFile = diskFileToMemoryFile(outputName, `audio/${targetFormat}`);
			outputFiles.push(outputFile);
		}

		return outputFiles;
	} finally {
		fs.rmSync(tempDir, { recursive: true, force: true });
	}
}
