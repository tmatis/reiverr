import { Settings } from "$lib/entities/Settings";
import fetch from "node-fetch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkIsTokenValid(request: any): Promise<boolean> {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return false;
    const settings = await Settings.get();
    const jellyfinURL = settings.jellyfin.baseUrl;
    if (!jellyfinURL) return false;
    const testTokenUrl = jellyfinURL + '/System/Info';
    try {
        const testTokenResponse = await fetch(testTokenUrl, {
            headers: {
                'X-MediaBrowser-Token': token
            }
        });
        if (testTokenResponse.status !== 200) return false;
    } catch (e) {
        return false;
    }
    return true;
}
