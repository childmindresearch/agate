<script lang="ts">
	import Chat from './Chat.svelte';
	import SystemPrompt from './SystemPrompt.svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { fade } from 'svelte/transition';

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

<svelte:head>
	<title>Agate | Chatbot</title>
</svelte:head>
<h3 class="h3">Chatbot</h3>

<p>
	To start, please fill out the instructions for the Chatbot. You can either use a pre-set, or
	create custom instructions.
</p>
<hr class="!border-t-2 m-3" />
<div transition:fade hidden={disableSystemPrompt}>
	<SystemPrompt presets={data.systemPrompts} bind:systemPrompt disabled={disableSystemPrompt} />
</div>
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
