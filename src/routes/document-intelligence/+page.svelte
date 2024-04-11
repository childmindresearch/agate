<script lang="ts">
	import { page } from '$app/stores';
	import { downloadBlob } from '$lib/utils';
	import FormActionPage from '$lib/components/PageTemplates/FormActionPage.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let file: string;
	const title = 'Document Intelligence';
	const description = `
		This tool can parse the text in a variety of documents. Simply upload a file containing typed or handwritten text, 
        and the tool will return the text in a Word document.
	`;

	const enhancer: SubmitFunction = () => {
		return async ({ update }) => {
			await update();
			if ($page.status < 400) {
				const blob = new Blob([$page.form.text], { type: 'text/plain' });
				const filename = file.split('\\').pop()?.split('.')?.slice(0, -1).join('.') + '.txt';
				downloadBlob(blob, filename);
			}
		};
	};
</script>

<FormActionPage {title} {description} {enhancer} azureBaa>
	<svelte:fragment slot="form">
		<label for="file">File</label>
		<input
			type="file"
			id="file"
			name="file"
			class="input"
			accept=".pdf, .jpg, .jpeg, .png, .bmp, .tiff, .heif, .docx, .xlsx, .pptx, .html"
			required
			data-testid="document-intelligence-file-input"
			bind:value={file}
		/>
		<button
			data-testid="document-intelligence-submit-button"
			type="submit"
			class="btn variant-filled-primary"
		>
			Submit
		</button>
	</svelte:fragment>
</FormActionPage>
