<script lang="ts">
	import SystemPrompt from './SystemPrompt.svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	export let data;

	let systemPrompt = '';
	let disableSystemPrompt = false;

	const toastStore = getToastStore();

	const noPromptToast: ToastSettings = {
		message: 'Please select or write a system prompt.',
		background: 'variant-filled-warning'
	};

	function startChat() {
		if (systemPrompt === '') {
			toastStore.trigger(noPromptToast);
			return;
		}
		disableSystemPrompt = true;
	}
</script>

<SystemPrompt presets={data.systemPrompts} bind:systemPrompt disabled={disableSystemPrompt} />
<button class="btn variant-soft-primary" on:click={startChat} disabled={disableSystemPrompt}
	>Start Chat</button
>
