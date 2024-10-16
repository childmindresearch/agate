<script lang="ts">
	// @ts-expect-error - this import is correct.
	import prompts from '$lib/assets/prompts.yaml';

	let { systemPrompt = $bindable('') }: { systemPrompt: string } = $props();

	function formatPromptTitle(string: string) {
		return (string.charAt(0).toUpperCase() + string.slice(1)).replaceAll('-', ' ');
	}

	function onSelectionChange(e: Event) {
		if (e.target === null) {
			systemPrompt = '';
			return;
		}
		const target = e.target as HTMLSelectElement;
		const promptName = target.value;
		systemPrompt = prompts.system[promptName];
	}
</script>

<select value={null} class="select" onchange={onSelectionChange}>
	<option value={null}>Select a system prompt</option>
	{#each Object.keys(prompts.system) as name}
		<option value={name}>{formatPromptTitle(name)}</option>
	{/each}
</select>

<label class="label">
	<h4 class="h4">System Prompt</h4>
	<textarea
		class="textarea"
		rows="8"
		placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
		bind:value={systemPrompt}
	></textarea>
</label>
