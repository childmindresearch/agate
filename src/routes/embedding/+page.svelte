<script lang="ts">
	import { page } from '$app/stores';
	import { downloadBlob } from '$lib/utils';
	import FormPage from '$lib/components/PageTemplates/FormActionPage.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	const title = 'Embedding';
	const description = `
		This tool creates embeddings of text files. Please be aware that, while this tool does accept .pdf
		and .docx files, their conversion to plain text may not be perfect. For best results, use a plain
		text file like .txt.
	`;
	const enhancer: SubmitFunction = () => {
		return async ({ update }) => {
			await update();
			if ($page.status < 400) {
				const blob = new Blob([$page.form.embedding], { type: 'text/csv' });
				downloadBlob(blob, 'embedding.csv');
			}
		};
	};
</script>

<FormPage {title} {description} {enhancer}>
	<svelte:fragment slot="form">
		<label for="file">File</label>
		<input
			type="file"
			id="file"
			name="file"
			class="input"
			accept=".md, .docx, .txt, .rst, .html, .pdf"
		/>
		<label for="model">Model</label>
		<select id="model" name="model" class="select" value="text-embedding-3-small">
			<option value="text-embedding-3-small">text-embedding-3-small</option>
			<option value="text-embedding-3-large">text-embedding-3-large</option>
			<option value="text-embedding-ada-002">text-embedding-ada-002</option>
		</select>
		<button type="submit" class="btn hover:variant-filled-primary variant-soft-primary">
			Submit
		</button>
	</svelte:fragment>
</FormPage>
