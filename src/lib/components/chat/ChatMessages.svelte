<script lang="ts">
	import ChatBubble from './ChatBubble.svelte';
	import type { Chat } from './messageHandling.svelte';

	type Props = {
		chat: Chat;
	};
	let { chat }: Props = $props();
	let elemChat: HTMLElement | undefined = $state();

	function scrollChatBottom(force: boolean = false): void {
		if (!elemChat) return;
		const isCloseToBottom =
			elemChat.scrollHeight - elemChat.scrollTop - elemChat.clientHeight < 200;
		if (!isCloseToBottom && !force) return;
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior: 'smooth' });
	}

	$effect(() => {
		chat.messages[chat.messages.length - 1].content; // Needed as an explicit dependency.
		const force = chat.messages[chat.messages.length - 1].role === 'user';
		scrollChatBottom(force);
	});
</script>

<div
	class="pt-2 space-y-2 overflow-y-auto min-h-[calc(100vh-280px)] max-h-[calc(100vh-280px)] bg-surface-100"
	bind:this={elemChat}
>
	{#each chat.messages as message}
		{#if message.role !== 'system'}
			<div class="px-2">
				<ChatBubble {message} />
			</div>
		{/if}
	{/each}
</div>
