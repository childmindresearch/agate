<script lang="ts">
	import ChatBubble from './ChatBubble.svelte';
	import type { Chat } from './messageHandling.svelte';

	type Props = {
		chat: Chat;
	};
	let { chat }: Props = $props();
</script>

<div
	class="pt-2 space-y-2 overflow-y-auto min-h-[calc(100vh-280px)] max-h-[calc(100vh-280px)] bg-surface-100"
>
	{#each chat.messages as message}
		{#if message.role !== 'system'}
			<div class="px-2">
				<ChatBubble {message} />
			</div>
		{/if}
	{/each}
</div>
