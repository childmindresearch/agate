import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$lib/server/secrets.js';
import { fail } from '@sveltejs/kit';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'node:path';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const validFileFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
const openaiMaxSize = 24000000; // OpenAI limit is 25MB, but lets keep a margin.
const localMaxSize = 500000000; // 500MB

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		let files = [formData.get('file')] as File[];
		const language = formData.get('language') as string;

		if (files[0].size == 0 || typeof files[0] === 'string') {
			return fail(422, { message: 'No file found.' });
		}

		if (files[0].size > localMaxSize) {
			return fail(413, { message: 'File too large.' });
		}

		const fileExtension = files[0].name.split('.').pop();
		if (!fileExtension) {
			return fail(422, { message: 'Invalid file; no extension found.' });
		}

		if (!validFileFormats.includes(fileExtension)) {
			convertToMp3(files[0])
				.then((convertedFile) => {
					files[0] = convertedFile;
				})
				.catch(() => {
					return fail(422, { message: 'Invalid file format.' });
				});
		}

		if (files[0].size > openaiMaxSize) {
			files = await splitIntoMultipleFiles(files[0]);
		}

		const model = 'whisper-1';
		const transcriptions: string[] = [];
		for (const f of files) {
			const transcription = await openai.audio.transcriptions.create({
				file: f,
				language,
				model
			});
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
		const buffer = Buffer.from(await file.arrayBuffer());
		await fs.promises.writeFile(inputName, buffer);

		await new Promise((resolve, reject) => {
			ffmpeg(inputName)
				.format('mp3')
				.on('error', (err) => reject(err))
				.on('end', () => resolve(null))
				.saveToFile(convertedFileName);
		});
		const outputFile = diskFileToMemoryFile(convertedFileName, 'audio/mp3');
		return outputFile;
	} finally {
		await Promise.all([
			fs.promises.unlink(inputName).catch(() => {}),
			fs.promises.unlink(convertedFileName).catch(() => {})
		]);
	}
}

async function splitIntoMultipleFiles(
	file: File,
	targetFormat: 'mp3' | 'mp4' | 'mpeg' | 'mpga' | 'm4a' | 'wav' | 'webm' = 'mp3'
): Promise<File[]> {
	const timestamp = new Date().getTime();
	const fileExtension = file.name.split('.').pop();
	const nFiles = Math.ceil(file.size / openaiMaxSize);
	const tempDir = fs.mkdtempSync('temp');
	const inputName = path.join(tempDir, `tempInputFile_${timestamp}.${fileExtension}`);
	const outputName = path.join(tempDir, `temp_${timestamp}_%d.${targetFormat}`);

	try {
		const buffer = Buffer.from(await file.arrayBuffer());
		await fs.promises.writeFile(inputName, buffer);

		await new Promise((resolve, reject) => {
			ffmpeg.ffprobe(inputName, (err, metadata) => {
				if (err) {
					reject(err);
				}
				resolve(Number(metadata.format.duration));
			});
		})
			.then((duration) => {
				const clipDuration = Math.ceil((duration as number) / nFiles);
				return new Promise((resolve, reject) => {
					ffmpeg(inputName)
						.setStartTime(0)
						.outputOptions(['-map 0:a:0', '-f segment', `-segment_time ${clipDuration}`])
						.output(outputName)
						.on('error', (err) => reject(err))
						.on('end', () => resolve(null))
						.run();
				});
			})
			.catch((err) => {
				throw err;
			});

		const outputFiles: File[] = [];
		for (let i = 0; i < nFiles; i++) {
			const outputName = path.join(tempDir, `temp_${timestamp}_${i}.${targetFormat}`);
			const outputFile = await diskFileToMemoryFile(outputName, `audio/${targetFormat}`);
			outputFiles.push(outputFile);
		}

		return outputFiles;
	} finally {
		fs.rmSync(tempDir, { recursive: true, force: true });
	}
}

async function diskFileToMemoryFile(filepath: string, type: string): Promise<File> {
	const buffer = await fs.promises.readFile(filepath);
	const blob = new Blob([buffer], { type });
	return new File([blob], path.basename(filepath), { type });
}
