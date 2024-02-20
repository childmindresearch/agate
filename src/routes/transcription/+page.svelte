<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import LoadingBar from '$lib/components/LoadingBar.svelte';
	import { downloadBlob } from '$lib/utils';

	let loading = false;

	const toastStore = getToastStore();

	function downloadTranscript() {
		const blob = new Blob([$page.form.text], { type: 'text/plain' });
		downloadBlob(blob, 'transcript.txt');
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
</script>

<svelte:head>
	<title>Agate | Transcription</title>
</svelte:head>

<h3 class="h3">Transcription</h3>
<div class="mb-2">
	<form
		method="POST"
		enctype="multipart/form-data"
		class="space-y-2"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}
	>
		<label for="file">Transcribe an audio file.</label>
		<input class="input" id="file" name="file" type="file" />
		<label for="language">Language</label>
		<select id="language" value="en" class="select">
			<option value="en">English</option>
			<option value="fr">French</option>
			<option value="de">German</option>
			<option value="es">Spanish</option>
		</select>
		<button type="submit" class="btn variant-soft-primary">Submit</button>
	</form>
</div>

{#if loading}
	<LoadingBar />
{:else if $page.status < 400 && $page.form}
	<h4 class="h4">Transcript</h4>
	<textarea class="textarea" rows="10" value={$page.form.text} readonly />
	<button on:click={downloadTranscript} class="btn variant-soft-primary">Download</button>
{/if}
