<script lang="ts">
	import { page } from '$app/stores';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import LoadingBar from '$lib/components/LoadingBar.svelte';

	export let title: string;
	export let description: string;
	export let isLoading = false;

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

<h3 class="h3">{title}</h3>
<p>{description}</p>
<hr class="!border-t-2 m-3" />

<slot name="form" />

<LoadingBar show={isLoading} />
