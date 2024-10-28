import { fail } from '@sveltejs/kit';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'node:path';
import { memoryFileToDiskFile, diskFileToMemoryFile } from '$lib/fileHandling';
import type { whisperLanguagesTypes } from './whisperLanguages';
import { logger } from '$lib/server/utils';
import { getAzureOpenAiClient, modelDeployments } from '$lib/server/azure';

const VALID_FILE_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'wav', 'webm'];
const WHISPER_MAX_SIZE = 24000000; // Whisper size limit is 25MB, but lets keep a margin.
const LOCAL_MAX_SIZE = 500000000; // 500MB

export const actions = {
	default: async (event) => {
		const azureOpenai = getAzureOpenAiClient(modelDeployments['whisper']);
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
		const requestId = event.request.headers.get('X-Request-ID');
		logger.info({
			type: 'OpenAI Request',
			model,
			requestId,
			user: event.locals.user
		});

		const transcription = (
			await Promise.all(
				files.map(async (file) => {
					return azureOpenai.audio.transcriptions.create({ file, model: 'whisper-1', language });
				})
			)
		)
			.map((transcript: { text: string }) => transcript.text)
			.join(' ');

		return { text: transcription };
	}
};

async function convertToMp3(file: File): Promise<File> {
	const timestamp = new Date().getTime();
	const fileExtension = file.name.split('.').pop();
	const inputName = `tempInputFile_${timestamp}.${fileExtension}`;
	const convertedFileName = `temp_${timestamp}.mp3`;

	try {
		await memoryFileToDiskFile(file, inputName);
		await new Promise<void>((resolve, reject) => {
			ffmpeg(inputName)
				.setStartTime(0)
				.output(convertedFileName)
				.on('error', (err) => {
					logger.error(err);
					reject();
				})
				.on('end', () => resolve())
				.run();
		});
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
	logger.info('Splitting into multiple files.');
	const mp3File = await convertToMp3(file);
	const timestamp = new Date().getTime();
	const nFiles = Math.ceil(mp3File.size / WHISPER_MAX_SIZE);
	if (nFiles == 1) {
		// Conversion to .mp3 brought size below the limit.
		return [mp3File];
	}
	const tempDir = fs.mkdtempSync('temp');
	const inputName = path.join(tempDir, `tempInputFile_${timestamp}.mp3`);
	const outputName = path.join(tempDir, `temp_${timestamp}_%d.${targetFormat}`);

	try {
		await memoryFileToDiskFile(file, inputName);
		const clipDuration = await new Promise<number>((resolve, reject) => {
			ffmpeg.ffprobe(inputName, (err, metadata) => {
				if (err) {
					reject(err);
				}
				const duration = Number(metadata.format.duration);
				resolve(Math.ceil(duration / nFiles));
			});
		});

		await new Promise<void>((resolve, reject) => {
			ffmpeg(inputName)
				.setStartTime(0)
				.outputOptions(['-map 0:a:0', '-f segment', `-segment_time ${clipDuration}`])
				.output(outputName)
				.on('error', (err) => {
					logger.error(err);
					reject();
				})
				.on('end', () => resolve())
				.run();
		});

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
