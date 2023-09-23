import { writable } from "svelte/store";
import { get } from 'svelte/store';


type AuthStore = {
    token?: string;
    jellyfinId?: string;
};


export function createAuthStore() {
    const store = writable<AuthStore>({
        token: undefined,
        jellyfinId: undefined
    });

    async function checkForExistingToken() {
        const token = localStorage.getItem('token');
        const jellyfinId = localStorage.getItem('jellyfinId');
        if (token && jellyfinId) {
            const res = await fetch('/api/auth', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (res.status === 200) {
                store.set({ token, jellyfinId });
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('jellyfinId');
            }
        }
    }

    async function login(username: string, password: string) {
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        if (res.status === 200) {
            const data = await res.json();
            const token = data.token;
            const jellyfinId = data.jellyfinId;
            localStorage.setItem('token', token);
            localStorage.setItem('jellyfinId', jellyfinId);
            store.set({ token, jellyfinId });
        } else {
            throw new Error('Invalid login');
        }
    }

    async function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('jellyfinId');
        store.set({ token: undefined, jellyfinId: undefined });
    }

    function getStore() {
        return get(store);
    }

    checkForExistingToken();

    return {
        subscribe: store.subscribe,
        login,
        logout,
        getStore
    };
}

export const authStore = createAuthStore();