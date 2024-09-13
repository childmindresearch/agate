import { expect, test } from '@playwright/test';

test('shows up', async ({ page }) => {
	await page.goto('/');

	const locator = page.getByTestId('div-navigation');
	const div = await locator.all();

	expect(div).toHaveLength(1);
});

test('has all links', async ({ page }) => {
	await page.goto('/');
	const n_expected_links = 8;

	const locator = page.getByTestId('a-navigation');
	const links = await locator.all();

	expect(links).toHaveLength(n_expected_links);
});

test('clicking on a link changes the route', async ({ page }) => {
	await page.goto('/');
	const locator = page.getByTestId('a-navigation');
	const links = await locator.all();

	for (const link of links) {
		const href = await link.getAttribute('href');
		await link.click();
		await page.waitForTimeout(50);

		expect(page.url()).toBe('http://localhost:4173' + href);
	}
});

test('current page has a distinct class', async ({ page }) => {
	await page.goto('/gpt');
	const locator = page.getByTestId('a-navigation');
	const links = await locator.all();
	const gptLink = links.filter(async (link) => {
		const href = await link.getAttribute('href');
		return href === '/gpt';
	})[0];
	const gptClass = await gptLink.getAttribute('class');

	for (const link of links) {
		if (link !== gptLink) {
			expect(await link.getAttribute('class')).not.toBe(gptClass);
		}
	}
});
