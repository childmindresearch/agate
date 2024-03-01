/*
    GET /api/health

    Endpoint for development; used to check if the server is running.
*/
export async function GET() {
	return new Response('OK', { status: 200 });
}

/*
    POST /api/health

    Endpoint for development; used to check if the server is running.
*/
export async function POST({ request }) {
	const form = await request.formData();

	return new Response('OK', { status: 200 });
}
