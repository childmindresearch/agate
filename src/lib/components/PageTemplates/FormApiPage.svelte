<script lang="ts">
	import FormBasePage from './FormBasePage.svelte';

	export let title: string;
	export let description: string;
	export let onSubmit: () => void;
	export let isLoading = false;

	export let openAiBaa = false;
	export let azureBaa = false;

	async function onSubmitLoading() {
		isLoading = true;
		await onSubmit();
		isLoading = false;
	}
</script>

<FormBasePage {title} {description} {isLoading} {azureBaa} {openAiBaa}>
	<svelte:fragment slot="form">
		<form class="space-y-2" on:submit={onSubmitLoading}>
			<slot name="form" />
			<button type="submit" class="btn variant-filled-primary"> Submit </button>
		</form>
	</svelte:fragment>
</FormBasePage>
