<script lang="ts">
	import '../app.postcss';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { AppShell, LightSwitch, Toast, modeCurrent, storePopup } from '@skeletonlabs/skeleton';
	import Navbar from '$lib/components/Navbar/Navbar.svelte';
	import { initializeStores } from '@skeletonlabs/skeleton';

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	initializeStores();

	$modeCurrent = true;
</script>

<svelte:head>
	<title>Agate</title>
</svelte:head>

<Toast />

<AppShell>
	<svelte:fragment slot="header">
		<Navbar />
	</svelte:fragment>
	<div class="max-w-screen-md mx-auto mt-5 px-5 min-w-332px">
		<slot />
	</div>
</AppShell>
<LightSwitch />

<style>
	.min-w-332px {
		min-width: 332px;
	}
</style>
