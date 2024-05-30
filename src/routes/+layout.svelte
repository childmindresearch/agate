<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import '@cmi-dair/skeleton-themes/cmi.postcss';
	import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { AppShell, Drawer, Toast, initializeStores, storePopup } from '@skeletonlabs/skeleton';
	import '../app.postcss';

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	initializeStores();
</script>

<svelte:head>
	<title>Agate</title>
</svelte:head>

<Toast />
<Drawer width="w-64">
	<h2 class="p-4 h2">Navigation</h2>
	<hr />
	<Navigation />
</Drawer>

<AppShell slotSidebarLeft="bg-surface-500/5 w-0 md:w-64">
	<svelte:fragment slot="header">
		<Navbar />
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<Navigation />
	</svelte:fragment>
	<div class="max-w-screen-xl mx-auto mt-5 px-5 min-w-[332px]">
		<slot />
	</div>
</AppShell>
