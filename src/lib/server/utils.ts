import winston from 'winston';
import ffmpeg from 'fluent-ffmpeg';
import { diskFileToMemoryFile, memoryFileToDiskFile } from '$lib/fileHandling';
import fs from 'fs';

const { combine, timestamp, json } = winston.format;
export const logger = winston.createLogger({
	level: 'info',
	format: combine(
		timestamp({
			format: 'YYYY-MM-DD HH:mm:ss.SSS'
		}),
		json()
	),
	transports: [new winston.transports.Console()]
});

export async function convertToMp3(file: File): Promise<File> {
	const fileExtension = file.name.split('.').pop();
	if (fileExtension == 'mp3') return file;

	const timestamp = new Date().getTime();

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
