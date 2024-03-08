import { expect, test } from '@playwright/test';
import { readFileSync } from 'fs';

test('a file downloads after a succesful API request', async ({ page }) => {
	const text = 'CrossCode';
	const body = {
		data: `[{"text":1},[2],"${text}"]`,
		status: 200,
		type: 'success'
	};
	await page.route('**/transcription', async (route, request) => {
		if (request.method() === 'POST') {
			await route.fulfill({
				status: 200,
				body: JSON.stringify(body)
			});
		} else {
			await route.continue();
		}
	});

	await page.goto('/transcription');
	page.getByTestId('transcription-file-input').setInputFiles('tests/fixtures/empty.mp3');
	page.getByTestId('transcription-submit-button').click();

	const download = await page.waitForEvent('download');
	const filepath = await download.path();
	const fileContents = readFileSync(filepath, 'utf8');

	expect(fileContents).toBe(text);
});
