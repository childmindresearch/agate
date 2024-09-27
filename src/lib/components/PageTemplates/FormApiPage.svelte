<script lang="ts">
	import type { Snippet } from 'svelte';
	import FormBasePage from './FormBasePage.svelte';

	let {
		title,
		description,
		onSubmit,
		children,
		hasBusinessAssociateAgreemment = false,
		isLoading = $bindable(false)
	}: {
		title: string;
		description: string;
		onSubmit: () => Promise<void>;
		children: Snippet;
		hasBusinessAssociateAgreemment?: boolean;
		isLoading?: boolean;
	} = $props();

	async function onSubmitLoading() {
		isLoading = true;
		await onSubmit();
		isLoading = false;
	}
</script>

<FormBasePage {title} {description} {isLoading} {hasBusinessAssociateAgreemment}>
	<form class="space-y-2" onsubmit={onSubmitLoading}>
		{@render children()}
		<button type="submit" class="btn variant-filled-primary" data-testid="form-api-page-button">
			Submit
		</button>
	</form>
</FormBasePage>
