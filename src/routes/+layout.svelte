<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import '@cmi-dair/skeleton-themes/cmi.postcss';
	import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { Drawer, Toast, initializeStores, storePopup } from '@skeletonlabs/skeleton';

	import hljs from 'highlight.js/lib/core';
	import bash from 'highlight.js/lib/languages/bash';
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import json from 'highlight.js/lib/languages/json';
	import python from 'highlight.js/lib/languages/python';
	import rust from 'highlight.js/lib/languages/rust';
	import shell from 'highlight.js/lib/languages/shell';
	import typescript from 'highlight.js/lib/languages/typescript';
	import xml from 'highlight.js/lib/languages/xml';
	import 'highlight.js/styles/github.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	hljs.registerLanguage('bash', bash);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('json', json);
	hljs.registerLanguage('python', python);
	hljs.registerLanguage('rust', rust);
	hljs.registerLanguage('shell', shell);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('xml', xml);

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

<div class="grid grid-rows-[4rem_auto] min-h-screen">
	<Navbar />
	<div class="grid md:grid-cols-[15rem_auto]">
		<div class="h-max w-max md:flex hidden">
			<Navigation />
		</div>
		<div class="px-5 mt-5 w-auto min-w-[332px] min-h-[90%]">
			{@render children()}
		</div>
	</div>
</div>
