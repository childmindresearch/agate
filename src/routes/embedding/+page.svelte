<script lang="ts">
	import { page } from '$app/stores';
	import FormPage from '$lib/components/PageTemplates/FormActionPage.svelte';
	import { downloadBlob } from '$lib/fileHandling';
	import type { SubmitFunction } from '@sveltejs/kit';

	const title = 'Embedding';
	const description = `This tool creates embeddings of text files. Please be aware that, while this tool does accept .pdf
and .docx files, their conversion to plain text may not be perfect. For best results, use a plain
text file like .txt.`;
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

<FormPage {title} {description} {enhancer} hasBusinessAssociateAgreemment>
	<input
		type="file"
		id="file"
		name="file"
		class="input max-w-64 block"
		accept=".md, .docx, .txt, .rst, .html, .pdf"
		required
		data-testid="embedding-file-input"
	/>
	<button data-testid="embedding-submit-button" type="submit" class="btn variant-filled-primary">
		Submit
	</button>
</FormPage>
