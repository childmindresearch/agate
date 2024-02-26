<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { downloadBlob } from '$lib/utils';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();
</script>

<svelte:head>
	<title>Agate | Embedding</title>
</svelte:head>

<h3 class="h3">Embedding</h3>
<p>
	This tool creates embeddings of text files. At present, it is only compatible with non-binary
	files.
</p>
<hr class="!border-t-2 m-3" />

<form
	method="POST"
	enctype="multipart/form-data"
	use:enhance={() => {
		return async ({ update }) => {
			await update();
			if ($page.status < 400) {
				const blob = new Blob([$page.form.embedding], { type: 'text/csv' });
				downloadBlob(blob, 'embedding.csv');
			} else {
				const toast = {
					message: $page.form.message,
					background: 'variant-filled-error'
				};
				toastStore.trigger(toast);
			}
		};
	}}
>
	<label for="file">File</label>
	<input
		type="file"
		id="file"
		name="file"
		class="input"
		accept=".md, .docx, .txt, .rst, .html, .pdf"
	/>
	<select name="model" class="select" value="text-embedding-3-small">
		<option value="text-embedding-3-small">text-embedding-3-small</option>
		<option value="text-embedding-3-large">text-embedding-3-large</option>
		<option value="text-embedding-ada-002">text-embedding-ada-002</option>
	</select>
	<button type="submit" class="btn hover:variant-filled-primary variant-soft-primary">Submit</button
	>
</form>
