<script lang="ts">
	import { page } from '$app/stores';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import LoadingBar from '$lib/components/LoadingBar.svelte';
	import NoBaaBanner from '$lib/components/banners/NoBaaBanner.svelte';
	import HasBaaBanner from '$lib/components/banners/HasBaaBanner.svelte';
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		hasBusinessAssociateAgreemment,
		children,
		isLoading = $bindable(false)
	}: {
		title: string;
		description: string;
		hasBusinessAssociateAgreemment: boolean;
		children?: Snippet;
		isLoading?: boolean;
	} = $props();

	const toastStore = getToastStore();
	$effect(() => {
		if ($page.status >= 400) {
			const toast: ToastSettings = {
				message: $page.form.message,
				background: 'variant-filled-error'
			};
			toastStore.trigger(toast);
		}
	});
</script>

<svelte:head>
	<title>Agate | {title}</title>
</svelte:head>

{#if hasBusinessAssociateAgreemment}
	<HasBaaBanner />
{:else}
	<NoBaaBanner />
{/if}

<h3 class="h3">{title}</h3>
<p>{description}</p>

{@render children?.()}

<LoadingBar show={isLoading} />
