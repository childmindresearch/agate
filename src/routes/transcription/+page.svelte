<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import LoadingBar from '$lib/components/LoadingBar.svelte';
	import { downloadBlob } from '$lib/utils';
	import { whisperLanguages } from './whisperLanguages';

	let loading = false;
	let files: FileList;
	let lastFilename: string;

	const toastStore = getToastStore();

	function downloadTranscript() {
		const blob = new Blob([$page.form.text], { type: 'text/plain' });
		const filename = `${lastFilename.split('.')[0]}_transcript.txt`;
		downloadBlob(blob, filename);
	}

	$: {
		if ($page.status >= 400) {
			const toast: ToastSettings = {
				message: $page.form.message,
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
	}

	$: {
		if (!loading && $page.form && $page.form.text) {
			downloadTranscript();
		}
	}
</script>

<svelte:head>
	<title>Agate | Transcription</title>
</svelte:head>

<h3 class="h3">Transcription</h3>
<p>Transcribes an audio or video file.</p>
<hr class="!border-t-2 m-3" />

<div class="mb-2">
	<form
		method="POST"
		enctype="multipart/form-data"
		class="space-y-2"
		use:enhance={() => {
			lastFilename = files[0].name;
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}
	>
		<input
			bind:files
			class="input"
			id="file"
			name="file"
			type="file"
			accept=".aac, .avi, .flac, .flv, .m4a, .m4v, .mkv, .mov, .mp3, .mp4, .mpga, .mpeg, .ogg, .wav, .wma, .webm, .wmv, .3gp"
		/>
		<label for="language">Language</label>
		<select name="language" id="language" value={whisperLanguages['English']} class="select">
			{#each Object.entries(whisperLanguages) as [name, abbreviation]}
				<option value={abbreviation}>{name}</option>
			{/each}
		</select>
		<button type="submit" class="btn variant-soft-primary">Submit</button>
	</form>
</div>

{#if loading}
	<LoadingBar />
{/if}
