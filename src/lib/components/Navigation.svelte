<script lang="ts">
	import { page } from '$app/stores';
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();
	const pages = [
		{ name: 'Chatbot', href: '/gpt' },
		{ name: 'Document Generation', href: '/document-generation' },
		{ name: 'Document Intelligence', href: '/document-intelligence' },
		{ name: 'Diarize (Submit)', href: '/diarize-submit' },
		{ name: 'Diarize (Retrieve)', href: '/diarize-retrieve' },
		{ name: 'Embedding', href: '/embedding' },
		{ name: 'Image Generation', href: '/dalle' },
		{ name: 'Text To Speech', href: '/text-to-speech' },
		{ name: 'Transcription', href: '/transcription' }
	];

	function drawerClose(): void {
		drawerStore.close();
	}

	let classesActive = $derived((href: string) =>
		href === $page.url.pathname ? 'bg-primary-100 dark:bg-primary-700' : ''
	);
</script>

<nav class="list-nav p-4 flex flex-col" data-testid="div-navigation">
	<ul style="flex-grow: 1;">
		{#each pages as { name, href }}
			<li>
				<a {href} class={classesActive(href)} data-testid="a-navigation" onclick={drawerClose}>
					{name}
				</a>
			</li>
		{/each}
	</ul>
</nav>
