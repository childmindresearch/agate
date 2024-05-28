<script lang="ts">
	import { downloadBlob } from '$lib/fileHandling';
	import FormApiPage from '$lib/components/PageTemplates/FormApiPage.svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';

	let files: FileList;
	const title = 'Document Intelligence';
	const description = `
		This tool can parse the text in a variety of documents. Simply upload a file containing typed or handwritten text, 
        and the tool will return the text in a Word document.
	`;

	const toastStore = getToastStore();

	async function onSubmit() {
		if (!files) {
			const toast = {
				message: 'Please select a file to upload.',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
			return;
		}

		const file = files[0];
		const formData = new FormData();
		formData.append('file', file);
		const response = await fetch('/api/document-intelligence', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			const text = await response.text();
			const blob = new Blob([text], { type: 'text/plain' });
			const filename = file.name.split('\\').pop()?.split('.')?.slice(0, -1).join('.') + '.txt';
			downloadBlob(blob, filename);
		} else {
			const toast = {
				message:
					'Something went wrong while processing the document. Please try again. If the problem persists, please contact support.',
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
	}
</script>

<FormApiPage {title} {description} {onSubmit} hasBusinessAssociateAgreemment>
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
			bind:files
		/>
	</svelte:fragment>
</FormApiPage>
