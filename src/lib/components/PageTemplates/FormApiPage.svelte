<script lang="ts">
	import FormBasePage from './FormBasePage.svelte';

	export let title: string;
	export let description: string;
	export let onSubmit: () => void;
	export let isLoading = false;

	async function onSubmitLoading() {
		isLoading = true;
		await onSubmit();
		isLoading = false;
	}
</script>

<FormBasePage {title} {description} {isLoading}>
	<svelte:fragment slot="form">
		<form class="space-y-2">
			<slot name="form" />
			<button type="submit" class="btn variant-soft-primary" on:click={onSubmitLoading}>
				Submit
			</button>
		</form>
	</svelte:fragment>
</FormBasePage>
