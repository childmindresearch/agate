import { diskFileToMemoryFile, downloadBlob } from '$lib/utils';
import { describe, it, expect, vi } from 'vitest';

describe('downloadBlob', () => {
	it('should download a blob and clean up', async () => {
		window.URL.createObjectURL = vi.fn().mockReturnValue('url');
		window.URL.revokeObjectURL = vi.fn();

		const blob = new Blob(['test'], { type: 'text/plain' });
		const a = document.createElement('a');
		a.click = vi.fn();
		document.createElement = vi.fn().mockReturnValue(a);

		downloadBlob(blob, 'test.txt');

		expect(a.href).toBeDefined();
		expect(a.download).toBe('test.txt');
		expect(a.click).toHaveBeenCalled();
		expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
		expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('url');
	});
});

describe('diskFileToMemoryFile', () => {
	it('should convert a file from disk to memory', () => {
		const filepath = './tests/fixtures/helloworld.txt';
		const file = new File(['helloworld'], 'helloworld.txt', { type: 'text/plain' });

		const result = diskFileToMemoryFile(filepath, 'text/plain');

		expect(result).toEqual(file);
	});
});
