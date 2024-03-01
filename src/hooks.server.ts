import type { RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { dev } from '$app/environment';
import { logger } from '$lib/server/utils';
import { randomUUID } from 'crypto';
import { performance } from 'perf_hooks';

export async function handle({ event, resolve }) {
	const requestId = randomUUID();
	const startTime = performance.now();

	let user: string;
	if (!dev) {
		user = event.request.headers.get('X-MS-CLIENT-PRINCIPAL-NAME') as string;
		if (!user) {
			return new Response('Unauthorized', { status: 401 });
		}
	} else {
		user = 'development';
	}

	logger.info({
		type: `Request`,
		method: event.request.method,
		url: event.request.url,
		user,
		requestId
	});
	event.request.headers.set('X-Request-ID', requestId);
	event.request.headers.set('X-User', user);

	const response = await resolve(event);

	const endTime = performance.now();
	const responseTime = `${(endTime - startTime).toFixed(3)}ms`;
	const logMessage = {
		type: 'Response',
		statusCode: response.status,
		method: event.request.method,
		url: event.request.url,
		user,
		requestId,
		responseTime
	};

	if (response.status >= 400) {
		logger.error(logMessage);
	} else {
		logger.info(logMessage);
	}

	response.headers.append('X-Request-ID', requestId);

	return response;
}

function decodeJwt(event: RequestEvent<Partial<Record<string, string>>, string | null>) {
	const headers = event.request.headers;
	const token = headers.get('Authorization')?.split('Bearer ')[1];
	if (!token) {
		return null;
	}

	let decoded: jwt.JwtPayload | string;
	try {
		decoded = jwt.verify(token, 'secret');
	} catch (e) {
		return null;
	}

	if (!decoded || typeof decoded === 'string') {
		return null;
	}

	return decoded;
}
