import { expect, test } from '@playwright/test';

test('shows up', async ({ page }) => {
	await page.goto('/');

	const locator = page.getByTestId('app-bar');
	const appBar = await locator.all();

	expect(appBar).toHaveLength(1);
});

test('shows the CMI logo on medium+ windows', async ({ page }) => {
	await page.setViewportSize({ width: 1200, height: 800 });
	await page.goto('/');

	const locator = page.getByTestId('a-cmi-logo');
	const logo = await locator.all();
	const logoClasses = await logo[0].getAttribute('class');

	expect(logoClasses).toContain('hidden');
	expect(logoClasses).toContain('md:block');
});

test('contains a Github link', async ({ page }) => {
	await page.goto('/');
	const githubLink = 'https://github.com/childmindresearch/agate';

	const locator = page.getByTestId('a-github');
	const links = await locator.all();

	expect(links).toHaveLength(1);
	expect(await links[0].getAttribute('href')).toBe(githubLink);
});

test('contains a contact link', async ({ page }) => {
	await page.goto('/');
	const contactLink = 'mailto:dair@childmind.org';

	const locator = page.getByTestId('a-mailto');
	const links = await locator.all();

	expect(links).toHaveLength(1);
	expect(await links[0].getAttribute('href')).toBe(contactLink);
});
