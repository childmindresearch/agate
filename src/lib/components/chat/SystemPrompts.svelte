<script lang="ts">
	// @ts-expect-error - this import is correct.
	import prompts from '$lib/assets/prompts.yaml';

	type Props = {
		onPromptSubmit: (arg0: string) => void;
	};
	let { onPromptSubmit: onPromptSubmit }: Props = $props();
	let prompt = $state('');

	function submitWithDefault() {
		if (prompt === '') {
			onPromptSubmit(prompts.system.Chat);
		} else {
			onPromptSubmit(prompt);
		}
	}
</script>

<div class="space-y-2">
	<h3 class="h3 text-center">Select a pre-written instruction.</h3>
	<div class="grid grid-cols-4 overflow-y-auto gap-2">
		{#each Object.keys(prompts.system) as title}
			<button
				class="card p-4 hover:variant-ghost-primary"
				onclick={() => onPromptSubmit(prompts.system[title])}
			>
				{title}
			</button>
		{/each}
	</div>
	<h3 class="h3 text-center">Or write your own.</h3>
	<textarea class="input" rows="12" placeholder="Custom Instructions" bind:value={prompt}>
	</textarea>
	<button onclick={submitWithDefault} class="btn variant-soft-primary"> Start Chat </button>
</div>
