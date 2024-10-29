<script lang="ts">
	import { browser } from '$app/environment';
	import { Chat } from './messageHandling.svelte';

	let { onclick }: { onclick: (chat: Chat) => void } = $props();
	let chatIds = $state(
		browser ? Object.keys({ ...localStorage }).filter((key) => key.startsWith('agate-chat')) : []
	);

	const chatOptions = chatIds
		.map((id) => {
			const chat = new Chat({ id });
			return {
				label: chat.title,
				id: chat.id,
				last_modified: chat.last_modified
			};
		})
		.sort((a, b) => b.last_modified.valueOf() - a.last_modified.valueOf());

	function onselection(option: { id: string }) {
		onclick(new Chat({ id: option.id }));
	}
</script>

<div class="p-4 overflow-y-auto max-h-[calc(100vh-260px)] border-2 bg-white">
	<ul class="w-full">
		{#each chatOptions as option}
			<li class="w-full">
				<button
					class="btn hover:variant-ghost-primary flex justify-start text-left w-full"
					onclick={() => onselection(option)}
				>
					{option.label}
				</button>
			</li>
		{/each}
	</ul>
</div>
