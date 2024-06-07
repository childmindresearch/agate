<script lang="ts">
	import { CodeBlock } from '@skeletonlabs/skeleton';
	import hljs from 'highlight.js';
	import { onMount } from 'svelte';

	export let text = '';
	export let lang = '';
	export let doNotHighlight = true; // We highlight when all code blocks are loaded.

	onMount(() => {
		if (doNotHighlight) return;
		hljs.highlightAll();
	});
</script>

{#key text}
	<CodeBlock code={text} language={lang} />
{/key}
