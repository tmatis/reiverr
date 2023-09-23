import { checkIsTokenValid } from '$lib/auth/check-is-token-valid';
import { Settings } from '$lib/entities/Settings';
import { defaultSettings } from '$lib/stores/settings.store';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const isTokenValid = await checkIsTokenValid(request);
	const settings = await Settings.get();
	if (!isTokenValid) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { sonarr, radarr, jellyfin, ...rest } = settings;
		return json({
			...rest, 
			sonarr: defaultSettings.sonarr,
			radarr: defaultSettings.radarr,
			jellyfin: defaultSettings.jellyfin
		});
	}
	return json(settings);
};

export const POST: RequestHandler = async ({ request }) => {
	const isTokenValid = await checkIsTokenValid(request);
	if (!isTokenValid) return json({ message: 'invalid token' }, { status: 401 });
	const values = await request.json();
	return json(await Settings.set('default', values));
};
