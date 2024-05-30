<script context="module">
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
	import { onMount } from 'svelte';

	hljs.registerLanguage('bash', bash);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('json', json);
	hljs.registerLanguage('python', python);
	hljs.registerLanguage('rust', rust);
	hljs.registerLanguage('shell', shell);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('xml', xml);
</script>

<script lang="ts">
	import { CodeBlock } from '@skeletonlabs/skeleton';

	export let text = '';
	export let lang = '';

	onMount(() => {
		hljs.highlightAll();
	});
</script>

<CodeBlock code={text} language={lang} />
