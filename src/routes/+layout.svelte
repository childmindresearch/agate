<script lang="ts">
	import '../app.postcss';
	import '@cmi-dair/skeleton-themes/cmi.postcss';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { AppShell, Drawer, Toast, storePopup } from '@skeletonlabs/skeleton';
	import Navbar from '$lib/components/Navbar.svelte';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import Navigation from '$lib/components/Navigation.svelte';

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
	<div class="max-w-screen-md mx-auto mt-5 px-5 min-w-[332px]">
		<slot />
	</div>
</AppShell>
