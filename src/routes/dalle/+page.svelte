<script lang="ts">
	import FormActionPage from '$lib/components/PageTemplates/FormActionPage.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let form;

	const maxImages = 4;
	const title = 'Image Generation';
	const description = `
		This tool lets you create images with DALL-E 3. Simply write what you want to see and select the
		desired size and number of images.
	`;
	const enhancer: SubmitFunction = () => {
		return async ({ update }) => {
			await update({ reset: false });
		};
	};
</script>

<FormActionPage {title} {description} {enhancer}>
	<svelte:fragment slot="form">
		<label for="file">Prompt</label>
		<textarea
			id="text"
			data-testid="dalle-text-input"
			name="text"
			class="textarea"
			rows="5"
			placeholder="Describe what you want to see..."
			required
		/>
		<label for="quality">Quality</label>
		<select
			data-testid="dalle-quality-select"
			class="select"
			id="quality"
			name="quality"
			value="standard"
		>
			<option value="standard">Standard</option>
			<option value="hd">HD</option>
		</select>

		<label for="size">Size</label>
		<select data-testid="dalle-size-select" class="select" id="size" name="size" value="1024x1024">
			<option value="1024x1024">1024x1024</option>
			<option value="1024x1792">1024x1792</option>
			<option value="1792x1024">1792x1024</option>
		</select>
		<label for="number">Number of images</label>
		<select data-testid="dalle-n-select" class="select" id="number" name="number" value={1}>
			{#each Array(maxImages) as _, i}
				<option value={i + 1}>{i + 1}</option>
			{/each}
		</select>

		<button data-testid="dalle-submit-button" type="submit" class="btn variant-soft-primary">
			Submit
		</button>
	</svelte:fragment>
</FormActionPage>

{#if form?.urls}
	<div class="grid grid-cols-2 gap-4 mt-5">
		{#each form.urls as url, index}
			<img
				data-testid={`dalle-img-${index}`}
				src={url}
				alt="Generated from prompt"
				class="w-full h-auto"
			/>
		{/each}
	</div>
{/if}
