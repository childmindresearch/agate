<script lang="ts">
	import FormBasePage from '$lib/components/PageTemplates/FormBasePage.svelte';
	import Chat from './Chat/Chat.svelte';
	import SystemPrompt from './SystemPrompt.svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	let systemPrompt = '';
	let disableSystemPrompt = false;
	let model = 'anthropic.claude-3-5-sonnet-20240620-v1:0';

	const LLM_MODELS = [
		{
			name: 'GPT-4o',
			tag: 'gpt-4o'
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

<div hidden={disableSystemPrompt} class="space-y-2">
	<FormBasePage {title} {description} hasBusinessAssociateAgreemment />
	<SystemPrompt bind:systemPrompt disabled={disableSystemPrompt} />
	<label>
		Model
		<br />
		<select class="input w-72" bind:value={model}>
			{#each LLM_MODELS as model}
				<option value={model.tag}>{model.name}</option>
			{/each}
		</select>
	</label>
	<button class="btn variant-filled-primary" on:click={startChat}> Start Chat </button>
</div>

{#if disableSystemPrompt}
	<button class="btn mt-5 variant-filled-error" on:click={endChat}> End Chat </button>
{/if}

{#if systemPrompt !== '' && disableSystemPrompt}
	<Chat {systemPrompt} {model} />
{/if}
