<script lang="ts">
	import { page } from '$app/stores';
	import FormActionPage from '$lib/components/PageTemplates/FormActionPage.svelte';
	import { downloadBlob } from '$lib/fileHandling';
	import { whisperLanguages } from './whisperLanguages';
	import type { SubmitFunction } from '@sveltejs/kit';

	const title = 'Transcription';
	const description = 'Transcribes an audio or video file.';
	const enhancer: SubmitFunction = ({ formData }) => {
		return async ({ update }) => {
			await update();
			if ($page.status < 400) {
				const inputFilename = (formData.get('file') as File)?.name;
				const filename = inputFilename.split('.').slice(0, -1).join('.') + '_transcript.txt';
				const blob = new Blob([$page.form.text], { type: 'text/plain' });
				downloadBlob(blob, filename);
			}
		};
	};
</script>

<FormActionPage {title} {description} {enhancer}>
	<svelte:fragment slot="form">
		<input
			class="input"
			id="file"
			name="file"
			type="file"
			accept=".aac, .avi, .flac, .flv, .m4a, .m4v, .mkv, .mov, .mp3, .mp4, .mpga, .mpeg, .ogg, .wav, .wma, .webm, .wmv, .3gp"
			data-testid="transcription-file-input"
		/>
		<label for="language">Language</label>
		<select name="language" id="language" value={whisperLanguages['English']} class="select">
			{#each Object.entries(whisperLanguages) as [name, abbreviation]}
				<option value={abbreviation}>{name}</option>
			{/each}
		</select>
		<button
			data-testid="transcription-submit-button"
			type="submit"
			class="btn variant-filled-primary"
		>
			Submit
		</button>
	</svelte:fragment>
</FormActionPage>
