<script lang="ts">
	import BaseBanner from '$lib/components/banners/BaseBanner.svelte';
	import FormActionPage from '$lib/components/PageTemplates/FormActionPage.svelte';

	const title = 'Diarization (Submit)';
	const description =
		'Transcribe and diarize files. This process works in batches i.e. it may take several minutes or hours before your files are processed. Once submitted, please navigate to the Diarization retrieval page to download your results. Note that results are deleted one week after finishing.';
</script>

<BaseBanner
	title={'Known Bug'}
	message={'There is a known bug where large files will crash the server and result in a JSON decode error. A fix is in the works.'}
	variant="error"
/>
<FormActionPage {title} {description} hasBusinessAssociateAgreemment>
	<input
		class="input block max-w-64"
		id="files"
		name="files"
		type="file"
		accept=".aac, .avi, .flac, .flv, .m4a, .m4v, .mkv, .mov, .mp3, .mp4, .mpga, .mpeg, .ogg, .wav, .wma, .webm, .wmv, .3gp"
		data-testid="diarization-file-input"
		multiple
	/>
	<button data-testid="diarization-submit-button" type="submit" class="btn variant-filled-primary">
		Submit
	</button>
</FormActionPage>
