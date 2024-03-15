import { json } from '@sveltejs/kit';

export async function GET({ request }) {
	const user = request.headers.get('X-User');
	return json({ user });
}
