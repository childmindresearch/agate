<script lang="ts">
	import { page } from '$app/stores';
	import FormPage from '$lib/components/PageTemplates/FormActionPage.svelte';

	const maxImages = 4;
	const title = 'Image Generation';
	const description = `
		This tool lets you create images with DALL-E 3. Simply write what you want to see and select the
		desired size and number of images.
	`;
</script>

<FormPage {title} {description}>
	<svelte:fragment slot="form">
		<label for="file">Prompt</label>
		<textarea
			id="text"
			name="text"
			class="textarea"
			rows="5"
			placeholder="Describe what you want to see..."
		/>
		<label for="size">Size</label>
		<select class="select" id="size" name="size" value="1024x1024">
			<option value="1024x1024">1024x1024</option>
			<option value="1024x1792">1024x1792</option>
			<option value="1792x1024">1792x1024</option>
		</select>
		<label for="number">Number of images</label>
		<select class="select" id="number" name="number" value={1}>
			{#each Array(maxImages) as _, i}
				<option value={i + 1}>{i + 1}</option>
			{/each}
		</select>

		<button type="submit" class="btn variant-soft-primary">Submit</button>
	</svelte:fragment>
</FormPage>

{#if $page.form && $page.form.urls}
	<div class="grid grid-cols-2 gap-4 mt-5">
		{#each $page.form.urls as url}
			<img src={url} alt="Generated from prompt" class="w-full h-auto" />
		{/each}
	</div>
{/if}
