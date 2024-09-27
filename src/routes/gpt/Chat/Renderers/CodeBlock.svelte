<script lang="ts">
	import { CodeBlock } from '@skeletonlabs/skeleton';
	import hljs from 'highlight.js';
	import { onMount } from 'svelte';

	let {
		text,
		lang,
		doNotHighlight = true
	}: { text: string; lang: string; doNotHighlight: boolean } = $props();

	onMount(() => {
		if (doNotHighlight) return;
		hljs.highlightAll();
	});
</script>

{#key text}
	<CodeBlock code={text} language={lang ? lang : 'plaintext'} />
{/key}
