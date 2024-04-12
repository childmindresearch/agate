import { expect, test } from '@playwright/test';
import { readFileSync } from 'fs';

test('a file downloads after an API request', async ({ page }) => {
	await page.route('/api/document-intelligence', async (route, request) => {
		if (request.method() === 'POST') {
			await route.fulfill({
				status: 200,
				body: 'Hello world'
			});
		} else {
			await route.continue();
		}
	});

	await page.goto('/document-intelligence');
	page.getByTestId('document-intelligence-file-input').setInputFiles('tests/fixtures/empty.pdf');
	page.getByTestId('form-api-page-button').click();

	const download = await page.waitForEvent('download');
	const filepath = await download.path();
	const fileContents = readFileSync(filepath, 'utf8');

	expect(fileContents).toBe('Hello world');
});
