export async function GET({ request }) {
	const user = request.headers.get('X-User');
	return new Response(JSON.stringify({ user }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
}
