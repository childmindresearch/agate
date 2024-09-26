<script lang="ts">
	import { Chat } from '$lib/chat';

	export let chatIds: string[];
	export let onclick: (chat: Chat) => void;

	let searchString: string = '';

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

<input
	class="input max-h-10"
	type="search"
	name="autocomplete-search"
	placeholder="Search..."
	autocomplete="off"
	bind:value={searchString}
/>

<div class="max-h-64 p-4 overflow-y-auto border-2 bg-white">
	<ul class="w-full">
		{#each chatOptions as option}
			<li class="w-full">
				<button
					class="btn hover:variant-ghost-primary flex justify-start text-left w-full"
					on:click={() => onselection(option)}
				>
					{option.label}
				</button>
			</li>
		{/each}
	</ul>
</div>
