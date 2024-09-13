<script lang="ts">
	import BetaBanner from '$lib/components/banners/BetaBanner.svelte';
	import FormActionPage from '$lib/components/PageTemplates/FormActionPage.svelte';

	const title = 'Diarization (Submit)';
	const description =
		'Transcribe and diarize files. This process works in batches i.e. it may take several minutes or hours before your files are processed. Once submitted, please navigate to the Diarization retrieval page to download your results. Note that results are deleted one week after finishing.';
</script>

<BetaBanner />
<FormActionPage {title} {description} hasBusinessAssociateAgreemment>
	<svelte:fragment slot="form">
		<input
			class="input block max-w-64"
			id="files"
			name="files"
			type="file"
			accept=".aac, .avi, .flac, .flv, .m4a, .m4v, .mkv, .mov, .mp3, .mp4, .mpga, .mpeg, .ogg, .wav, .wma, .webm, .wmv, .3gp"
			data-testid="diarization-file-input"
			multiple
		/>
		<button
			data-testid="diarization-submit-button"
			type="submit"
			class="btn variant-filled-primary"
		>
			Submit
		</button>
	</svelte:fragment>
</FormActionPage>
