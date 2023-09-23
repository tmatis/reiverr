<script lang="ts">
	import { page } from '$app/stores';
	import I18n from '$lib/components/Lang/I18n.svelte';
	import DynamicModal from '$lib/components/Modal/DynamicModal.svelte';
	import Navbar from '$lib/components/Navbar/Navbar.svelte';
	import UpdateChecker from '$lib/components/UpdateChecker.svelte';
	import { type SettingsValues, defaultSettings, settings } from '$lib/stores/settings.store';
	import { writable } from 'svelte/store';
	import '../app.css';
	import Notifications from '$lib/components/Notification/Notifications.svelte';
	import Auth from '$lib/components/Auth/Auth.svelte';
	import { authStore } from '$lib/stores/auth.store';

	settings.set(defaultSettings);
	async function fetchSettings(token?: string) {
		let headers = {};
		if (token) {
			headers = {
				Authorization: `Bearer ${token}`,
			};
		}
		const res = await fetch('/api/settings', {
			headers,
		});
		const data = await res.json();
		settings.set(data);
	}
	fetchSettings(localStorage.getItem('token') || undefined);
	let loggedIn = false;
	authStore.subscribe((value) => {
		loggedIn = !!value.token;

		if (value.token) {
			fetchSettings(value.token);
		}
	});
</script>

<!-- {#if data.isApplicationSetUp} -->
<I18n />
<div class="app">
	{#if loggedIn}
		<Navbar />
		<main>
			<slot />
		</main>
		{#key $page.url.pathname}
			<DynamicModal />
		{/key}
		<Notifications />
		<UpdateChecker />
	{:else}
		<Auth />
	{/if}
</div>
<!-- {:else} -->
<!-- <SetupRequired missingEnvironmentVariables={data.missingEnvironmentVariables} /> -->
<!-- {/if} -->
