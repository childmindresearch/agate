<script lang="ts">
	import { downloadBlob } from '$lib/utils';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	let text = '';
	let voice = 'onyx';
	let format = 'mp3';
	let model = 'tts-1';

	const toastStore = getToastStore();

	async function onSubmit() {
		if (!text) {
			const toast: ToastSettings = {
				message: 'Please enter some text.',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}

		const form = new FormData();
		form.append('text', text);
		form.append('voice', voice);
		form.append('format', format);
		form.append('model', model);

		await fetch('/api/text-to-speech', {
			method: 'POST',
			body: form
		})
			.then((res) => res.blob())
			.then((blob) => {
				const filename = `${text.slice(0, 20)}.${format}`;
				downloadBlob(blob, filename);
			});
	}
</script>

<svelte:head>
	<title>Agate | Text to Speech</title>
</svelte:head>

<h3 class="h3">Text to Speech</h3>
<label for="text">Text</label>
<textarea
	id="text"
	name="text"
	bind:value={text}
	placeholder="Type your text here."
	class="textarea"
/>

<label for="voice">Voice</label>
<select id="voice" name="voice" bind:value={voice} class="select">
	<option value="alloy">Alloy</option>
	<option value="echo">Echo</option>
	<option value="fable">Fable</option>
	<option value="onyx">Onyx</option>
	<option value="nova">Nova</option>
	<option value="shimmer">Shimmer</option>
</select>

<label for="format">File Format</label>
<select id="format" name="format" bind:value={format} class="select">
	<option value="mp3">mp3</option>
	<option value="opus">opus</option>
	<option value="aac">aac</option>
	<option value="flac">flac</option>
</select>

<label for="model">Quality</label>
<select id="model" name="model" bind:value={model} class="select">
	<option value="tts-1">Standard Quality</option>
	<option value="tts-1-hd">High Quality</option>
</select>

<button type="submit" class="btn variant-soft-primary" on:click={onSubmit}>Submit</button>
