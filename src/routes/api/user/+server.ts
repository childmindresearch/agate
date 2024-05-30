import { json } from '@sveltejs/kit';

export async function GET({ request }) {
	const user = request.headers.get('X-MS-CLIENT-PRINCIPAL-NAME') || 'development.user@example.com';
	return json({ user });
}
