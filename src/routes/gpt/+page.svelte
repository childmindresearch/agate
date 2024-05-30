<script lang="ts">
	import FormBasePage from '$lib/components/PageTemplates/FormBasePage.svelte';
	import Chat from './Chat/Chat.svelte';
	import SystemPrompt from './SystemPrompt.svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	let systemPrompt = '';
	let disableSystemPrompt = false;

	const title = 'Chatbot';
	const description =
		'To start, please fill out the instructions for the Chatbot. You can either use a pre-set, or create custom instructions.';
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
		disableSystemPrompt = true;
	}

	function endChat() {
		disableSystemPrompt = false;
	}
</script>

<div hidden={disableSystemPrompt}>
	<FormBasePage {title} {description} hasBusinessAssociateAgreemment />
	<SystemPrompt bind:systemPrompt disabled={disableSystemPrompt} />
</div>

{#if !disableSystemPrompt}
	<button class="btn variant-filled-primary" on:click={startChat}> Start Chat </button>
{/if}

{#if systemPrompt !== '' && disableSystemPrompt}
	<Chat {systemPrompt} />
{/if}

{#if disableSystemPrompt}
	<button class="btn mt-5 float-right variant-filled-error" on:click={endChat}> End Chat </button>
{/if}
