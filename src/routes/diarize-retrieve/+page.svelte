<script lang="ts">
	import HasBaaBanner from '$lib/components/banners/HasBaaBanner.svelte';
	import { downloadBlob } from '$lib/fileHandling';
	import DownloadIcon from '$lib/icons/DownloadIcon.svelte';
	import type { Transcription, TranscriptionResponse } from './types';

	export let data: TranscriptionResponse;
	async function downloadFile(transcription: Transcription) {
		const response = await fetch('/api/diarize-retrieve', {
			headers: {
				'X-Transcript-Url': transcription.links.files
			}
		});
		const blob = await response.blob();
		const fileparts = transcription.displayName.split('.');
		fileparts.pop();
		const filename = fileparts.join('') + '.json';
		downloadBlob(blob, filename);
	}
</script>

<HasBaaBanner />

<span>
	Here you may find the results of your submitted diarizations. Please note that it can take up to a
	few hours before your diarizations are completed. Diarization results are deleted after a week.
</span>

<div class="table-container">
	<table class="table table-hover">
		<thead>
			<tr>
				<th>Name</th>
				<th>Created at (UTC)</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			{#each data.values as transcription}
				<tr>
					<td>{transcription.displayName}</td>
					<td>{transcription.createdDateTime}</td>
					<td>
						{#if transcription.status === 'Succeeded'}
							<button
								class="btn btn-sm hover:variant-ghost-primary"
								on:click={() => downloadFile(transcription)}
							>
								<DownloadIcon class="text-lg" />
							</button>
						{:else}
							{transcription.status}
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
