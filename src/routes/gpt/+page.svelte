<script lang="ts">
	import Chat from './Chat.svelte';
	import SystemPrompt from './SystemPrompt.svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	export let data;

	let systemPrompt = '';
	let disableSystemPrompt = false;

	const toastStore = getToastStore();

	function onClick() {
		if (disableSystemPrompt) {
			endChat();
		} else {
			startChat();
		}
	}

	function startChat() {
		if (systemPrompt === '') {
			const noPromptToast: ToastSettings = {
				message: 'Please select or write a system prompt.',
				background: 'variant-filled-warning'
			};
			toastStore.trigger(noPromptToast);
			return;
		}
		disableSystemPrompt = true;
	}

	function endChat() {
		disableSystemPrompt = false;
	}
</script>

<SystemPrompt presets={data.systemPrompts} bind:systemPrompt disabled={disableSystemPrompt} />
<button class="btn variant-soft-primary" on:click={onClick}>
	{#if disableSystemPrompt}
		End Chat
	{:else}
		Start Chat
	{/if}
</button>

{#if systemPrompt !== '' && disableSystemPrompt}
	<Chat {systemPrompt} />
{/if}
