<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import LoadingBar from '$lib/components/LoadingBar.svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	let isLoading = false;

	const toastStore = getToastStore();
	const maxImages = 4;

	$: {
		if ($page.status >= 400) {
			const toast: ToastSettings = {
				message: $page.form.message,
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
	}
</script>

<svelte:head>
	<title>Agate | Image Generation</title>
</svelte:head>

<h3 class="h3">Image Generation</h3>
<form
	method="POST"
	class="space-y-2"
	use:enhance={() => {
		isLoading = true;
		return async ({ update }) => {
			await update();
			isLoading = false;
		};
	}}
>
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
</form>

{#if isLoading}
	<LoadingBar />
{:else if $page.form && $page.form.urls}
	<div class="mt-5">
		<h3 class="h3">Images</h3>
		<div class="grid grid-cols-2 gap-4">
			{#each $page.form.urls as url}
				<img src={url} alt="Generated from prompt" class="w-full h-auto" />
			{/each}
		</div>
	</div>
{/if}
