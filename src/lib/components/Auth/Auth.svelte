<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { _ } from 'svelte-i18n';
	let username = '';
	let password = '';
	let error: string | null = null;
	async function onLogin() {
		try {
			await authStore.login(username, password);
		} catch (e: any) {
			error = e.message;
		}
	}
</script>

<!-- auth page -->
<div class="flex flex-col items-center justify-center h-screen bg-stone-900">
	<div class="flex flex-col items-center justify-center gap-4">
		<img src="/ratflix.png" alt="Logo" class="w-56" />
	</div>
	<div class="flex flex-col items-center justify-center gap-4">
		<!-- Login with username password -->
		<div class="flex flex-col items-center justify-center gap-4">
			<div class="flex flex-col items-center justify-center gap-2">
				<!-- allign to left -->
				<span class="text-stone-100 text-left font-semibold w-full text-sm">
					{$_('auth.username')}
				</span>
				<input
					type="text"
					placeholder={$_('auth.username')}
					bind:value={username}
					class="px-4 py-2 rounded-lg shadow-md bg-stone-700 text-stone-100"
				/>
				<span class="text-stone-100 text-left font-semibold w-full text-sm">
					{$_('auth.password')}
				</span>
				<input
					type="password"
					bind:value={password}
					placeholder={$_('auth.password')}
					class="px-4 py-2 rounded-lg shadow-md bg-stone-700 text-stone-100"
				/>
				<button
					on:click={onLogin}
					class="px-4 py-2 rounded-lg shadow-md bg-stone-700 text-stone-100 font-semibold hover:bg-stone-600 hover:text-stone-200"
				>
					{$_('auth.login')}
				</button>
				{#if error}
					<div class="flex flex-col items-center justify-center gap-2">
						<span
							class="text-stone-100 text-left font-semibold w-full text-sm rounded-lg bg-red-500 px-4 py-2"
						>
							{error}
						</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
