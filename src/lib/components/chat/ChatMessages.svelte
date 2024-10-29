<script lang="ts">
	import ChatBubble from './ChatBubble.svelte';
	import type { Chat } from './messageHandling.svelte';
	import hljs from 'highlight.js';

	type Props = {
		chat: Chat;
	};
	let { chat }: Props = $props();
	let elemChat: HTMLElement | undefined = $state();

	let debounceTimeout: ReturnType<typeof setTimeout>;

	function scrollChatBottom(force: boolean = false): void {
		if (!elemChat) return;
		const isCloseToBottom =
			elemChat.scrollHeight - elemChat.scrollTop - elemChat.clientHeight < 200;
		if (!isCloseToBottom && !force) return;
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior: 'smooth' });
	}

	$effect(() => {
		void chat.messages[chat.messages.length - 1].content; //  Needed as an explicit dependency.
		const force = chat.messages[chat.messages.length - 1].role === 'user';
		scrollChatBottom(force);

		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(hljs.highlightAll, 100);
	});
</script>

<div class="pt-2 space-y-2 overflow-y-auto bg-surface-100 h-full rounded-lg" bind:this={elemChat}>
	{#each chat.messages as message}
		{#if message.role !== 'system'}
			<div class="px-2">
				<ChatBubble {message} />
			</div>
		{/if}
	{/each}
</div>
