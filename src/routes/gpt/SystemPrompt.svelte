<script lang="ts">
	// @ts-expect-error - this import is correct.
	import prompts from '$lib/assets/prompts.yaml';

	export let systemPrompt: string = '';
	export let disabled: boolean = false;

	function capitalizeFirstLetter(string: string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
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

<select value={null} class="select" on:change={onSelectionChange} {disabled}>
	<option value={null}>Select a system prompt</option>
	{#each Object.keys(prompts.system) as name}
		<option value={name}>{capitalizeFirstLetter(name)}</option>
	{/each}
</select>

<label class="label">
	<h4 class="h4">System Prompt</h4>
	<textarea
		class="textarea"
		rows="8"
		placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
		bind:value={systemPrompt}
		{disabled}
	/>
</label>
