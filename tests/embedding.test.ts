import { expect, test } from '@playwright/test';
import { readFileSync } from 'fs';

test('a file downloads after an API request', async ({ page }) => {
	const body = {
		data: `[{"embedding":1},[2,3,4,5],0,1,2,3]`,
		status: 200,
		type: 'success'
	};
	await page.route('**/embedding', async (route, request) => {
		if (request.method() === 'POST') {
			await route.fulfill({
				status: 200,
				body: JSON.stringify(body)
			});
		} else {
			await route.continue();
		}
	});

	await page.goto('/embedding');
	page.getByTestId('embedding-file-input').setInputFiles('tests/fixtures/empty.txt');
	await page.getByTestId('embedding-submit-button').click();

	const download = await page.waitForEvent('download');
	const filepath = await download.path();
	const fileContents = readFileSync(filepath, 'utf8');

	expect(fileContents).toBe('0,1,2,3');
});
