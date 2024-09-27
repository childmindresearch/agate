<script lang="ts">
	import FormBasePage from '$lib/components/PageTemplates/FormBasePage.svelte';
	import { Chat } from '$lib/chat.svelte';
	import ChatInterface from './Chat/ChatInterface.svelte';
	import SystemPrompt from './SystemPrompt.svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { browser } from '$app/environment';
	import ChatHistory from './ChatHistory.svelte';

	let systemPrompt = $state('');
	let model = $state('anthropic.claude-3-5-sonnet-20240620-v1:0');
	let chat: Chat | null = $state(null);

	let priorChats = $state(
		browser ? Object.keys({ ...localStorage }).filter((key) => key.startsWith('agate-chat')) : []
	);

	const LLM_MODELS = [
		{
			name: 'GPT-4o',
			tag: 'gpt-4o'
		},
		{
			name: 'GPT-o1',
			tag: 'o1-preview'
		},
		{
			name: 'Claude 3 Opus',
			tag: 'anthropic.claude-3-opus-20240229-v1:0'
		},
		{
			name: 'Claude 3.5 Sonnet',
			tag: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
		}
	];

	const title = 'Chatbot';
	const description =
		'To start, please select a previous chat or fill out the instructions for the Chatbot. You can either use a pre-set instruction, or create custom instructions. Please be aware, your chat history is stored locally on your device.';
	const toastStore = getToastStore();

	function startChat() {
		if (systemPrompt === '') {
			const noPromptToast: ToastSettings = {
				message: 'Please select or write a system prompt.',
				background: 'variant-filled-warning'
			};
			toastStore.trigger(noPromptToast);
			return;
		}
		chat = new Chat({ systemPrompt });
	}

	function restartChat(c: Chat) {
		chat = c;
	}

	function endChat() {
		chat = null;
		priorChats = Object.keys({ ...localStorage }).filter((key) => key.startsWith('agate-chat'));
	}
</script>

<div hidden={chat !== null} class="space-y-2">
	<FormBasePage {title} {description} hasBusinessAssociateAgreemment />
	<div class="grid grid-cols-2 gap-4">
		<div>
			<p class="h4">Create a new chat.</p>
			<SystemPrompt bind:systemPrompt />
			<label>
				Model
				<br />
				<select class="input w-72" bind:value={model}>
					{#each LLM_MODELS as model}
						<option value={model.tag}>{model.name}</option>
					{/each}
				</select>
			</label>
		</div>
		<div>
			<p class="h4">Continue a previous chat.</p>
			{#key priorChats}
				<ChatHistory chatIds={priorChats} onclick={restartChat} />
			{/key}
		</div>
	</div>
	<button class="btn variant-filled-primary" onclick={startChat}> Start Chat </button>
</div>

{#if chat !== null}
	<ChatInterface {chat} {model} onclose={endChat} />
{/if}
