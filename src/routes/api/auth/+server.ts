import { checkIsTokenValid } from '$lib/auth/check-is-token-valid';
import { Settings } from '$lib/entities/Settings';
import { json, type RequestHandler } from '@sveltejs/kit';
import fetch from 'node-fetch';

export const GET: RequestHandler = async ({ request }) => {
	const isTokenValid = await checkIsTokenValid(request);
	if (!isTokenValid) return json({ message: 'invalid token' }, { status: 401 });
	return json({ message: 'valid token' }, { status: 200 });
};

interface LoginRequestBody {
	username?: string;
	password?: string;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { username, password }: LoginRequestBody = await request.json();
		const settings = await Settings.get();
		const jellyfinURL = settings.jellyfin.baseUrl;
		if (!jellyfinURL) return json({ message: 'no jellyfin url provided' }, { status: 401 });
		const loginUrl = jellyfinURL + '/Users/authenticatebyname';
		console.log(loginUrl);
		try {
			const loginResponse = await fetch(loginUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `MediaBrowser DeviceId="Ratflix", Device="Ratflix", Token="${settings.jellyfin.apiKey}"`
				},
				body: JSON.stringify({
					Pw: password,
					Username: username
				})
			});
			if (loginResponse.status >= 400)
				return json({ message: 'invalid login', loginResponse }, { status: 401 });
			const loginData = (await loginResponse.json()) as {
				AccessToken: string;
				User: { Id: string };
			};
			const { AccessToken: token, User: { Id: jellyfinId } } = loginData;
			console.log(loginData);
			console.log({ token, jellyfinId });
			if (!token) return json({ message: 'Token not present in login response' }, { status: 401 });
			return json({ token, jellyfinId: jellyfinId }, { status: 200 });
		} catch (e) {
			return json({ message: 'invalid login', e }, { status: 401 });
		}
	} catch (e) {
		return json({ message: 'unknown error' }, { status: 401 });
	}
};
