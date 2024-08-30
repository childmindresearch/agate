import fs from 'fs';
import path from 'path';

export function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

export function diskFileToMemoryFile(filepath: string, type: string): File {
	const buffer = fs.readFileSync(filepath);
	const blob = new Blob([buffer], { type });
	return new File([blob], path.basename(filepath), { type });
}

export async function memoryFileToDiskFile(file: File, filepath: string): Promise<void> {
	fs.writeFileSync(filepath, Buffer.from(await file.arrayBuffer()));
}
