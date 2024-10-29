<script lang="ts">
	// @ts-expect-error - this import is correct.
	import prompts from '$lib/assets/prompts.yaml';
	import { slide } from 'svelte/transition';
	import ChatHistory from './ChatHistory.svelte';
	import ChatInput from './ChatInput.svelte';
	import ChatMessages from './ChatMessages.svelte';
	import ChatNav from './ChatNav.svelte';
	import { type modelTags } from './constants';
	import { Chat } from './messageHandling.svelte';
	import SystemPrompts from './SystemPrompts.svelte';

	let model: modelTags = $state('anthropic.claude-3-5-sonnet-20241022-v2:0');
	let chat: Chat | null = $state(null);
	let openHistory = $state(false);

	async function onsend(content: string, files?: File[]) {
		if (!chat) {
			chat = new Chat({ systemPrompt: prompts.system.chatgpt });
		}
		await chat.addMessage('user', content, files);
		await chat.respond(model);
	}

	function onHistoryClick(oldChat: Chat) {
		chat = oldChat;
		openHistory = false;
	}
</script>

<ChatNav
	bind:llm={model}
	onNewChat={() => (chat = null)}
	onHistoryClick={() => (openHistory = !openHistory)}
/>
<div class="flex">
	{#if openHistory}
		<div transition:slide class="absolute">
			<ChatHistory onclick={onHistoryClick} />
		</div>
	{/if}
	<div class="flex-1 flex flex-col px-2">
		{#if !chat}
			<SystemPrompts onPromptSubmit={(prompt) => (chat = new Chat({ systemPrompt: prompt }))} />
		{:else}
			<div class="mb-4"><ChatMessages {chat} /></div>
			<div class="fixed bottom-2 right-0 w-full md:w-[calc(100vw-240px)] px-2">
				<ChatInput {onsend} />
			</div>
		{/if}
	</div>
</div>
