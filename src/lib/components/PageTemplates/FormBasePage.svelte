<script lang="ts">
	import { page } from '$app/stores';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import LoadingBar from '$lib/components/LoadingBar.svelte';
	import NoBaaBanner from '$lib/components/BAA/NoBaaBanner.svelte';
	import AzureBanner from '$lib/components/BAA/AzureBanner.svelte';

	export let title: string;
	export let description: string;
	export let isLoading = false;

	export let hasBusinessAssociateAgreemment = false;

	const toastStore = getToastStore();
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
	<title>Agate | {title}</title>
</svelte:head>

{#if hasBusinessAssociateAgreemment}
	<AzureBanner />
{:else}
	<NoBaaBanner />
{/if}

<h3 class="h3">{title}</h3>
<p>{description}</p>
<hr class="!border-t-2 m-3" />

<slot name="form" />

<LoadingBar show={isLoading} />
