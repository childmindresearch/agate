import { expect, test } from '@playwright/test';

test('an image shows up after an API request', async ({ page }) => {
	const url = 'https://i.pravatar.cc/150?img=3';
	const body = {
		data: `[{"urls":1},[2],"${url}"]`,
		status: 200,
		type: 'success'
	};
	await page.route('**/image-generation', async (route, request) => {
		if (request.method() === 'POST') {
			await route.fulfill({
				status: 200,
				body: JSON.stringify(body)
			});
		} else {
			await route.continue();
		}
	});

	await page.goto('/image-generation');
	page.getByTestId('dalle-text-input').fill('a test prompt');
	page.getByTestId('dalle-size-select').selectOption('1792x1024');
	page.getByTestId('dalle-n-select').selectOption('1');
	await page.getByTestId('dalle-submit-button').click();

	const src = await page.getByTestId('dalle-img-0').getAttribute('src');

	expect(src).toBe(url);
});
