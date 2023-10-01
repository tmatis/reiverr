<script lang="ts">
	import { ChevronRight } from 'radix-icons-svelte';
	import Button from '../Button.svelte';
	import { modalStack } from '../../stores/modal.store';
	import ModalContainer from '../Modal/ModalContainer.svelte';
	import ModalContent from '../Modal/ModalContent.svelte';
	import ModalHeader from '../Modal/ModalHeader.svelte';
	import RequestModal from './RequestModal.svelte'
	import type { createSonarrSeriesStore } from '$lib/stores/data.store';
	import { get } from 'svelte/store';
	import { getMissingEpisodes, putSeries, searchAllMissingEpisodes, searchSelectedEpisodes } from '$lib/apis/sonarr/sonarrApi';

    export let modalId: symbol;
	export let sonarrSeriesStore: ReturnType<typeof createSonarrSeriesStore>;
	export let loading = false;
	export let loading_progress = 0;
	export let loading_text: string = '';

	async function addSeason(seasonNumber?: number) {
		if (!seasonNumber) {
			return;
		}
		loading = true;
		const values = get(sonarrSeriesStore).item;
		if (!values?.seasons || !values.id) {
			return;
		}
		const seasons = values.seasons.map((season) => {
			if (season.seasonNumber === seasonNumber) {
				return {
					...season,
					monitored: true
				};
			}
			return {
				...season,
				monitored: !values.monitored ? false : season.monitored
			}
		});
		loading_text = 'Adding season to Sonarr...';
		await putSeries({
			...values,
			seasons,
			monitored: true
		});
		loading_progress = 10;
		loading_text = 'Searching for seasons packs...';
		await searchAllMissingEpisodes();
		loading_progress = 60;
		const missingEpisodes = await getMissingEpisodes();
		loading_progress = 80;
		const episodeIds: number[] = [];
		missingEpisodes.forEach((episode) => {
			if (episode.id)
				episodeIds.push(episode.id);
		});
		loading_text = 'Searching for episodes...';
		await searchSelectedEpisodes(episodeIds);
		loading_progress = 100;
		await sonarrSeriesStore.refresh();
		loading_progress = 0;
		loading = false;
	}
</script>

<ModalContainer>
	<ModalHeader close={() => modalStack.close(modalId)} back={undefined} text={'Add seasons'} />
	<ModalContent>
		<div class="flex flex-col divide-y divide-zinc-700">
			{#if loading}
			<div class="px-4 py-3 flex justify-between items-center text-zinc-300 group-hover:text-zinc-300">
				<div class="font-medium">
					{loading_text}
				</div>
				<div class="flex gap-2">
					<div class="w-32 h-2 bg-zinc-700 rounded-full">
						<div class="bg-yellow-500 rounded-full absolute h-2" style="width: {loading_progress}%"></div>
					</div>
				</div>
			</div>
			{:else if !$sonarrSeriesStore.item?.seasons?.length}
				<div class="px-4 py-3 flex justify-between items-center text-zinc-300 group-hover:text-zinc-300">
					<div class="font-medium">
						No seasons found
					</div>
				</div>
			{:else}
			{#each $sonarrSeriesStore.item.seasons.filter((season) => season.seasonNumber || 0 > 0) as season}
				<div
					class="px-4 py-3 flex justify-between items-center text-zinc-300 group-hover:text-zinc-300"
				>
					<div class="font-medium">
						Season {season.seasonNumber}
					</div>
					<div class="flex gap-2">
						{#if season.monitored && $sonarrSeriesStore.item.monitored}
							<Button size="sm" type="tertiary" disabled>
								<span>Added</span><ChevronRight size={20} />
							</Button>
						{:else}
							<Button size="sm" type="tertiary" disabled={loading} on:click={() => addSeason(season.seasonNumber)}>
								<span>Add</span><ChevronRight size={20} />
							</Button>
						{/if}
					</div>
				</div>
			{/each}
			{/if}
		</div>
	</ModalContent>
</ModalContainer>

